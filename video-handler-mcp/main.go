// Copyright 2025 The Go MCP SDK Authors. All rights reserved.
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file.

package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
	"video-handler-mcp/model"
	"video-handler-mcp/service"
	"video-handler-mcp/util"

	"github.com/mark3labs/mcp-go/mcp"
)

var kafkaService *service.KafkaService
var transactions sync.Map

const TransactionSaveTimeout = time.Second * 300

func init() {
	kafkaService = service.NewKafkaService(util.ApiConfig.KafkaBrokers, util.ApiConfig.KafkaGroupId)
}

func main() {
	go KafkaListen(util.ApiConfig.GifTopic, GifProcess)
	go KafkaListen(util.ApiConfig.CutTopic, CutProcess)

	mcpServer := service.NewMcpServerService(util.ApiConfig.Port, "video-mcp-server", "1.0.0")
	mcpServer.AddTool("video.createGif", "Video to create GIF", prepareInputSchema(), CreateGif)
	mcpServer.AddTool("video.cutVideo", "Cut the video", prepareInputSchema(), CutVideo)

	go func() {
		err := mcpServer.Start("/mcp")
		if err != nil {
			log.Fatal(err)
		}
	}()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	log.Println("Closing HTTP server...")
	mcpServer.Close()
}

func CreateGif(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return ProcessMcp(util.ApiConfig.GifTopic, ctx, req.Params.Arguments)
}

func CutVideo(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	return ProcessMcp(util.ApiConfig.CutTopic, ctx, req.Params.Arguments)
}

func ProcessMcp(topic string, ctx context.Context, args any) (*mcp.CallToolResult, error) {
	params, err := ParseVideoParams(args)
	if err != nil {
		log.Println("Parse video params error. Args:", args, "Error:", err)
		return McpResponse("nok", err)
	}

	_, ok := transactions.Load(params.TransactionID)
	if ok {
		log.Println("Duplicate transaction id:", params.TransactionID)
		return McpResponse("duplicate", errors.New("duplicate"))
	}

	transactions.Store(params.TransactionID, time.Now())
	time.AfterFunc(TransactionSaveTimeout, func() {
		transactions.Delete(params.TransactionID)
	})

	err = kafkaService.ProduceAny(topic, params)
	if err != nil {
		return McpResponse("nok", err)
	}
	videoStatus := util.McpResponseDTO{TransactionId: params.TransactionID, Status: util.InProgress}
	log.Println("Video status", videoStatus)
	err = kafkaService.ProduceAny(util.ApiConfig.StatusTopic, videoStatus)
	if err != nil {
		return McpResponse("nok", err)
	}

	return McpResponse("ok", nil)
}

func McpResponse(text string, err error) (*mcp.CallToolResult, error) {
	return &mcp.CallToolResult{
		Content: []mcp.Content{
			mcp.TextContent{
				Type: "text",
				Text: text,
			},
		},
	}, err
}

func ParseVideoParams(args any) (*model.VideoRequest, error) {
	data, err := util.DecodeAny[model.VideoRequest](args)
	if err != nil {
		log.Println("Decode video params error. Args:", args, "Error:", err)
		return nil, err
	}
	return data, nil

}

func KafkaListen(consumeTopic string, callback func([]byte)) {
	limit := make(chan int, util.ApiConfig.QueueConcurrency)
	log.Printf("Kafka %s topic listening...\n", consumeTopic)
	kafkaService.Consume(consumeTopic, func(message []byte) {
		limit <- 1
		go func() {
			callback(message)
			<-limit
		}()
	})
	close(limit)
}

func GifProcess(data []byte) {
	now := time.Now()
	log.Println("Video to gif process starter", string(data))
	var videReq model.VideoRequest
	_ = json.Unmarshal(data, &videReq)
	CommonProcess(&videReq, util.GifProcess)
	log.Println("Video to gif process finished. Elapsed", time.Since(now))
}

func CutProcess(data []byte) {
	now := time.Now()
	log.Println("Cut the process starter", string(data))
	var videReq model.VideoRequest
	_ = json.Unmarshal(data, &videReq)
	CommonProcess(&videReq, util.CutProcess)
	log.Println("Cut the process finished. Elapsed", time.Since(now))
}

func CommonProcess(videoReq *model.VideoRequest, processType string) {
	s := service.BuildVideoProcess(videoReq, processType)
	videoMcp := model.VideoMcp{TransactionID: videoReq.TransactionID, Status: util.Success}
	err := s.Process()
	if err != nil {
		log.Println("Process error. Error:", err, " TransactionID:", videoReq.TransactionID)
		log.Println("Video Params:", videoReq)
		videoMcp.Status = util.VideoError
		videoMcp.Message = map[string]any{"message": err.Error()}
		_ = kafkaService.ProduceAny(util.ApiConfig.StatusTopic, videoMcp)
		return
	}
	videoMcp.OutputPath = s.Output()
	_ = kafkaService.ProduceAny(util.ApiConfig.StatusTopic, videoMcp)
}

func prepareInputSchema() mcp.ToolInputSchema {
	return mcp.ToolInputSchema{
		Type: "object",
		Properties: map[string]any{
			"videoPath": map[string]any{
				"type":        "string",
				"description": "Video Path",
			},
			"transactionId": map[string]any{
				"type":        "string",
				"description": "Transaction ID",
			},
			"isUrl": map[string]any{
				"type":        "boolean",
				"description": "Optional system prompt to provide context",
			},
			"start": map[string]any{
				"type":        "any",
				"description": "Start time",
			},
			"end": map[string]any{
				"type":        "any",
				"description": "End time",
			},
		},
		Required: []string{"videoPath", "transactionId", "isUrl", "start", "end"},
	}
}

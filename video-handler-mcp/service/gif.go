package service

import (
	"os"
	"video-handler-mcp/model"
	"video-handler-mcp/util"
)

type GifService struct {
	video   *model.VideoRequest
	storage Storage
	output  string
}

func NewGifService(video *model.VideoRequest) *GifService {
	gifService := &GifService{
		video:   video,
		storage: NewStorage(video.IsUrl),
	}
	return gifService
}

func (g *GifService) Process() error {
	video, err := g.storage.GetFile(g.video.GetPathOrUrl())
	if err != nil {
		return err
	}
	filename := util.UUID() + ".mp4"
	if !g.video.IsUrl {
		_, filename, _ = util.ParsePath(g.video.GetPathOrUrl())
	}

	filePath, err := SaveFile(video, filename)

	if err != nil {
		return err
	}

	defer util.DeleteFile(filePath)
	ffs := NewFfmpegService(g.video.TransactionID)

	gifPath, err := ffs.GifProcess(filePath, util.AnyToInt(g.video.Start), util.AnyToInt(g.video.End))
	if err != nil {
		return err
	}

	defer util.DeleteFile(gifPath)

	body, err := os.ReadFile(gifPath)
	if err != nil {
		return util.NewError("Error reading video file. Path:%s Err:%v", gifPath, err)
	}

	_, gifName, _ := util.ParsePath(gifPath)
	fullPath := util.ApiConfig.OutputPath + "/" + gifName
	err = g.storage.PutFile(fullPath, body)

	if err != nil {
		return err
	}

	g.output = fullPath

	return nil
}

func (c *GifService) Output() string {
	return c.output
}

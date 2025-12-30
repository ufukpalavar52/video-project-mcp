package service

import (
	"os"
	"time"
	"video-handler-mcp/model"
	"video-handler-mcp/util"
)

type CutVideoService struct {
	video   *model.VideoRequest
	storage Storage
	expires *time.Time
	output  string
}

func NewCutVideoService(video *model.VideoRequest) *CutVideoService {
	cropService := &CutVideoService{
		video:   video,
		storage: NewStorage(video.IsUrl),
	}
	return cropService
}

func (c *CutVideoService) Process() error {
	video, err := c.storage.GetFile(c.video.GetPathOrUrl())
	if err != nil {
		return err
	}
	filename := util.UUID() + ".mp4"
	if !c.video.IsUrl {
		_, filename, _ = util.ParsePath(c.video.VideoPath)
	}

	filePath, err := SaveFile(video, filename)

	if err != nil {
		return err
	}

	defer util.DeleteFile(filePath)
	ffs := NewFfmpegService(c.video.TransactionID)

	cutPath, err := ffs.CutVideo(filePath, util.AnyToInt(c.video.Start), util.AnyToInt(c.video.End))

	if err != nil {
		return err
	}
	defer util.DeleteFile(cutPath)

	body, err := os.ReadFile(cutPath)
	if err != nil {
		return util.NewError("Error reading video file. Path:%s Err:%v", cutPath, err)
	}

	_, videoName, _ := util.ParsePath(cutPath)
	fullPath := util.ApiConfig.OutputPath + "/" + videoName
	err = c.storage.PutFile(fullPath, body)

	if err != nil {
		return err
	}

	c.output = fullPath
	return nil
}

func (c *CutVideoService) Output() string {
	return c.output
}

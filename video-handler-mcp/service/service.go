package service

import (
	"video-handler-mcp/model"
	"video-handler-mcp/util"
)

const MB = 1024 * 1024
const Video240Scale = 240
const Video360Scale = 360
const Video480Scale = 480
const GifFps = 15

type Storage interface {
	GetFile(string) ([]byte, error)
	PutFile(string, []byte) error
}

type VideoProcess interface {
	Process() error
	Output() string
}

func NewStorage(isUrl bool) Storage {
	storage := NewS3Service()
	if isUrl {
		return NewUrlService(storage)
	}

	return storage
}

func BuildVideoProcess(video *model.VideoRequest, processType string) VideoProcess {
	if processType == util.CutProcess {
		return NewCutVideoService(video)
	}
	return NewGifService(video)
}

func SaveFile(data []byte, filename string) (string, error) {
	fullPath := util.ApiConfig.TmpPath + "/" + filename
	err := util.SaveFile(fullPath, data)
	if err != nil {
		return "", err
	}
	return fullPath, nil
}

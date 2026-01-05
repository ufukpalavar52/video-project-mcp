package model

import "video-handler-mcp/util"

type VideoMcp struct {
	TransactionID string `json:"transactionId"`
	Message       any    `json:"message"`
	Status        string `json:"status"`
	OutputPath    string `json:"outputPath"`
}

type VideoRequest struct {
	TransactionID string        `json:"transactionId"`
	IsUrl         util.FlexBool `json:"isUrl"`
	VideoPath     string        `json:"videoPath"`
	Start         any           `json:"start"`
	End           any           `json:"end"`
}

func (vr *VideoRequest) CheckIsUrl() bool {
	return bool(vr.IsUrl)
}

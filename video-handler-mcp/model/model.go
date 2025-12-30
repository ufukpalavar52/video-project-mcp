package model

type VideoMcp struct {
	TransactionID string `json:"transactionId"`
	Message       any    `json:"message"`
	Status        string `json:"status"`
	OutputPath    string `json:"outputPath"`
}

type VideoRequest struct {
	TransactionID string `json:"transactionId"`
	IsUrl         bool   `json:"isUrl"`
	VideoPath     string `json:"videoPath"`
	Start         any    `json:"start"`
	End           any    `json:"end"`
}

func (vr *VideoRequest) GetPathOrUrl() string {
	return vr.VideoPath
}

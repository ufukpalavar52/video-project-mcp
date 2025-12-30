package util

type McpResponseDTO struct {
	TransactionId string `json:"transactionId"`
	Message       string `json:"message"`
	Status        string `json:"status"`
}

package util

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type AppConfig struct {
	AppSecretKey     string
	Port             string
	KafkaBrokers     []string
	KafkaGroupId     string
	GifTopic         string
	CutTopic         string
	StatusTopic      string
	QueueConcurrency int
	OutputPath       string
	TmpPath          string
}

type AppS3Config struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Region    string
	Expires   int
}

var ApiConfig AppConfig
var S3Config AppS3Config

func init() {
	initApiConfig()
	initS3Config()
}

func initApiConfig() {
	kafkaPort := GetEnv("KAFKA_PORT", "9092")
	kafkaBroker := GetEnv("KAFKA_BROKERS", fmt.Sprintf("kafka:%s", kafkaPort))

	queueConcurrency := GetEnvInt("QUEUE_CONCURRENCY", 5)

	ApiConfig = AppConfig{
		AppSecretKey:     GetEnv("APP_SECRET_KEY"),
		Port:             GetEnv("VIDEO_HANDLER_PORT", "3333"),
		KafkaBrokers:     strings.Split(kafkaBroker, ","),
		KafkaGroupId:     GetEnv("KAFKA_GROUP_ID", "video-handler-kafka-group"),
		GifTopic:         GetEnv("GIF_TOPIC", "gif-tasks"),
		CutTopic:         GetEnv("CUT_TOPIC", "cut-tasks"),
		StatusTopic:      GetEnv("STATUS_QUEUE", "status-tasks"),
		QueueConcurrency: queueConcurrency,
		OutputPath:       GetEnv("VIDEO_GIF_OUTPUT_PATH", "video-gif"),
		TmpPath:          GetEnv("TMP_VIDEO_PATH", "/tmp-video-file"),
	}
}

func initS3Config() {
	S3Config = AppS3Config{
		Endpoint:  GetEnv("S3_ENDPOINT"),
		AccessKey: GetEnv("S3_ACCESS_KEY"),
		SecretKey: GetEnv("S3_SECRET_KEY"),
		Region:    GetEnv("S3_REGION", "us-east-1"),
		Expires:   GetEnvInt("S3_EXPIRES", 7),
	}
}

func GetEnv(key string, fallback ...string) string {
	value := os.Getenv(key)
	if value != "" {
		return value
	}

	if len(fallback) > 0 {
		return fallback[0]
	}
	return ""
}

func GetEnvInt(key string, fallback ...int) int {
	value := GetEnv(key)
	number, err := strconv.Atoi(value)
	if err != nil {
		if len(fallback) > 0 {
			return fallback[0]
		}
		return 0
	}

	if number == 0 && value != "0" && len(fallback) > 0 {
		return fallback[0]
	}

	return number
}

package util

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

func JsonEncode(data any) []byte {
	jsonData, _ := json.Marshal(data)
	return jsonData
}

func NewError(format string, params ...any) error {
	return fmt.Errorf(format, params...)
}

func UUID() string {
	return uuid.New().String()
}

func ParsePath(pathStr string) (string, string, error) {
	pathArr := strings.Split(strings.TrimLeft(pathStr, "/"), "/")

	if len(pathArr) < 2 {
		return "", "", errors.New("invalid path")
	}

	fileName := pathArr[len(pathArr)-1]
	path := strings.Join(pathArr[:len(pathArr)-1], "/")
	return path, fileName, nil
}

func SaveFile(fullPath string, data []byte) error {
	file, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(data)
	if err != nil {
		return err
	}

	return nil
}

func DeleteFile(filePath string) {
	err := os.Remove(filePath)
	if err != nil {
		log.Println("Delete File Error:", err)
	}
}

func StrToInt(str string) int {
	number, err := strconv.Atoi(str)
	if err != nil {
		return 0
	}
	return number
}

func AnyToInt(data any) int {
	return StrToInt(fmt.Sprintf("%v", data))
}

func DecodeAny[T any](v any) (*T, error) {
	var out T

	switch val := v.(type) {

	case []byte:
		err := json.Unmarshal(val, &out)
		return &out, err

	case string:
		// string JSON ise
		err := json.Unmarshal([]byte(val), &out)
		return &out, err

	case map[string]any:
		b, err := json.Marshal(val)
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal(b, &out)
		return &out, err

	default:
		return nil, fmt.Errorf("unsupported type: %T", v)
	}
}

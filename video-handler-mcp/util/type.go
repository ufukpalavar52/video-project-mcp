package util

import "strings"

type FlexBool bool

func (fb *FlexBool) UnmarshalJSON(data []byte) error {
	s := string(data)

	s = strings.Trim(s, "\"")

	switch strings.ToLower(s) {
	case "true", "1":
		*fb = true
	case "false", "0", "null":
		*fb = false
	default:
		*fb = false
	}
	return nil
}

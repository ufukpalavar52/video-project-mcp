package service

import (
	"context"
	"log"
	"net/http"
	"strings"
	"video-handler-mcp/util"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

type McpServerService struct {
	Port       string
	mcpServer  *server.MCPServer
	httpServer *server.StreamableHTTPServer
}

func NewMcpServerService(port string, name string, version string) *McpServerService {
	opts := []server.ServerOption{
		server.WithToolCapabilities(true),
		server.WithRoots(),
	}

	mcpServer := server.NewMCPServer(name, version, opts...)

	mcpServer.AddNotificationHandler(mcp.MethodNotificationRootsListChanged, handleMcpNotification)
	return &McpServerService{mcpServer: mcpServer, Port: port}
}

func (s *McpServerService) AddTool(name, description string, schema mcp.ToolInputSchema, callback server.ToolHandlerFunc) {
	s.mcpServer.AddTool(mcp.Tool{
		Name:        name,
		Description: description,
		InputSchema: schema,
	}, callback)
}

func (s *McpServerService) Start(endpoint string) error {
	// httpOpts := server.WithEndpointPath(endpoint)
	// s.httpServer = server.NewStreamableHTTPServer(s.mcpServer, httpOpts)
	s.httpServer = server.NewStreamableHTTPServer(s.mcpServer)

	mux := http.NewServeMux()
	mux.Handle("/mcp", s.AuthMiddleware(s.httpServer))

	log.Printf("Starting HTTP server\n")
	if err := http.ListenAndServe(":"+s.Port, mux); err != nil {
		return err
	}

	return nil
}

func (s *McpServerService) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		sessionId := strings.TrimPrefix(r.Header.Get(server.HeaderKeySessionID), "mcp-session-")
		if token == "" {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")
		jwtService := NewJwtService(util.ApiConfig.AppSecretKey)
		data, err := jwtService.ParseToken(token)
		if err != nil {
			log.Println("JWT token parse error:", err)
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		jwtSessId, ok := data["sessionId"].(string)
		if !ok {
			log.Println("invalid token data: ", data)
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}

		if jwtSessId != sessionId {
			log.Printf("Token match error. jwtToken[%s] headerToken[%s] ", jwtSessId, sessionId)
			http.Error(w, "invalid token", http.StatusUnauthorized)
		}

		next.ServeHTTP(w, r)
	})
}

func (s *McpServerService) Close() {
	_ = s.httpServer.Shutdown(context.Background())
}

func handleMcpNotification(ctx context.Context, notification mcp.JSONRPCNotification) {
	log.Printf("notification received: %v\n", notification.Method)
}

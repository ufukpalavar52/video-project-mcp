package service

import (
	"context"
	"log"

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
	httpOpts := server.WithEndpointPath(endpoint)
	s.httpServer = server.NewStreamableHTTPServer(s.mcpServer, httpOpts)

	log.Printf("Starting HTTP server\n")
	if err := s.httpServer.Start(":" + s.Port); err != nil {
		return err
	}

	return nil
}

func (s *McpServerService) Close() {
	_ = s.httpServer.Shutdown(context.Background())
}

func handleMcpNotification(ctx context.Context, notification mcp.JSONRPCNotification) {
	log.Printf("notification received: %v\n", notification.Method)
}

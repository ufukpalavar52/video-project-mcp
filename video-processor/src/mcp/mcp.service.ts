import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { Video } from '../video/video.model';
import { randomUUID } from 'node:crypto';
import { ApiConfig } from '../common/config/config';
import { McpResponseDTO } from './dto';
import { VideoStatus } from '../common/constants/video';

@Injectable()
export class MCPService {
  private readonly logger = new Logger(MCPService.name);
  private mcpUrl = ApiConfig.MCP_URL;

  constructor(private readonly llmService: LlmService) {}

  async handleProcess(video: Video) {
    const ask = await this.llmService.askByVideo(video);
    const msg = ask.choices[0].message;
    if (!msg || !msg?.tool_calls) {
      throw new Error('Tool call failed.');
    }

    const call = msg.tool_calls[0];
    const funcCall = call['function'];
    const args =
      typeof funcCall.arguments === 'string' &&
      typeof funcCall.arguments !== 'undefined'
        ? JSON.parse(funcCall.arguments)
        : funcCall.arguments;
    const func = funcCall['name'];
    try {
      return await this.callMcpTool(func, args);
    } catch (error) {
      this.logger.error(
        `Mcp server fetch error. Error: "${error.message}" Stack: ${error.stack}`,
      );
      const responseMsg: Record<string, any> = { message: error.message };
      return this.buildMcpResponseDTO(args, responseMsg);
    }
  }

  async callMcpTool(tool: string, args: any) {
    const sessionId = randomUUID();
    const url = `${this.mcpUrl}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer internal-token',
        'Mcp-Session-Id': `mcp-session-${sessionId}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: sessionId,
        method: 'tools/call',
        params: {
          name: tool,
          arguments: args,
        },
      }),
    });

    if (res.ok) {
      return true;
    }

    const responseMsg: Record<string, any> = {};
    try {
      responseMsg.mcpResponse = await res.text();
    } catch (error) {
      responseMsg.error = error.message;
    }

    return this.buildMcpResponseDTO(args, responseMsg);
  }

  private buildMcpResponseDTO(args: any, responseMsg: Record<string, any>) {
    const mcpResponse = new McpResponseDTO();
    mcpResponse.transactionId = args?.transactionId;
    mcpResponse.status = VideoStatus.ERROR;
    mcpResponse.message = responseMsg;
    return mcpResponse;
  }
}

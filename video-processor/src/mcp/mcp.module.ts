import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { MCPService } from './mcp.service';

@Module({
  providers: [LlmService, MCPService],
  exports: [LlmService, MCPService],
})
export class MCPModule {}

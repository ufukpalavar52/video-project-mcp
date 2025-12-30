import { Module } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { MCPService } from './mcp.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [LlmService, MCPService],
  exports: [LlmService, MCPService],
})
export class MCPModule {}

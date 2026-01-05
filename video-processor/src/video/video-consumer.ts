import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { Video } from './video.model';
import { VideoService } from './video.service';
import { MCPService } from '../mcp/mcp.service';
import { ApiConfig } from '../common/config/config';
import { McpResponseDTO } from '../mcp/dto';
import { VideoStatus } from '../common/constants/video';
import { KafkaMcpAsk } from '../common/constants/kafka';

@Controller()
export class VideoConsumer {
  private readonly logger = new Logger(VideoConsumer.name);
  constructor(
    private readonly mcpService: MCPService,
    private readonly videoService: VideoService,
    @Inject('KAFKA_SERVICE') private kafka: ClientKafka,
  ) {}

  @EventPattern(KafkaMcpAsk)
  async mcpAsk(@Payload() data: Video) {
    const now = Date.now();
    this.logger.log(`Processing mcp-ask. Data:${JSON.stringify(data)}`);
    const result = await this.mcpService.handleProcess(data);
    const elapsed = Date.now() - now;
    this.logger.log(
      `Processed mcp-ask. Elapsed: ${elapsed} Data: ${JSON.stringify(data)}`,
    );
    if (result === true) {
      return;
    }
    this.kafka.emit(ApiConfig.STATUS_TOPIC, result);
  }

  @EventPattern(ApiConfig.STATUS_TOPIC)
  async complete(@Payload() data: McpResponseDTO) {
    this.logger.log(`Data is being processed. Data: ${JSON.stringify(data)}`);
    if (data.transactionId && data.status === VideoStatus.ERROR) {
      await this.videoService.addErrorLog(data.transactionId, data.message);
    }
    if (data.transactionId) {
      await this.videoService.updateData(data.transactionId, data);
    }
  }
}

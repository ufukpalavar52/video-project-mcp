import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { CommonModule } from '../common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.model';
import { VideoErrorLog } from './video-error-log.model';
import { MCPModule } from '../mcp/mcp.module';
import { VideoConsumer } from './video-consumer';
import { VideoCronService } from './video-cron';

@Module({
  imports: [
    CommonModule,
    MCPModule,
    TypeOrmModule.forFeature([Video, VideoErrorLog]),
  ],
  controllers: [VideoController, VideoConsumer],
  providers: [VideoService, VideoCronService],
})
export class VideoModule {}

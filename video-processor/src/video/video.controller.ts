import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Inject,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoRequestDTO } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { ClientKafka } from '@nestjs/microservices';
import { MCPService } from '../mcp/mcp.service';
import express from 'express';
import { Readable } from 'node:stream';
import { VideoProcessType } from '../common/constants/video';
import { randomUUID } from 'node:crypto';

@Controller('api/video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    @Inject('KAFKA_SERVICE') private kafka: ClientKafka,
    private readonly mcpService: MCPService,
  ) {}

  @Get()
  videoPage(): Record<string, string> {
    return {
      message: 'Video Page',
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() body: VideoRequestDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'video/mp4' })],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (!body.url && !file) {
      throw new BadRequestException(['Url or file is required']);
    }
    const video = await this.videoService.save(body, file);
    this.kafka.emit('mcp-ask', video);
    return video;
  }

  @Get(':id')
  async getVideo(@Param('id') transactionId: string) {
    const video =
      await this.videoService.getVideoByTransactionId(transactionId);
    const errorLogs =
      await this.videoService.getVideoErrorLogsByTransactionId(transactionId);

    return {
      video: video,
      errorLogs: errorLogs,
    };
  }

  @Get('download/:id')
  async downloadVideo(
    @Param('id') transactionId: string,
    @Res() res: express.Response,
  ) {
    const result =
      await this.videoService.getOutputFileByTransactionId(transactionId);

    let contentType = 'video/mp4';
    const uuid = randomUUID();
    let filename = `${uuid}.mp4`;
    if (result.video.processType === VideoProcessType.GIF) {
      contentType = 'image/gif';
      filename = `${uuid}.gif`;
    }

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    (result.file.Body as Readable).pipe(res);
  }
}

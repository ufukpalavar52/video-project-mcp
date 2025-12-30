import { Injectable, Logger } from '@nestjs/common';
import { VideoRequestDTO } from './dto';
import path from 'path';
import { S3Service } from '../common/service/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './video.model';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { ApiConfig } from '../common/config/config';
import { getVideoProcessType, VideoStatus } from '../common/constants/video';
import { AppError, ErrorCodes } from '../common/errors/error';
import { VideoErrorLog } from './video-error-log.model';
import { McpResponseDTO } from '../mcp/dto';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(VideoErrorLog)
    private videoErrorLogRepository: Repository<VideoErrorLog>,
  ) {}

  async save(body: VideoRequestDTO, file?: Express.Multer.File) {
    let filePath = '';
    if (file) {
      body.url = '';
      filePath = this.createFilePath(path.extname(file.originalname));
    }
    if (!file && body.url) {
      filePath = body.url;
    }

    if (file) {
      const saveFile = await this.saveFile(filePath, file.buffer);
      if (!saveFile) {
        throw new AppError(ErrorCodes.SAVE_FILE_ERROR);
      }
    }

    return await this.saveData(filePath, body);
  }

  createFilePath(fileExt: string) {
    const filename = randomUUID().toString();
    const filePath = ApiConfig.S3_VIDEO_BUCKET;
    if (!fileExt) {
      return path.join(filePath, filename);
    }
    return path.join(filePath, `${filename}${fileExt}`);
  }

  saveData(filePath: string, body: VideoRequestDTO) {
    const processType = getVideoProcessType(body.processType);
    if (!processType) {
      throw new AppError(ErrorCodes.INVALID_PROCESS_TYPE);
    }

    const isUrl = body.url !== '' && body.url !== null;

    const newVideo = this.videoRepository.create({
      path: filePath,
      isUrl: isUrl,
      startTime: body.startTime,
      endTime: body.endTime,
      transactionId: randomUUID(),
      status: VideoStatus.PENDING,
      processType: getVideoProcessType(body.processType),
    });

    return this.videoRepository.save(newVideo);
  }

  async saveFile(filePath: string, buffer: Buffer) {
    try {
      await this.s3Service.putFile(filePath, buffer);
      return true;
    } catch (error) {
      this.logger.error(`Saving file error. Error: ${error.message}`);
    }
    return false;
  }

  async updateData(transactionId: string, data: McpResponseDTO) {
    const video = await this.videoRepository.findOneBy({
      transactionId: transactionId,
    });
    if (!video) {
      this.logger.error(`Saving video error. Transaction ID: ${transactionId}`);
      return;
    }
    video.status = data.status;
    if (data.outputPath) {
      video.outputPath = data.outputPath;
    }
    return await this.videoRepository.save(video);
  }

  async addErrorLog(transactionId: string, message: any) {
    let data = message;
    if (typeof message !== 'string') {
      data = JSON.stringify(message);
    }

    const errorLog = this.videoErrorLogRepository.create({
      transactionId: transactionId,
      message: data,
    });
    await this.videoErrorLogRepository.save(errorLog);
  }

  async getVideoByTransactionId(transactionId: string) {
    const video = await this.videoRepository.findOneBy({
      transactionId: transactionId,
    });
    if (!video) {
      throw new AppError(ErrorCodes.VIDEO_NOT_FOUND);
    }
    return video;
  }

  async getVideoErrorLogsByTransactionId(transactionId: string) {
    return await this.videoErrorLogRepository.findBy({
      transactionId: transactionId,
    });
  }

  async getOutputFileByTransactionId(transactionId: string) {
    const video = await this.getVideoByTransactionId(transactionId);
    if (video.status !== VideoStatus.SUCCESS || video.outputPath === '') {
      throw new AppError(ErrorCodes.VIDEO_NOT_PROCESSED);
    }
    try {
      const file = await this.s3Service.getFile(video.outputPath);
      return {
        video: video,
        file: file,
      };
    } catch (error) {
      this.logger.error(`S3 fetch file error. Error: ${error.message}`);
      throw new AppError(ErrorCodes.VIDEO_FILE_NOT_FOUND);
    }
  }
}

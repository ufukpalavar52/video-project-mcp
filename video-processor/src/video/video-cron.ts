import { Inject, Injectable, Logger } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Video } from '../video/video.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VideoStatus } from '../common/constants/video';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaMcpAsk } from '../common/constants/kafka';
import { ApiConfig } from '../common/config/config';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @Inject('KAFKA_SERVICE') private kafka: ClientKafka,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkPending() {
    const now = new Date();
    const lastHour = new Date(now);
    lastHour.setHours(lastHour.getHours() - 1);
    const videos = await this.videoRepository.findBy({
      createdAt: LessThan(lastHour),
      status: VideoStatus.PENDING,
      retryCount: LessThan(ApiConfig.MAX_PROCESS_RETRY),
    });

    await this.addProcessQueues(videos);
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async checkInProgress() {
    const now = new Date();
    const last2Hour = new Date(now);
    last2Hour.setHours(last2Hour.getHours() - 2);
    const videos = await this.videoRepository.findBy({
      updatedAt: LessThan(last2Hour),
      status: VideoStatus.IN_PROGRESS,
      retryCount: LessThan(ApiConfig.MAX_PROCESS_RETRY),
    });

    await this.addProcessQueues(videos);
  }

  async addProcessQueues(videos: Video[]) {
    for (const video of videos) {
      this.logger.log(
        `Retrying in progress process. TransactionId: ${video.transactionId}`,
      );
      this.kafka.emit(KafkaMcpAsk, video);
      video.retryCount = Number(video.retryCount) + 1;
      await this.videoRepository.save(video);
    }
  }
}

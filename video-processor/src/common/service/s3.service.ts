import {
  CreateBucketCommand,
  GetBucketLifecycleConfigurationCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfigType,
} from '@aws-sdk/client-s3';
import { ApiConfig } from '../config/config';
import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import { AppError, ErrorCodes } from '../errors/error';

const expireRuleName = 'expire-video-temp-objects';
const jobId = 'expire-video-job';

@Injectable()
export class S3Service {
  client: S3Client;
  expires: number;
  private readonly logger = new Logger(S3Service.name);
  constructor() {
    const config: S3ClientConfigType = {
      region: ApiConfig.S3_REGION,
      endpoint: ApiConfig.S3_ENDPOINT,
      forcePathStyle: ApiConfig.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: String(ApiConfig.S3_ACCESS_KEY),
        secretAccessKey: String(ApiConfig.S3_SECRET_KEY),
      },
    };
    this.client = new S3Client(config);
    this.expires = ApiConfig.S3_EXPIRES;
  }

  async putFile(filePath: string, file: Buffer) {
    const [bucketName, filename] = this.parseFilepath(filePath);
    await this.ensureBucketExists(bucketName);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: filename,
          Body: file,
          Tagging: `type=temp&jobId=${jobId}`,
        }),
      );
    } catch (error) {
      this.logger.error(`S3 putFile error. Error: ${error.message}`);
      throw new AppError(ErrorCodes.SAVE_FILE_ERROR, [error.message]);
    }
    return true;
  }

  async getFile(filePath: string) {
    const [bucketName, filename] = this.parseFilepath(filePath);
    return this.client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: filename,
      }),
    );
  }

  async ensureBucketExists(bucketName: string): Promise<boolean> {
    const region = ApiConfig.S3_REGION;
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      await this.ensureLifecycleRule(bucketName);
    } catch (error) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        const commandInput: any = { Bucket: bucketName };
        if (region !== 'us-east-1') {
          commandInput.CreateBucketConfiguration = {
            LocationConstraint: region,
          };
        }

        await this.client.send(new CreateBucketCommand(commandInput));
        return true;
      }
      this.logger.error(`S3 bucket check. Error: ${error.message}`);
    }
    return true;
  }

  async ensureLifecycleRule(bucketName: string) {
    if (this.expires < 0) {
      return;
    }
    try {
      const res = await this.client.send(
        new GetBucketLifecycleConfigurationCommand({
          Bucket: bucketName,
        }),
      );

      const exists = res.Rules?.some((r) => r.ID === expireRuleName);
      if (exists) {
        this.logger.log('S3 lifecycle already exists');
        return;
      }
    } catch (error: any) {
      if (error.name !== 'NoSuchLifecycleConfiguration') {
        this.logger.error(
          `S3 lifecycle configuration error. Error: ${error.message}`,
        );
        throw new AppError(ErrorCodes.UNKNOWN_ERROR, [error.message]);
      }
      this.logger.warn(
        `S3 lifecycle configuration warning. Warning: ${error.message}`,
      );
    }

    await this.client.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: bucketName,
        LifecycleConfiguration: {
          Rules: [
            {
              ID: expireRuleName,
              Status: 'Enabled',
              Filter: {
                Tag: {
                  Key: 'type',
                  Value: 'temp',
                },
              },
              Expiration: { Days: this.expires },
            },
          ],
        },
      }),
    );
  }

  parseFilepath(filePath: string) {
    const filename = path.basename(filePath);
    const bucketName = path.dirname(filePath);
    if (!filename || !bucketName) {
      throw new AppError(ErrorCodes.BAD_REQUEST);
    }
    return [bucketName, filename];
  }
}

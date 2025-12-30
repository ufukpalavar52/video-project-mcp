import 'reflect-metadata';
import { ApiConfig } from './common/config/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { DataSource } from 'typeorm';
import { Video } from './video/video.model';
import { VideoErrorLog } from './video/video-error-log.model';

const entities = [Video, VideoErrorLog];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ApiConfig.DB_HOST,
  port: ApiConfig.DB_PORT,
  username: ApiConfig.DB_USER,
  password: ApiConfig.DB_PASSWORD,
  database: ApiConfig.DB_DATABASE,
  synchronize: ApiConfig.AUTO_MIGRATION,
  entities: entities,
  namingStrategy: new SnakeNamingStrategy(),
});

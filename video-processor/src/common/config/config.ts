const KAFKA_BROKERS = process.env.KAFKA_BROKERS || `kafka:9092`;

export const BASE_PATH = __dirname + '../../../';

export const ApiConfig = {
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  AUTO_MIGRATION: Boolean(process.env.AUTO_MIGRATION || false),

  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_VIDEO_BUCKET: process.env.S3_VIDEO_BUCKET || 'video',
  S3_VIDEO_OUT_BUCKET: process.env.S3_VIDEO_BUCKET || 'video-out',
  S3_FORCE_PATH_STYLE: Boolean(process.env.S3_FORCE_PATH_STYLE || true),
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_EXPIRES: Number(process.env.S3_EXPIRES || 0),
  ALLOWED_CORS: process.env.PROCESSOR_ALOWWED_CORS || '*',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '',
  OPENAI_AI_MODEL: process.env.OPENAI_AI_MODEL || '',
  PROMPT_PATH: process.env.PROMPT_PATH || `${BASE_PATH}/prompts`,

  MCP_URL: process.env.MCP_URL,
  MCP_JWT_KEY: process.env.MCP_JWT_KEY || 'mcp-jwt-key',
  APP_SECRET_KEY: process.env.APP_SECRET_KEY,

  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '100mb',

  KAFKA_BROKERS: KAFKA_BROKERS.split(','),
  KAFKA_CLIENT_ID:
    process.env.PROCESSOR_KAFKA_CLIENT_ID || 'video-processor-client',
  KAFKA_GROUP_ID:
    process.env.PROCESSOR_KAFKA_GROUP_ID || 'video-processor-group',
  STATUS_TOPIC: process.env.GIF_TOPIC || 'status-tasks',
};

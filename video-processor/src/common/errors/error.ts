import { HttpException } from '@nestjs/common';

export interface ErrorCode {
  statusCode: number;
  message: string;
  code: number;
  errors: any;
}

export function prepareCode(
  statusCode: number,
  code: number,
  message: string,
  errors?: any,
): ErrorCode {
  return {
    statusCode: statusCode,
    message: message,
    code: code,
    errors: errors,
  };
}

export const ErrorCodes = {
  BAD_REQUEST: prepareCode(400, 1000, 'Bad request'),
  INVALID_PROCESS_TYPE: prepareCode(400, 1001, 'invalid process type'),
  VIDEO_NOT_FOUND: prepareCode(404, 1002, 'Video not found'),
  VIDEO_NOT_PROCESSED: prepareCode(404, 1003, 'Video not processed'),
  VIDEO_FILE_NOT_FOUND: prepareCode(404, 1004, 'Video file not found'),
  UNKNOWN_ERROR: prepareCode(500, 1005, 'Unknown error'),
  INVALID_PATH: prepareCode(500, 2000, 'Invalid path'),
  SAVE_FILE_ERROR: prepareCode(500, 2001, 'Saving file error'),
} as const;

export class AppError extends HttpException {
  code: ErrorCode;
  constructor(code: ErrorCode, errors?: any) {
    super(code.message, code.statusCode);
    this.code = code;
    if (errors) {
      this.code.errors = errors;
    }
  }
  getCode() {
    return this.code;
  }
}

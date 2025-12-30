import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { AppError, ErrorCodes } from '../errors/error';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(AppError)
export class ApiExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HTTP');
  catch(err: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    ctx.getResponse().status(err.getCode().statusCode).json({
      code: err.getCode().code,
      message: err.getCode().message,
      errors: err.getCode().errors,
      time: Date.now(),
    });
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(err: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    ctx.getResponse().status(err.getStatus()).json({
      code: ErrorCodes.UNKNOWN_ERROR.code,
      message: err.message,
      errors: [],
      time: Date.now(),
    });
  }
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    this.logger.error(`
      PATH: ${request.url}
      MESSAGE: ${exception.message || 'Unknown error'};
      STACK: ${exception.stack}
    `);

    super.catch(exception, host);
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse.statusCode = status;
      errorResponse.error = exception.name;

      if (typeof exceptionResponse === 'object') {
        const { message } = exceptionResponse as any;
        errorResponse.message = message || exception.message;
      } else {
        errorResponse.message = exception.message;
      }
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message;
      errorResponse.error = exception.name;
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
@Catch()
export class SafeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost): void {
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const payload = error instanceof HttpException ? error.getResponse() : undefined;
    const message =
      status >= 500
        ? 'Internal server error'
        : typeof payload === 'string'
          ? payload
          : payload && 'message' in payload
            ? (payload as { message: string | string[] }).message
            : 'Request failed';
    if (status >= 500) this.logger.error('Request failed with server error');
    host.switchToHttp().getResponse<Response>().status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

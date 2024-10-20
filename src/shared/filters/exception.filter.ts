import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export default class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception['response']?.response
          ? exception['response']?.response
          : exception?.message
        : 'Internal Server Error';
    const responseObj = {
      success: false,
      message,
      statusCode: status,
      errors: this.getValidationErrors(exception),
      timestamp: new Date().toLocaleString(),
      path: request.url,
      method: request.method,
    };
    Logger.error(exception);
    Logger.verbose(this.logError(responseObj, request, exception));
    response.status(status).send(responseObj);
  }

  getValidationErrors(exception: unknown) {
    if (exception instanceof BadRequestException) {
      const message = exception.getResponse();

      if (typeof message === 'object') {
        return (message as any).errors;
      }
    }

    return [];
  }

  logError(errResponse, request, exception: unknown) {
    const { statusCode, error } = errResponse;
    const { method, url } = request;
    const errorLog = `Response Code: ${statusCode} - Method: ${method} URL - ${url} \n
          ${JSON.stringify(exception)} \n
          ${exception instanceof HttpException ? exception.stack : error} `;
    return errorLog;
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userAgent = req.get('user-agent') || '';
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();

        const { statusCode } = response;

        Logger.log(
          `${userAgent}::: ip: ${
            req.ip
          } time: ${new Date().toLocaleString()} method: ${method} url: ${url} status: ${statusCode} Duration: ${
            Date.now() - now
          }ms`,
          context.getClass().name,
        );
      }),
    );
  }
}

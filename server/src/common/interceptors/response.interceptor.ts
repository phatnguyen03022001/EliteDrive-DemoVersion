import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[HTTP SUCCESS] ${req.method} ${req.originalUrl} 200 +${
            Date.now() - start
          }ms`,
        );
      }),
      map((data) => {
        const res = {
          success: true,
          message: 'Request successful',
          data,
          timestamp: new Date().toISOString(),
        };

        console.log('[HTTP RESPONSE]', res);
        return res;
      }),
    );
  }
}

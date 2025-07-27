import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserPasswordFilter implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.map(item => {
            if (item && typeof item === 'object') {
              const { password, ...result } = item;
              return result;
            }
            return item;
          });
        } else if (data && typeof data === 'object') {
          const { password, ...result } = data;
          return result;
        }
        return data;
      }),
    );
  }
}

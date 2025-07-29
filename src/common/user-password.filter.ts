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
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown): unknown => {
        if (Array.isArray(data)) {
          return data.map((item) => this.omitPassword(item));
        } else {
          return this.omitPassword(data);
        }
      }),
    );
  }

  private omitPassword(obj: unknown): unknown {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map((item) => this.omitPassword(item));
      } else {
        const rest: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'password' || key === 'refreshToken') {
            continue;
          }
          rest[key] = this.omitPassword(value);
        }
        return rest;
      }
    }
    return obj;
  }
}

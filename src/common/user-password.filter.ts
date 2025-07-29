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
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const rest = { ...(obj as Record<string, unknown>) };
      delete rest.password;
      return rest;
    }
    return obj;
  }
}

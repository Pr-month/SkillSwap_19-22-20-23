import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: 'ADMIN' | 'USER';
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

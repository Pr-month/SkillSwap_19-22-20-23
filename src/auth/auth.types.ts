export interface JwtPayload {
  sub: string;
  email: string;
  roles: 'ADMIN' | 'USER';
}

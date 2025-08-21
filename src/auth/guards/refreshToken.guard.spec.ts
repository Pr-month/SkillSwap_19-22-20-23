import { RefreshTokenGuard } from './refreshToken.guard';
import { AuthGuard } from '@nestjs/passport';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;

  beforeEach(() => {
    guard = new RefreshTokenGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be instance of AuthGuard', () => {
    expect(guard).toBeInstanceOf(AuthGuard);
  });

  it('should have the correct strategy name', () => {
    expect(guard.constructor.name).toBe('RefreshTokenGuard');
  });
});

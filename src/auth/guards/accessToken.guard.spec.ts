import { AccessTokenGuard } from './accessToken.guard';
import { AuthGuard } from '@nestjs/passport';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;

  beforeEach(() => {
    guard = new AccessTokenGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be instance of AuthGuard', () => {
    expect(guard).toBeInstanceOf(AuthGuard);
  });

  it('should have the correct strategy name', () => {
    expect(guard.constructor.name).toBe('AccessTokenGuard');
  });
});

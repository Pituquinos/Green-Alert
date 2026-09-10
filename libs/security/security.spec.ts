import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@app/common';
import { JwtGuard, RolesGuard, PasswordService } from './index';
function context(user?: { sub: string; role: Role }, authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user, headers: { authorization } }) }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}
describe('shared security', () => {
  it('hashes and verifies without returning plaintext', async () => {
    const passwords = new PasswordService();
    const hash = await passwords.hash('a-test-password');
    expect(hash).not.toBe('a-test-password');
    expect(await passwords.verify('a-test-password', hash)).toBe(true);
    expect(await passwords.verify('wrong', hash)).toBe(false);
  });
  it('rejects requests without a bearer token', async () => {
    await expect(new JwtGuard(new JwtService()).canActivate(context())).rejects.toThrow();
  });
  it('denies protected roles when no user or a different role is present', () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(context())).toBe(false);
    expect(guard.canActivate(context({ sub: '1', role: Role.CITIZEN }))).toBe(false);
    expect(guard.canActivate(context({ sub: '1', role: Role.ADMIN }))).toBe(true);
  });
});

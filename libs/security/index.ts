import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Module,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { AuthenticatedUser, Role } from '@app/common';
const ROLES_KEY = 'greenalert.roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
@Injectable()
export class PasswordService {
  hash(password: string): Promise<string> {
    return hash(password, 12);
  }
  verify(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string }; user?: AuthenticatedUser }>();
    const match = /^Bearer ([^ ]+)$/.exec(request.headers.authorization ?? '');
    if (!match?.[1]) throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<Record<string, unknown>>(match[1]);
      if (typeof payload.sub !== 'string' || !Object.values(Role).includes(payload.role as Role))
        throw new Error();
      request.user = { sub: payload.sub, role: payload.role as Role };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>().user;
    return !!user && roles.includes(user.role);
  }
}
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') ?? '';
        if (secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
        return {
          secret,
          signOptions: {
            algorithm: 'HS256' as const,
            expiresIn: 900,
            issuer: 'greenalert-auth',
            audience: 'greenalert-api',
          },
          verifyOptions: {
            algorithms: ['HS256' as const],
            issuer: 'greenalert-auth',
            audience: 'greenalert-api',
          },
        };
      },
    }),
  ],
  providers: [PasswordService, JwtGuard, RolesGuard],
  exports: [JwtModule, PasswordService, JwtGuard, RolesGuard],
})
export class SecurityModule {}

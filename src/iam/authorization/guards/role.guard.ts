import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as schema from 'src/db/schema';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { ActiveUser } from 'src/iam/interfaces/active-user.interface';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const roles = this.reflector.getAllAndOverride<schema.User['role']>(
      ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) return true;

    const user: ActiveUser = req[REQUEST_USER_KEY];
    if (!user) throw new UnauthorizedException('Ошибка авторизации');

    return user.role.some((role) => roles.includes(role));
  }
}

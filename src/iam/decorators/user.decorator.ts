import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../iam.constants';
import { ActiveUser } from '../interfaces/active-user.interface';

export const User = createParamDecorator(
  (key: keyof ActiveUser | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    const user: ActiveUser = req[REQUEST_USER_KEY];

    return key ? user[key] : user;
  },
);

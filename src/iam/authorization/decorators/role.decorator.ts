import { SetMetadata } from '@nestjs/common';
import * as schema from 'src/db/schema';

export const ROLE_KEY = 'role';

export const Role = (...args: schema.User['role']) =>
  SetMetadata(ROLE_KEY, args);

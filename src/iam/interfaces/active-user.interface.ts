import * as schema from 'src/db/schema';
export interface ActiveUser
  extends Omit<
    schema.User,
    'password' | 'passwordResetExpires' | 'passwordResetToken'
  > {}

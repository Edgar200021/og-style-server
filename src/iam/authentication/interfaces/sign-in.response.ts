import * as schema from 'src/db/schema';
export interface SignInResponse {
  user: Omit<schema.User, 'passwordResetExpires' | 'passwordResetToken'>;
  accessToken: string;
  refreshToken: string;
}

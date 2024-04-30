import * as schema from 'src/db/schema';
export interface SignInResponse {
  user: Omit<
    schema.User,
    'passwordResetExpires' | 'passwordResetToken' | 'googleId' | 'githubId'
  >;
  accessToken: string;
  refreshToken: string;
}

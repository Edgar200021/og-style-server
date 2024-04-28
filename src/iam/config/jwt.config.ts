import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenExpires: process.env.JWT_ACCESS_EXPIRES,
  refreshTokenExpires: process.env.JWT_REFRESH_EXPIRES,
  accessCookieMaxAge: Number(process.env.ACCESS_COOKIE_MAX_AGE),
  refreshCookieMaxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE),
  refreshRedisMaxAge: Number(process.env.REFRESH_REDIS_MAX_AGE),
  nodeEnv: process.env.NODE_ENV,
  clientUrl: process.env.CLIENT_URL,
}));

import { registerAs } from '@nestjs/config';

export default registerAs('socialConfig', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubRedirectUrl: process.env.GITHUB_REDIRECT_URL,
}));

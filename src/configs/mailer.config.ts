import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Env } from 'env';

export const mailerConfig = (
  configService: ConfigService<Env, true>,
): MailerOptions => ({
  transport: {
    host: configService.get('SMTP_HOST'),
    port: Number(configService.get('SMTP_PORT')),
    //  ignoreTLS: true,
    secure: configService.get('NODE_ENV') === 'production',
    auth: {
      user: configService.get('SMTP_USER'),
      pass: configService.get('SMTP_PASSWORD'),
    },
    from: configService.get('SMTP_USER'),
  },
});

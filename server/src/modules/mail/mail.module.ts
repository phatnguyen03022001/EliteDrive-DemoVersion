import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT'),
          secure: false, // Brevo dùng STARTTLS ở cổng 587
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('BREVO_API_KEY'),
          },
        },
        defaults: {
          from: `"${config.get('EMAIL_FROM_NAME')}" <${config.get('EMAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

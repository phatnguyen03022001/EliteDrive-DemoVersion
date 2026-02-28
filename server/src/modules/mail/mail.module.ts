// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // để ConfigService hoạt động ổn
      useFactory: async (config: ConfigService) => {
        const smtpHost = 'smtp-relay.brevo.com';
        const smtpPort = config.get<number>('SMTP_PORT', 587); // mặc định 587
        const smtpUser = config.get<string>('SMTP_USERNAME'); // email Brevo của bạn
        const smtpPass = config.get<string>('SMTP_PASSWORD'); // SMTP key (KHÔNG phải API key)

        if (!smtpUser || !smtpPass) {
          throw new Error('Thiếu SMTP_USERNAME hoặc SMTP_PASSWORD trong .env');
        }

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true nếu dùng 465 (SSL), false cho 587 (STARTTLS)
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            // Optional: debug nếu test
            // logger: true,
            // debug: true,
          },
          defaults: {
            from: `"${config.get('EMAIL_FROM_NAME', 'Elite Drive')}" <${config.get('EMAIL_FROM', 'noreply@elite.dev')}>`,
          },
          // Optional: verify connection khi init (khuyến khích)
          verify: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService, MailerModule], // export MailerModule nếu cần dùng MailerService ở nơi khác
})
export class MailModule {}

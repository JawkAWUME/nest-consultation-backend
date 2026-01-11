import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('app.mail.host'),
      port: this.configService.get('app.mail.port'),
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: this.configService.get('app.mail.user'),
        pass: this.configService.get('app.mail.pass'),
      },
    });
  }

  async envoyerEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('app.mail.from'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }
}
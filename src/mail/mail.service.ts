import { Injectable } from '@nestjs/common';
import nodemailer = require('nodemailer');
require('dotenv').config();
@Injectable()
export class MailService {
  async sendMail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MAIL,
      to,
      subject,
      html,
    };
    try {
      // Отправляем письмо
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
    }
  }
}

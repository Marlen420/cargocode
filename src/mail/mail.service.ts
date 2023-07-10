import { Injectable } from '@nestjs/common';
import nodemailer = require('nodemailer');
import { SendMailDto } from './dto/send-mail.dto';
require('dotenv').config();
@Injectable()
export class MailService {
  transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  async sendPasswordToEmail(data: SendMailDto) {
    const mailOptions = {
      from: process.env.MAIL,
      to: data.email,
      subject: 'Account on cargo.code',
      text: 'Your password is: ' + data.password,
    };
    try {
      // Отправляем письмо
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
    }
    return {
      message: 'Письмо отправлено',
    };
  }
  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.MAIL,
      to,
      subject,
      html,
    };
    try {
      // Отправляем письмо
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
    }
  }
}

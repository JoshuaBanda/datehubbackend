import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Configure the Nodemailer transporter (adjust SMTP settings for your provider)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Example with Gmail (change according to your provider)
      auth: {
        user: 'unimadating@gmail.com', // Your email address
        pass: 'tiongebanda2004', // Your email password or app password
      },
    });
  }

  // Generate a random OTP
  generateOtp(): string {
    const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
    return otp;
  }

  // Send OTP via email
  async sendOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER, // Your email address
      to: email,
      subject: 'Verify Your Email, Unima Dating Hub',
      text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }
}

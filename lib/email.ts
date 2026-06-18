import { createTransport } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export function getLandlordApprovalEmail(landlordName: string): { subject: string; html: string } {
  const subject = 'Your Landlord Application Has Been Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations, ${landlordName}!</h2>
      <p>Your application to become a landlord has been approved.</p>
      <p>You can now start managing your properties through your dashboard.</p>
      <p>Thank you for choosing Dwell KE!</p>
    </div>
  `;
  return { subject, html };
}

export function getLandlordDenialEmail(landlordName: string, reason: string): { subject: string; html: string } {
  const subject = 'Update on Your Landlord Application';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${landlordName},</h2>
      <p>Thank you for your interest in becoming a landlord.</p>
      <p>After careful review, we regret to inform you that your application has been denied for the following reason:</p>
      <p><em>${reason}</em></p>
      <p>If you have any questions or would like to reapply in the future, please don't hesitate to reach out.</p>
      <p>Best regards,</p>
      <p>The Dwell KE Team</p>
    </div>
  `;
  return { subject, html };
}

export function getHotelApprovalEmail(hotelName: string): { subject: string; html: string } {
  const subject = 'Your Hotel Partnership Application Has Been Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Congratulations!</h2>
      <p>Your application to become a hotel partner has been approved.</p>
      <p>You can now start listing your hotel rooms through your dashboard.</p>
      <p>Thank you for choosing Dwell KE!</p>
    </div>
  `;
  return { subject, html };
}

export function getHotelDenialEmail(hotelName: string, reason: string): { subject: string; html: string } {
  const subject = 'Update on Your Hotel Partnership Application';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello,</h2>
      <p>Thank you for your interest in becoming a hotel partner.</p>
      <p>After careful review, we regret to inform you that your application has been denied for the following reason:</p>
      <p><em>${reason}</em></p>
      <p>If you have any questions or would like to reapply in the future, please don't hesitate to reach out.</p>
      <p>Best regards,</p>
      <p>The Dwell KE Team</p>
    </div>
  `;
  return { subject, html };
}
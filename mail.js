// Sends plain-text email through Resend. Without RESEND_API_KEY, prints the email to the log.
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY && new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, text, replyTo }) {
  if (!resend) return console.log(`--- email (no RESEND_API_KEY) to ${to}: ${subject}\n${text}\n---`);
  const { error } = await resend.emails.send({ from: process.env.MAIL_FROM, to, subject, text, replyTo });
  if (error) console.error('email failed', to, error);
}

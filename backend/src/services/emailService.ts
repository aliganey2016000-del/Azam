import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: Transporter | null = null;
let loggedDisabledOnce = false;

function isConfigured(): boolean {
  return env.EMAIL_PROVIDER === 'smtp' && Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Sends an email through the configured SMTP transport. When email is not configured
 * (EMAIL_PROVIDER unset/'none', or SMTP_* incomplete), this no-ops and logs instead of sending --
 * the app must boot and function fully with email disabled (e.g. local dev, or a deployment that
 * hasn't set up SMTP yet). This function never throws; callers that need fire-and-forget
 * semantics can call it without a try/catch, though callers on a critical path may still choose
 * to await and inspect the returned `{ sent: boolean }` result.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean }> {
  if (!isConfigured()) {
    if (!loggedDisabledOnce) {
      console.log('[emailService] EMAIL_PROVIDER not configured -- emails will be logged, not sent.');
      loggedDisabledOnce = true;
    }
    console.log(`[emailService] (disabled) would send email to=${input.to} subject="${input.subject}"`);
    return { sent: false };
  }

  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM || env.SMTP_FROM || env.SMTP_USER,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text || stripHtml(input.html),
    });
    return { sent: true };
  } catch (error) {
    console.error('[emailService] failed to send email', { to: input.to, subject: input.subject, error });
    return { sent: false };
  }
}

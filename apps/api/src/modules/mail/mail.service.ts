import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    this.from = process.env.CONTACT_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY no configurada — los correos se omitirán (solo se loguearán).',
      );
      this.client = null;
    } else {
      this.client = new Resend(apiKey);
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async send(opts: SendMailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
    if (!this.client) {
      this.logger.log(`[mail-skip] to=${opts.to} subject="${opts.subject}"`);
      return { ok: false, error: 'mail-disabled' };
    }

    try {
      const result = await this.client.emails.send({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        replyTo: opts.replyTo,
      });

      if (result.error) {
        this.logger.error(`Resend rechazó el envío: ${result.error.message}`);
        return { ok: false, error: result.error.message };
      }

      this.logger.log(`Email enviado id=${result.data?.id} to=${opts.to}`);
      return { ok: true, id: result.data?.id };
    } catch (err: any) {
      this.logger.error(`Error enviando email: ${err?.message ?? err}`);
      return { ok: false, error: err?.message ?? 'unknown' };
    }
  }
}

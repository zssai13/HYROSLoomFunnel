// ===========================================
// Twilio SMS Provider
// ===========================================

import twilio from 'twilio';
import { SMSProvider } from './types';

class TwilioProvider implements SMSProvider {
  private client: ReturnType<typeof twilio> | null = null;
  private fromNumber: string | null = null;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || null;

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.fromNumber !== null;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.client || !this.fromNumber) {
      console.warn('[Twilio] Not configured - skipping SMS');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
      });

      console.log(`[Twilio] SMS sent successfully, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('[Twilio] Error sending SMS:', error);
      return false;
    }
  }
}

// Export singleton instance
export const twilioProvider = new TwilioProvider();

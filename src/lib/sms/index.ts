// ===========================================
// SMS Service - Provider Agnostic Interface
// ===========================================
// To remove SMS: delete this folder and remove import from submit-lead/route.ts
// To swap providers: change the import below

import { twilioProvider } from './twilio';
import { WELCOME_SMS_MESSAGE } from './message';

/**
 * Send the welcome SMS to a new lead
 *
 * @param phoneNumber - Lead's phone number (E.164 format: +1234567890)
 * @returns true if sent successfully, false otherwise
 */
export async function sendLeadSMS(phoneNumber: string): Promise<boolean> {
  return twilioProvider.sendSMS(phoneNumber, WELCOME_SMS_MESSAGE);
}

// Re-export for convenience
export { WELCOME_SMS_MESSAGE } from './message';

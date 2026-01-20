// ===========================================
// SMS Provider Interface
// ===========================================
// Implement this interface to add new SMS providers

export interface SMSProvider {
  /**
   * Send an SMS message
   * @param to - Recipient phone number (E.164 format)
   * @param message - Message content
   * @returns true if sent successfully, false otherwise
   */
  sendSMS(to: string, message: string): Promise<boolean>;
}

export interface SMSConfig {
  enabled: boolean;
  provider: 'twilio' | 'none';
}

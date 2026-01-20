// ===========================================
// Slack Integration Helper
// ===========================================

import { LeadFormData, getRevenueLabel, getAdSpendLabel } from './types';

/**
 * Format timestamp for Slack message
 */
function formatTimestamp(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

/**
 * Format lead data into a Slack message
 */
function formatSlackMessage(data: LeadFormData): string {
  const revenueLabel = getRevenueLabel(data.monthlyRevenue);
  const adSpendLabel = getAdSpendLabel(data.adSpend);
  const timestamp = formatTimestamp();

  return `*New VIP Lead Submission*

*Email:* ${data.email}
*Monthly Revenue:* ${revenueLabel}
*Ad Spend:* ${adSpendLabel}
*Website:* ${data.websiteUrl}
*Phone:* ${data.phoneNumber}

_Submitted: ${timestamp}_`;
}

/**
 * Send lead notification to Slack
 *
 * This function:
 * - Posts to the configured Slack webhook
 * - Fires asynchronously (doesn't block user flow)
 * - Logs errors but doesn't throw (silent fail)
 *
 * @param data - The lead form data to send
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function sendSlackNotification(data: LeadFormData): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // Check if webhook URL is configured
  if (!webhookUrl || webhookUrl === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    console.warn('[Slack] Webhook URL not configured - skipping notification');
    return false;
  }

  try {
    const message = formatSlackMessage(data);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!response.ok) {
      console.error(`[Slack] Webhook failed with status: ${response.status}`);
      return false;
    }

    console.log('[Slack] Notification sent successfully');
    return true;
  } catch (error) {
    console.error('[Slack] Error sending notification:', error);
    return false;
  }
}

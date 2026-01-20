// ===========================================
// API Route: /api/submit-lead
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { SubmitLeadRequest, SubmitLeadResponse } from '@/lib/types';
import { sendSlackNotification } from '@/lib/slack';
import { upsertHubSpotContact } from '@/lib/hubspot';
import { sendLeadSMS } from '@/lib/sms';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required fields
 */
function validateRequest(data: Partial<SubmitLeadRequest>): string | null {
  if (!data.email || !isValidEmail(data.email)) {
    return 'Valid email is required';
  }
  if (!data.monthlyRevenue) {
    return 'Monthly revenue is required';
  }
  if (!data.adSpend) {
    return 'Ad spend is required';
  }
  if (!data.websiteUrl) {
    return 'Website URL is required';
  }
  if (!data.phoneNumber) {
    return 'Phone number is required';
  }
  return null;
}

/**
 * POST /api/submit-lead
 *
 * Accepts lead form data and:
 * 1. Validates all required fields
 * 2. Sends Slack notification (async, fire-and-forget)
 * 3. Upserts contact in HubSpot (async, fire-and-forget)
 * 4. Always returns success to the user
 *
 * Integration failures are logged but don't affect user experience.
 */
export async function POST(request: NextRequest): Promise<NextResponse<SubmitLeadResponse>> {
  try {
    // Parse request body
    const data: Partial<SubmitLeadRequest> = await request.json();

    // Log incoming request (for debugging)
    console.log('[API] Received lead submission:', {
      email: data.email,
      monthlyRevenue: data.monthlyRevenue,
      adSpend: data.adSpend,
      websiteUrl: data.websiteUrl,
      phoneNumber: data.phoneNumber ? '***' : undefined, // Mask phone for logs
      route: data.route || 'unknown',
    });

    // Validate request
    const validationError = validateRequest(data);
    if (validationError) {
      console.error('[API] Validation error:', validationError);
      // Still return success to user, but log the error
      return NextResponse.json({ success: true });
    }

    // Cast to full type after validation
    const leadData = data as SubmitLeadRequest;

    // Fire integrations asynchronously (don't await - fire and forget)
    // These run in the background and don't block the response
    const integrations: Promise<boolean | void>[] = [
      upsertHubSpotContact(leadData).catch(err => {
        console.error('[API] HubSpot sync failed:', err);
      }),
    ];

    // Only send Slack notification and SMS for Route 1 (FASTEST / SMS contact)
    if (leadData.route === 'sms') {
      integrations.push(
        sendSlackNotification(leadData).catch(err => {
          console.error('[API] Slack notification failed:', err);
        }),
        sendLeadSMS(leadData.phoneNumber).catch(err => {
          console.error('[API] SMS failed:', err);
        })
      );
    }

    Promise.all(integrations).then((results) => {
      console.log('[API] Integration results:', {
        hubspot: results[0] ? 'success' : 'failed',
        slack: leadData.route === 'sms' ? (results[1] ? 'success' : 'failed') : 'skipped',
        sms: leadData.route === 'sms' ? (results[2] ? 'success' : 'failed') : 'skipped',
      });
    });

    // Always return success to user
    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
    });

  } catch (error) {
    // Log error but still return success to user
    console.error('[API] Unexpected error:', error);
    return NextResponse.json({ success: true });
  }
}

/**
 * Handle unsupported methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

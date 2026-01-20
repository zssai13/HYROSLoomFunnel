// ===========================================
// VIP Signup System - TypeScript Types
// ===========================================

/**
 * Form data collected across all steps
 */
export interface LeadFormData {
  email: string;
  monthlyRevenue: string;
  adSpend: string;
  websiteUrl: string;
  phoneNumber: string;
}

/**
 * API request payload for /api/submit-lead
 */
export interface SubmitLeadRequest extends LeadFormData {}

/**
 * API response for /api/submit-lead
 */
export interface SubmitLeadResponse {
  success: boolean;
  message?: string;
}

/**
 * Slack message payload
 */
export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
}

/**
 * HubSpot contact properties
 */
export interface HubSpotContactProperties {
  email: string;
  phone?: string;
  website_url?: string;
  monthly_revenue?: string;
  monthly_ad_spend?: string;
  lead_source?: string;
}

/**
 * HubSpot API search response
 */
export interface HubSpotSearchResponse {
  total: number;
  results: Array<{
    id: string;
    properties: Record<string, string>;
  }>;
}

/**
 * Revenue dropdown options
 */
export const REVENUE_OPTIONS = [
  { value: '0-50k', label: '$0 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-500k', label: '$250,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: '1m+', label: '$1,000,000+' },
] as const;

/**
 * Ad spend dropdown options
 */
export const AD_SPEND_OPTIONS = [
  { value: '0-10k', label: '$0 - $10,000' },
  { value: '10k-25k', label: '$10,000 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k+', label: '$250,000+' },
] as const;

/**
 * Get display label for a revenue value
 */
export function getRevenueLabel(value: string): string {
  const option = REVENUE_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
}

/**
 * Get display label for an ad spend value
 */
export function getAdSpendLabel(value: string): string {
  const option = AD_SPEND_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
}

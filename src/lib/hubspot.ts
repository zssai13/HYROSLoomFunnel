// ===========================================
// HubSpot Integration Helper
// ===========================================

import { LeadFormData, HubSpotSearchResponse } from './types';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

/**
 * Get HubSpot API headers
 */
function getHeaders(): HeadersInit {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Search for an existing contact by email
 */
async function searchContactByEmail(email: string): Promise<string | null> {
  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: ['email'],
        limit: 1,
      }),
    });

    if (!response.ok) {
      console.error(`[HubSpot] Search failed with status: ${response.status}`);
      return null;
    }

    const data: HubSpotSearchResponse = await response.json();

    if (data.total > 0 && data.results.length > 0) {
      console.log(`[HubSpot] Found existing contact: ${data.results[0].id}`);
      return data.results[0].id;
    }

    return null;
  } catch (error) {
    console.error('[HubSpot] Error searching for contact:', error);
    return null;
  }
}

/**
 * Create a new contact in HubSpot
 */
async function createContact(data: LeadFormData): Promise<boolean> {
  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        properties: {
          email: data.email,
          phone: data.phoneNumber,
          website_url: data.websiteUrl,
          monthly_revenue: data.monthlyRevenue,
          monthly_ad_spend: data.adSpend,
          lead_source: 'VIP Signup Form',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HubSpot] Create contact failed: ${response.status} - ${errorText}`);
      return false;
    }

    console.log('[HubSpot] Contact created successfully');
    return true;
  } catch (error) {
    console.error('[HubSpot] Error creating contact:', error);
    return false;
  }
}

/**
 * Update an existing contact in HubSpot
 */
async function updateContact(contactId: string, data: LeadFormData): Promise<boolean> {
  try {
    const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        properties: {
          phone: data.phoneNumber,
          website_url: data.websiteUrl,
          monthly_revenue: data.monthlyRevenue,
          monthly_ad_spend: data.adSpend,
          lead_source: 'VIP Signup Form',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HubSpot] Update contact failed: ${response.status} - ${errorText}`);
      return false;
    }

    console.log(`[HubSpot] Contact ${contactId} updated successfully`);
    return true;
  } catch (error) {
    console.error('[HubSpot] Error updating contact:', error);
    return false;
  }
}

/**
 * Upsert a contact in HubSpot (update if exists, create if not)
 *
 * This function:
 * - Searches for existing contact by email
 * - Updates if found, creates if not
 * - Fires asynchronously (doesn't block user flow)
 * - Logs errors but doesn't throw (silent fail)
 *
 * @param data - The lead form data to sync
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function upsertHubSpotContact(data: LeadFormData): Promise<boolean> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  // Check if token is configured
  if (!token || token === 'YOUR_HUBSPOT_ACCESS_TOKEN_HERE') {
    console.warn('[HubSpot] Access token not configured - skipping sync');
    return false;
  }

  try {
    // Search for existing contact
    const existingContactId = await searchContactByEmail(data.email);

    if (existingContactId) {
      // Update existing contact
      return await updateContact(existingContactId, data);
    } else {
      // Create new contact
      return await createContact(data);
    }
  } catch (error) {
    console.error('[HubSpot] Error in upsert operation:', error);
    return false;
  }
}

/**
 * Note: HubSpot Custom Properties Setup
 *
 * Before using this integration, you need to create these custom properties in HubSpot:
 *
 * 1. Go to HubSpot > Settings > Properties > Contact Properties
 * 2. Create the following properties:
 *
 *    - Internal name: website_url
 *      Label: Website URL
 *      Type: Single-line text
 *
 *    - Internal name: monthly_revenue
 *      Label: Monthly Revenue
 *      Type: Dropdown select
 *      Options: 0-50k, 50k-100k, 100k-250k, 250k-500k, 500k-1m, 1m+
 *
 *    - Internal name: monthly_ad_spend
 *      Label: Monthly Ad Spend
 *      Type: Dropdown select
 *      Options: 0-10k, 10k-25k, 25k-50k, 50k-100k, 100k-250k, 250k+
 *
 *    - Internal name: lead_source
 *      Label: Lead Source
 *      Type: Single-line text
 */

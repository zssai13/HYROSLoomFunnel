# VIP Signup System - Architecture Documentation

## Overview

A lead capture system that collects prospect information through a multi-step form, then syncs data to Slack and HubSpot in real-time.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                              │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   React Frontend (Next.js)                   │   │
│   │   • Multi-step form UI (4 steps)                            │   │
│   │   • Client-side validation                                   │   │
│   │   • HYROS branded styling                                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/submit-lead
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel Serverless Function                       │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              API Route: /api/submit-lead                     │   │
│   │   • Server-side validation                                   │   │
│   │   • Orchestrates integrations (fire-and-forget)             │   │
│   │   • Always returns success to user                          │   │
│   │   • Logs errors silently                                     │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│                 ┌──────────────┴──────────────┐                     │
│                 ▼                              ▼                     │
│   ┌──────────────────────────┐  ┌──────────────────────────┐        │
│   │   Slack Integration      │  │   HubSpot Integration    │        │
│   │   (Webhook POST)         │  │   (REST API v3)          │        │
│   │   src/lib/slack.ts       │  │   src/lib/hubspot.ts     │        │
│   └──────────────────────────┘  └──────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                 │                              │
                 ▼                              ▼
┌────────────────────────────┐  ┌────────────────────────────────────┐
│      Slack Workspace       │  │            HubSpot CRM             │
│   #vip-leads channel       │  │   Contacts with custom properties  │
└────────────────────────────┘  └────────────────────────────────────┘
```

---

## File Structure

```
vip-signup/
├── public/
│   └── favicon.svg              # HYROS logo favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit-lead/
│   │   │       └── route.ts     # API endpoint (POST handler)
│   │   ├── globals.css          # Global styles + CSS variables
│   │   ├── layout.tsx           # Root layout with fonts
│   │   └── page.tsx             # Main form component (all 4 steps)
│   └── lib/
│       ├── hubspot.ts           # HubSpot API helper (search/create/update)
│       ├── slack.ts             # Slack webhook helper
│       └── types.ts             # TypeScript types + dropdown options
├── docs/
│   └── ARCHITECTURE.md          # This file
├── .env.example                 # Env var template (safe to commit)
├── .env.local                   # Actual env vars (DO NOT COMMIT)
├── CLAUDE.md                    # Development guidelines
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── vercel.json                  # Vercel deployment config
```

---

## Component Details

### 1. Frontend (`src/app/page.tsx`)

**Purpose:** Renders the multi-step form with HYROS branding

**State Management:**
- `step` (1-4): Current form step
- `formData`: All form field values
- `touched`: Tracks which fields have been interacted with (for validation)
- `isSubmitting`: Loading state during API call

**Form Steps:**
1. **Email Capture** - Single email input
2. **Business Details** - Revenue dropdown, ad spend dropdown, website URL
3. **VIP Qualification** - Info box + phone number input
4. **Thank You** - Confirmation message

**Key Behaviors:**
- Button disabled until all required fields filled
- Validation errors shown on blur
- Always navigates to Thank You regardless of API response

### 2. API Route (`src/app/api/submit-lead/route.ts`)

**Purpose:** Receives form data and triggers integrations

**Request:**
```typescript
POST /api/submit-lead
{
  email: string,
  monthlyRevenue: string,
  adSpend: string,
  websiteUrl: string,
  phoneNumber: string
}
```

**Response:** Always `{ success: true }`

**Key Behaviors:**
- Validates all required fields server-side
- Fires Slack and HubSpot integrations asynchronously
- Never blocks user - returns immediately
- Logs errors but doesn't surface them to user

### 3. Slack Integration (`src/lib/slack.ts`)

**Purpose:** Posts formatted lead notification to Slack channel

**Method:** Incoming Webhook (POST)

**Message Format:**
```
*New VIP Lead Submission*

*Email:* prospect@company.com
*Monthly Revenue:* $100,000 - $250,000
*Ad Spend:* $25,000 - $50,000
*Website:* https://example.com
*Phone:* +1 (555) 123-4567

_Submitted: Jan 20, 2025 at 3:45 PM_
```

**Error Handling:** Logs failure, returns false, doesn't throw

### 4. HubSpot Integration (`src/lib/hubspot.ts`)

**Purpose:** Creates or updates contact in HubSpot CRM

**Method:** HubSpot REST API v3

**Operations:**
1. Search for existing contact by email
2. If found → PATCH to update
3. If not found → POST to create

**Custom Properties Required:**
| Property | Internal Name | Type |
|----------|---------------|------|
| Website URL | `website_url` | Single-line text |
| Monthly Revenue | `monthly_revenue` | Single-line text |
| Monthly Ad Spend | `monthly_ad_spend` | Single-line text |
| Lead Source | `lead_source` | Single-line text |

**Error Handling:** Logs failure, returns false, doesn't throw

---

## Data Flow

```
User fills form
       │
       ▼
[Client Validation] ─── Invalid ──→ Show error, stay on step
       │
       │ Valid
       ▼
[Submit button clicked]
       │
       ▼
[POST /api/submit-lead]
       │
       ▼
[Server Validation] ─── Invalid ──→ Log error, return success anyway
       │
       │ Valid
       ▼
[Fire integrations async]
       │
       ├──→ [Slack Webhook] ──→ Log result
       │
       └──→ [HubSpot API] ──→ Log result
       │
       ▼
[Return { success: true }]
       │
       ▼
[Show Thank You screen]
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_WEBHOOK_URL` | Yes* | Slack incoming webhook URL |
| `HUBSPOT_ACCESS_TOKEN` | Yes* | HubSpot private app token |

*Integrations gracefully skip if not configured

---

## Design Decisions

### 1. Always Return Success
**Why:** User experience is paramount. Integration failures shouldn't block the user or show confusing errors. We capture the data and can retry manually if needed.

### 2. Fire-and-Forget Integrations
**Why:** Reduces response time. User sees Thank You immediately. Integrations run in background.

### 3. Client-Side Form State
**Why:** Simple, no database needed. Form is single-session, no need to persist partial progress.

### 4. Inline Styles in page.tsx
**Why:** Matches original MVP exactly. All styles co-located with component. Easy to compare against reference design.

---

## Security Considerations

- API keys stored in environment variables
- Server-side validation prevents malformed data
- HTTPS enforced by Vercel
- No sensitive data logged (phone masked in logs)

---

## Scaling Considerations

Current capacity handles 30-50 submissions/day easily.

For higher volume:
1. Add rate limiting (IP-based)
2. Add CAPTCHA (reCAPTCHA v3 or Turnstile)
3. Queue integrations (if response time matters)

---

*Last updated: January 2025*

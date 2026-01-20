# VIP Signup System

A branded multi-step lead capture form for HYROS VIP DFY setup and support applications.

## Features

- 4-step multi-step form with validation
- Slack instant notifications for new leads
- HubSpot CRM integration (upsert contacts)
- HYROS branded UI matching exact design specs
- Mobile responsive design
- Error-resilient (user always sees success)

---

## Quick Start

### Phase 1: Local Development

#### Prerequisites
- Node.js 18+ installed
- npm or yarn

#### Step 1: Install Dependencies

```bash
cd vip-signup
npm install
```

#### Step 2: Configure Environment Variables

1. Open `.env.local` in the vip-signup folder
2. Replace the placeholder values with your actual API keys:

```env
# Slack - Get from https://api.slack.com/apps > Incoming Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/ACTUAL/WEBHOOK

# HubSpot - Get from HubSpot > Settings > Integrations > Private Apps
HUBSPOT_ACCESS_TOKEN=pat-na1-your-actual-token-here
```

**Note:** You can run the app without these keys - it will just skip the integrations and log warnings.

#### Step 3: Run Development Server

```bash
npm run dev
```

#### Step 4: Test Locally

1. Open http://localhost:3000
2. Fill out the form through all 4 steps
3. Check your terminal for API logs
4. If configured, check Slack and HubSpot for the data

---

### Phase 2: Vercel Deployment

#### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository (recommended) or Vercel CLI

#### Option A: Deploy via GitHub (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: VIP Signup System"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Environment Variables:**
   - In the Vercel project settings
   - Go to Settings > Environment Variables
   - Add:
     - `SLACK_WEBHOOK_URL` = your webhook URL
     - `HUBSPOT_ACCESS_TOKEN` = your HubSpot token
   - Click "Save"

4. **Deploy:**
   - Vercel will auto-deploy on every push to main

5. **Configure Custom Domain (Optional):**
   - Go to Settings > Domains
   - Add your subdomain (e.g., `signup.hyros.com`)
   - Update DNS records as instructed by Vercel

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add SLACK_WEBHOOK_URL
   vercel env add HUBSPOT_ACCESS_TOKEN
   ```

5. **Redeploy with env vars:**
   ```bash
   vercel --prod
   ```

---

## API Keys Setup Guide

### Slack Webhook URL

1. Go to https://api.slack.com/apps
2. Click "Create New App" > "From scratch"
3. Name: "VIP Lead Notifications"
4. Select your workspace
5. Go to "Incoming Webhooks" in the sidebar
6. Toggle "Activate Incoming Webhooks" to ON
7. Click "Add New Webhook to Workspace"
8. Select the channel for notifications (e.g., #vip-leads)
9. Click "Allow"
10. Copy the Webhook URL

### HubSpot Private App Token

1. Go to HubSpot > Settings (gear icon)
2. Click "Integrations" > "Private Apps"
3. Click "Create a private app"
4. Name: "VIP Signup Form"
5. Go to "Scopes" tab
6. Under CRM, enable:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read`
   - `crm.schemas.contacts.write`
7. Click "Create app"
8. Copy the access token

### HubSpot Custom Properties

Create these custom properties in HubSpot for the data to sync correctly:

1. Go to HubSpot > Settings > Properties
2. Click "Contact properties"
3. Create these properties:

| Property Label | Internal Name | Field Type |
|---------------|---------------|------------|
| Website URL | `website_url` | Single-line text |
| Monthly Revenue | `monthly_revenue` | Single-line text |
| Monthly Ad Spend | `monthly_ad_spend` | Single-line text |
| Lead Source | `lead_source` | Single-line text |

---

## Project Structure

```
vip-signup/
├── public/
│   └── favicon.svg           # HYROS logo favicon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit-lead/
│   │   │       └── route.ts  # API endpoint
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main form component
│   └── lib/
│       ├── hubspot.ts        # HubSpot API helper
│       ├── slack.ts          # Slack webhook helper
│       └── types.ts          # TypeScript types
├── .env.example              # Env var template (safe to commit)
├── .env.local                # Your actual env vars (DO NOT COMMIT)
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
└── vercel.json               # Vercel deployment config
```

---

## Testing Checklist

### Local Testing
- [ ] Form renders all 4 steps correctly
- [ ] Validation prevents empty submissions
- [ ] Button states (disabled/enabled) work correctly
- [ ] Form data persists across steps
- [ ] API logs submission data to console
- [ ] Thank you screen displays after submission

### Integration Testing (after API keys configured)
- [ ] Slack message appears in channel within 5 seconds
- [ ] Slack message contains all fields formatted correctly
- [ ] New email creates contact in HubSpot
- [ ] Existing email updates contact in HubSpot
- [ ] All custom properties populated correctly

### Production Testing
- [ ] Form works on Vercel deployment
- [ ] Integrations fire correctly in production
- [ ] Mobile responsive on various devices
- [ ] Custom domain works (if configured)

---

## Troubleshooting

### "Slack notification not sending"
- Check SLACK_WEBHOOK_URL is correct
- Verify webhook is activated in Slack app settings
- Check Vercel function logs for errors

### "HubSpot contact not created"
- Verify HUBSPOT_ACCESS_TOKEN is correct
- Check that all scopes are enabled on the private app
- Ensure custom properties exist in HubSpot
- Check Vercel function logs for API error responses

### "Form not submitting"
- Check browser console for JavaScript errors
- Verify API route is accessible at /api/submit-lead
- Check network tab for failed requests

---

## Support

For issues with this system, check:
1. Vercel function logs (Settings > Functions > View Logs)
2. Browser developer console
3. Network tab for API responses

# URL Tracking System - Setup Guide

This guide will help you set up the custom URL tracking system for your portfolio.

## Overview

The tracking system allows you to create unique URLs like:
- `yoursite.com/google` → tracks Google's visit
- `yoursite.com/meta` → tracks Meta's visit
- `yoursite.com/amazon` → tracks Amazon's visit

When someone visits these URLs, their visit is logged and they're redirected to your homepage.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new organization (you can use your name)

## Step 2: Create Supabase Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `portfolio-tracking` (or any name you prefer)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your target audience
   - **Pricing Plan**: Free (sufficient for thousands of visits)
3. Click "Create new project"
4. Wait ~2 minutes for the project to be ready

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is correct!

## Step 4: Get Your API Credentials

1. In Supabase dashboard, go to "Project Settings" (gear icon in sidebar)
2. Click "API" in the settings menu
3. You'll see two important values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **Service Role Key** (click "Reveal" to see it):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **IMPORTANT**: Keep the service role key secret! Never commit it to Git.

## Step 5: Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ADMIN_ACCESS_TOKEN=generate-this-next
   ```

3. Generate a secure admin token:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as your `ADMIN_ACCESS_TOKEN`

4. Save the file

## Step 6: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test a tracking URL:
   - Visit `http://localhost:3000/test-company`
   - You should see a loading spinner, then redirect to homepage

3. Check if the visit was logged:
   - Go to Supabase dashboard → "Table Editor" → "visits"
   - You should see one row with `company_id: "test-company"`

4. Access the admin dashboard:
   - Visit `http://localhost:3000/admin/visits`
   - Enter your `ADMIN_ACCESS_TOKEN` from `.env.local`
   - You should see your test visit!

## Step 7: Deploy to Vercel

1. Push your code to GitHub (make sure `.env.local` is gitignored!)

2. In Vercel dashboard, go to your project settings

3. Add environment variables:
   - Go to "Settings" → "Environment Variables"
   - Add all three variables from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ADMIN_ACCESS_TOKEN`

4. Redeploy your site

5. Test with your production URL:
   - Visit `yoursite.com/google`
   - Check admin dashboard at `yoursite.com/admin/visits`

## How to Use

### Creating Tracking URLs

For each company you're reaching out to, create a unique URL:

```
yoursite.com/google
yoursite.com/meta
yoursite.com/amazon
yoursite.com/stripe
yoursite.com/openai
```

**Tips**:
- Use lowercase company names
- Use hyphens for multi-word companies: `yoursite.com/y-combinator`
- Keep them short and memorable

### Including in Emails

Add your tracking URL to your email signature or application:

```
Hi [Recruiter Name],

I'm interested in the SDE position at Google. You can view my portfolio at:
https://yoursite.com/google

Best regards,
Eshaan
```

### Viewing Analytics

1. Go to `yoursite.com/admin/visits`
2. Enter your admin token
3. View:
   - Total visits
   - Unique companies that visited
   - When each company visited
   - How many times they came back
   - What device/browser they used

### Exporting Data

Click "Export CSV" in the admin dashboard to download all visit data for your records.

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has all three variables
- Restart your dev server after adding environment variables

### "Failed to log visit"
- Check that you ran the SQL schema in Supabase
- Verify your service role key is correct
- Check Supabase dashboard for any error messages

### "Unauthorized" when accessing admin dashboard
- Make sure you're using the exact token from `.env.local`
- No extra spaces or quotes around the token

### Visits not showing up
- Check Supabase dashboard → "Table Editor" → "visits" to see raw data
- Make sure your API routes are deployed correctly
- Check browser console for any errors

## Privacy & Security

✅ **What's tracked**:
- Company identifier (from URL)
- Timestamp of visit
- Browser/device type (user agent)
- Referrer (where they came from)

❌ **What's NOT tracked**:
- Names or email addresses
- Exact location (only IP for spam prevention)
- Browsing behavior beyond the initial visit

All data is stored securely in Supabase with Row Level Security enabled.

## Next Steps

- Test with a few companies before sending real applications
- Monitor the dashboard to see which companies are interested
- Use the data to follow up strategically
- Export data periodically for your records

Good luck with your job search! 🚀

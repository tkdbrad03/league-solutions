# SheetDB Setup Guide

This guide explains how the Google Sheets integration works for the League Solutions Configurator using SheetDB.

## What is SheetDB?

SheetDB turns any Google Sheet into a REST API. This means your form can send data directly to Google Sheets without needing complex authentication like Service Accounts.

## How It Works

1. **Your Form** → Submits data
2. **Vercel API** (`/api/submit-proposal.js`) → Receives the data
3. **SheetDB API** → Forwards it to Google Sheets
4. **Google Sheets** → Data appears in your spreadsheet

## Current Setup

Your form is already configured to use SheetDB with this endpoint:
```
https://sheetdb.io/api/v1/ax3gbf2cfplov
```

This endpoint is hardcoded in the API, so **no environment variables are needed** for basic functionality.

---

## Testing Your Setup

1. Go to your deployed form: `https://your-site.vercel.app/configure`
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet to verify the data was added

---

## (Optional) Using Environment Variables

If you want to change the SheetDB API URL without editing code, you can set an environment variable in Vercel:

### In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `SHEETDB_API_URL`
   - **Value**: `https://sheetdb.io/api/v1/ax3gbf2cfplov` (or your custom endpoint)
3. Redeploy your application

---

## Column Mapping

The form sends the following data fields to your Google Sheet:

| Column | Field Name | Description |
|--------|-----------|-------------|
| A | `timestamp` | Date and time of submission |
| B | `name` | Contact name |
| C | `email` | Contact email |
| D | `phone` | Contact phone number |
| E | `leagueName` | Name of the league |
| F | `leagueType` | Type of league |
| G | `members` | Number of members |
| H | `frequency` | Meeting frequency |
| I | `timeline` | Implementation timeline |
| J | `challenges` | Challenges/comments |
| K | `moduleCount` | Number of modules selected |
| L | `modules` | List of selected modules |

---

## Troubleshooting

### Form submits but no data appears in Google Sheet

**Check SheetDB Configuration:**
1. Go to https://sheetdb.io
2. Log in and check your API settings
3. Verify the Google Sheet is still connected
4. Check if you've hit the free tier limit (500 requests/month)

**Check Column Names:**
Make sure your Google Sheet has the following column headers in the first row:
```
timestamp | name | email | phone | leagueName | leagueType | members | frequency | timeline | challenges | moduleCount | modules
```

### Error: "Failed to write to Google Sheets via SheetDB"

**Possible causes:**
- SheetDB API is down (check https://status.sheetdb.io)
- Your SheetDB free tier limit was reached
- The Google Sheet was disconnected from SheetDB

**Solution:**
Check the Vercel function logs for the specific error message.

### How to Check Vercel Logs:
1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions** → **submit-proposal**
5. View the logs for detailed error messages

---

## SheetDB Free Tier Limits

- **500 requests per month**
- If you need more, you can upgrade to a paid plan or create multiple SheetDB APIs

---

## Advantages of SheetDB

✅ **No complex authentication** - No service accounts or OAuth needed
✅ **Never expires** - Set it once and forget it
✅ **No re-authorization** - Unlike Google Apps Script
✅ **Simple setup** - 5 minutes to get started
✅ **Works with existing Google Sheets** - No need to migrate data

---

## Security Notes

- Your SheetDB API URL is public in the code, but that's okay for this use case
- Anyone with the URL can append data to your sheet (which is what you want for a form)
- If you need to restrict access, SheetDB offers authentication options in paid plans
- The data is write-only (append only) - visitors can't read existing data

---

## Summary

Your form is now configured to use SheetDB, which:
- Solves the authentication problem
- Never needs re-authorization
- Is simpler than Service Accounts
- Just works!

No further setup is needed unless you want to customize the SheetDB endpoint via environment variables.

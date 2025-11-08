# Google Sheets API Setup Guide

This guide explains how to set up Google Sheets API authentication for the League Solutions Configurator.

## Problem Identified

The original implementation used an API key for Google Sheets write operations, which **does not work**. Google Sheets API requires proper authentication (Service Account or OAuth) for write operations like appending data.

## Solution: Service Account Authentication

We've updated the API to use Google Service Account authentication, which is the recommended approach for server-to-server applications.

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your **Project ID**

---

## Step 2: Enable Google Sheets API

1. In your Google Cloud Project, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and press **Enable**

---

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service Account**
3. Fill in the details:
   - **Service account name**: `league-solutions-sheets` (or any name you prefer)
   - **Service account ID**: Will be auto-generated
   - **Description**: "Service account for League Solutions form submissions"
4. Click **CREATE AND CONTINUE**
5. Skip the optional permissions (click **CONTINUE** then **DONE**)

---

## Step 4: Create and Download Service Account Key

1. In **Credentials**, find your newly created service account
2. Click on the service account email
3. Go to the **KEYS** tab
4. Click **ADD KEY** > **Create new key**
5. Select **JSON** format
6. Click **CREATE**
7. The JSON key file will be downloaded to your computer
8. **IMPORTANT**: Keep this file secure! Never commit it to GitHub!

The downloaded JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "league-solutions-sheets@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## Step 5: Share Your Google Sheet with the Service Account

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1zyeS0MbRHTphEZTuUqGnqT5w83_CG0X2zvNragNNt6Q`
2. Click the **Share** button (top right)
3. In the "Add people and groups" field, paste the **client_email** from your JSON file
   - It looks like: `league-solutions-sheets@your-project.iam.gserviceaccount.com`
4. Set permission to **Editor**
5. **Uncheck** "Notify people" (it's a service account, not a real person)
6. Click **Share**

---

## Step 6: Configure Environment Variables in Vercel

You need to add the following environment variables to your Vercel project:

### Required Variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables (get values from your downloaded JSON file):

| Variable Name | Value | Example |
|--------------|-------|---------|
| `GOOGLE_PROJECT_ID` | `project_id` from JSON | `my-project-12345` |
| `GOOGLE_PRIVATE_KEY_ID` | `private_key_id` from JSON | `abc123def456...` |
| `GOOGLE_PRIVATE_KEY` | `private_key` from JSON | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `GOOGLE_CLIENT_EMAIL` | `client_email` from JSON | `league-solutions@my-project.iam.gserviceaccount.com` |
| `GOOGLE_CLIENT_ID` | `client_id` from JSON | `123456789012345678901` |
| `GOOGLE_CERT_URL` | `client_x509_cert_url` from JSON | `https://www.googleapis.com/robot/v1/metadata/x509/...` |
| `GOOGLE_SHEET_ID` | Your spreadsheet ID | `1zyeS0MbRHTphEZTuUqGnqT5w83_CG0X2zvNragNNt6Q` |

### Important Notes:

- **GOOGLE_PRIVATE_KEY**: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- The private key should include `\n` characters (newlines). The code handles this automatically.
- Make sure to add these variables for **Production**, **Preview**, and **Development** environments

---

## Step 7: Redeploy Your Application

After adding the environment variables:

1. Trigger a new deployment:
   ```bash
   git add .
   git commit -m "Fix Google Sheets authentication"
   git push
   ```

2. Or manually redeploy in Vercel dashboard

---

## Step 8: Test the Form

1. Go to your deployed site: `https://your-site.vercel.app/configure`
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet to verify the data was added

---

## Troubleshooting

### Error: "Missing Google credentials"
- Make sure all required environment variables are set in Vercel
- Redeploy after adding environment variables

### Error: "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email (client_email)
- The service account needs **Editor** permissions

### Error: "Invalid credentials"
- Double-check that you copied the entire private key correctly
- Make sure there are no extra spaces or missing characters

### Form submits but no data appears in Google Sheet
- Verify the `GOOGLE_SHEET_ID` environment variable is correct
- Check that the sheet name is "Sheet1" (or update the RANGE in the code)
- Look at the Vercel function logs for detailed error messages

### How to check Vercel logs:
1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Click on the latest deployment
4. Click on **Functions**
5. Click on **submit-proposal**
6. View the logs for any error messages

---

## Security Best Practices

✅ **DO:**
- Store credentials in environment variables
- Use service accounts for server-to-server authentication
- Keep the JSON key file secure and never commit it to Git

❌ **DON'T:**
- Hardcode credentials in your source code
- Commit the service account JSON file to GitHub
- Share your private key publicly

---

## Summary of Changes Made

1. ✅ Created `package.json` with `googleapis` dependency
2. ✅ Updated `api/submit-proposal.js` to use Service Account authentication
3. ✅ Removed the insecure API key approach
4. ✅ Added proper error handling for missing credentials
5. ✅ Used environment variables for all sensitive data

---

## Next Steps

1. Follow the steps above to create your service account
2. Configure environment variables in Vercel
3. Redeploy the application
4. Test the form submission

If you encounter any issues, check the troubleshooting section or review the Vercel function logs for detailed error messages.

# Gmail Email Notifications Setup Guide

This guide explains how to set up email notifications for your League Solutions Configurator form submissions using Gmail.

## How It Works

When someone submits your form:
1. Data is saved to Google Sheets (via SheetDB)
2. An email notification is sent to your Gmail address with all the submission details
3. The user sees a success message

## Setup Steps

### Step 1: Enable 2-Factor Authentication on Gmail

Gmail App Passwords require 2-factor authentication (2FA) to be enabled on your account.

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to set up 2FA (if not already enabled)

### Step 2: Generate a Gmail App Password

App Passwords are special passwords that allow apps to access your Gmail account securely.

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. In the "Select app" dropdown, choose **Mail**
4. In the "Select device" dropdown, choose **Other (Custom name)**
5. Type a name like "League Solutions Form"
6. Click **Generate**
7. Google will show you a 16-character password (like `abcd efgh ijkl mnop`)
8. **Copy this password immediately** - you won't be able to see it again!
9. Click **Done**

### Step 3: Configure Environment Variables in Vercel

Now add your Gmail credentials to Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `EMAIL_NOTIFICATIONS_ENABLED` | `true` | `true` |
| `GMAIL_USER` | Your Gmail address | `yourname@gmail.com` |
| `GMAIL_APP_PASSWORD` | The 16-character app password (no spaces) | `abcdefghijklmnop` |
| `NOTIFICATION_EMAIL` | Where to receive notifications | `yourname@gmail.com` |

**Important Notes:**
- For `GMAIL_APP_PASSWORD`, remove all spaces from the 16-character password
- `NOTIFICATION_EMAIL` can be any email address (doesn't have to be Gmail)
- If `NOTIFICATION_EMAIL` is not set, notifications will be sent to `GMAIL_USER`
- Make sure to add these for **Production**, **Preview**, and **Development** environments

### Step 4: Redeploy Your Application

After adding the environment variables:

1. Go to your Vercel dashboard
2. Click **Deployments**
3. Click the three dots (...) on the latest deployment
4. Click **Redeploy**

Or push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy for email setup"
git push
```

### Step 5: Test Email Notifications

1. Go to your deployed form
2. Fill it out and submit
3. Check your email inbox for the notification
4. Check spam folder if you don't see it within 1-2 minutes

---

## Email Notification Details

### What's Included in the Email

Each notification email contains:
- **Subject Line**: `New Proposal: [League Name] - [Contact Name]`
- **Contact Information**: Name, email, phone
- **League Details**: League name, type, members, frequency, timeline
- **Challenges/Comments**: Any additional information provided
- **Selected Modules**: Count and list of modules selected
- **Timestamp**: When the form was submitted

### Email Format

The email is sent as HTML and includes:
- Formatted headers and sections
- Bullet-point lists for easy reading
- All form data organized by category

---

## Troubleshooting

### Email notifications not working

**Check Vercel Logs:**
1. Go to Vercel project dashboard
2. Click **Deployments** → Latest deployment
3. Click **Functions** → **submit-proposal**
4. Look for error messages in the logs

**Common Issues:**

#### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
- You're using your regular Gmail password instead of an App Password
- Solution: Generate an App Password (see Step 2 above)

#### Error: "Missing credentials"
- Environment variables not set correctly in Vercel
- Solution: Double-check all variables are added and spelled correctly

#### Error: "2FA not enabled"
- Your Gmail account doesn't have 2-factor authentication enabled
- Solution: Enable 2FA first (see Step 1 above)

#### Emails going to spam
- Gmail might flag automated emails as spam initially
- Solution: Mark the first email as "Not Spam" and future emails should arrive in inbox

#### Form submits successfully but no email arrives
- Check if `EMAIL_NOTIFICATIONS_ENABLED` is set to `true`
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
- Check spam folder
- Look at Vercel function logs for email errors

### How to disable email notifications

Set the environment variable in Vercel:
```
EMAIL_NOTIFICATIONS_ENABLED=false
```

Then redeploy. Form submissions will still save to Google Sheets, but no emails will be sent.

---

## Security Best Practices

✅ **DO:**
- Use App Passwords (never your real Gmail password)
- Store credentials in Vercel environment variables
- Keep your App Password secret
- Revoke App Passwords you're not using

❌ **DON'T:**
- Commit credentials to GitHub
- Share your App Password
- Use your regular Gmail password
- Hardcode credentials in source code

---

## Managing App Passwords

### View Your App Passwords
- Go to: https://myaccount.google.com/apppasswords
- You can see which app passwords you've created

### Revoke an App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Find the app password you want to remove
3. Click the trash/delete icon
4. Confirm deletion

If you revoke the App Password used for this form, email notifications will stop working until you generate a new one.

---

## Sending Limits

Gmail SMTP has the following limits:
- **500 emails per day** for regular Gmail accounts
- **2,000 emails per day** for Google Workspace accounts

For your use case (occasional form submissions), these limits should be more than sufficient.

---

## Alternative: Send to Multiple Recipients

If you want notifications sent to multiple people, you can:

1. Set `NOTIFICATION_EMAIL` to multiple addresses (comma-separated):
   ```
   NOTIFICATION_EMAIL=person1@example.com,person2@example.com,person3@example.com
   ```

2. Or create a Google Group and use that email address

---

## Summary

✅ Email notifications are now configured
✅ You'll receive an email for every form submission
✅ Emails include all form data in a formatted layout
✅ If email fails, form submission still succeeds (graceful failure)

**Next Steps:**
1. Enable 2FA on your Gmail account (if not already enabled)
2. Generate an App Password
3. Add environment variables to Vercel
4. Redeploy your application
5. Test with a form submission

If you have any issues, check the troubleshooting section above or review the Vercel function logs for detailed error messages.

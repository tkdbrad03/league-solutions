// Vercel Serverless Function - API Backend for League Solutions Configurator
// This file goes in /api/submit-proposal.js in your GitHub repo

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Google Sheets configuration
    const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1zyeS0MbRHTphEZTuUqGnqT5w83_CG0X2zvNragNNt6Q';
    const RANGE = 'Sheet1!A:M';

    // Service Account credentials from environment variables
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CERT_URL
    };

    // Validate required environment variables
    if (!credentials.private_key || !credentials.client_email) {
      console.error('Missing required Google Service Account credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Google credentials',
        details: 'Please configure GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL environment variables'
      });
    }

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toLocaleString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.leagueName || '',
      data.leagueType || '',
      data.members || '',
      data.frequency || '',
      data.timeline || '',
      data.challenges || '',
      data.moduleCount || '0',
      data.modules || ''
    ];

    // Append data to Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log('Successfully appended data to Google Sheets:', response.data);

    // Success
    return res.status(200).json({
      success: true,
      message: 'Proposal submitted successfully',
      updatedRange: response.data.updates?.updatedRange
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit proposal',
      details: error.message
    });
  }
}

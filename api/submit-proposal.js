// Vercel Serverless Function - API Backend for League Solutions Configurator
// This file goes in /api/submit-proposal.js in your GitHub repo

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
    const SHEET_ID = '1zyeS0MbRHTphEZTuUqGnqT5w83_CG0X2zvNragNNt6Q';
    const API_KEY = 'AIzaSyBUHIjgU0E4-Vp9gew4QWi5J3_CH2nTrUE';
    const RANGE = 'Sheet1!A:M';
    
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
    
    // Call Google Sheets API
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    
    const sheetsResponse = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData]
      })
    });
    
    const responseText = await sheetsResponse.text();
    
    if (!sheetsResponse.ok) {
      console.error('Sheets API Error:', sheetsResponse.status, responseText);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to write to Google Sheets',
        details: responseText
      });
    }
    
    // Send email notification using Resend (free tier: 3,000 emails/month)
    // You'll need to add RESEND_API_KEY to Vercel environment variables
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'League Solutions <noreply@league-solutions.complitrst.com>',
            to: 'info@complitrst.com',
            subject: `New Proposal Request: ${data.leagueName}`,
            html: `
              <h2>New League Solutions Proposal Request</h2>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>League:</strong> ${data.leagueName}</p>
              <p><strong>Type:</strong> ${data.leagueType}</p>
              <p><strong>Members:</strong> ${data.members}</p>
              <p><strong>Frequency:</strong> ${data.frequency}</p>
              <p><strong>Timeline:</strong> ${data.timeline}</p>
              <p><strong>Challenges:</strong> ${data.challenges}</p>
              <p><strong>Selected Modules (${data.moduleCount}):</strong> ${data.modules}</p>
              <p><a href="https://docs.google.com/spreadsheets/d/1zyeS0MbRHTphEZTuUqGnqT5w83_CG0X2zvNragNNt6Q/edit">View in Sheet</a></p>
            `
          })
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    // Success
    return res.status(200).json({ 
      success: true,
      message: 'Proposal submitted successfully' 
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

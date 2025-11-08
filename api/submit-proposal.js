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
    
    console.log('Received submission:', data);
    
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
    
    console.log('Row data to append:', rowData);
    
    // Call Google Sheets API
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    
    console.log('Calling Sheets API...');
    
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
    console.log('Sheets API response:', sheetsResponse.status, responseText);
    
    if (!sheetsResponse.ok) {
      console.error('Sheets API Error:', sheetsResponse.status, responseText);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to write to Google Sheets',
        details: responseText,
        status: sheetsResponse.status
      });
    }
    
    // Success
    console.log('Successfully wrote to Sheet');
    return res.status(200).json({ 
      success: true,
      message: 'Proposal submitted successfully' 
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to submit proposal',
      details: error.message,
      stack: error.stack
    });
  }
}

// Vercel Serverless Function - API Backend for League Solutions Configurator
// This file goes in /api/submit-proposal.js in your GitHub repo

export default async function handler(req, res) {
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
      data.timestamp,
      data.name,
      data.email,
      data.phone,
      data.leagueName,
      data.leagueType,
      data.members,
      data.frequency,
      data.timeline,
      data.challenges,
      data.moduleCount,
      data.modules
    ];
    
    // Call Google Sheets API
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData]
        })
      }
    );
    
    if (!sheetsResponse.ok) {
      const errorData = await sheetsResponse.json();
      console.error('Sheets API Error:', errorData);
      throw new Error('Failed to write to Google Sheets');
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

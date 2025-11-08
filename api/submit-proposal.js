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

    // SheetDB API configuration
    const SHEETDB_API_URL = process.env.SHEETDB_API_URL || 'https://sheetdb.io/api/v1/ax3gbf2cfplov';

    // Prepare row data for SheetDB
    const rowData = {
      timestamp: data.timestamp || new Date().toLocaleString(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      leagueName: data.leagueName || '',
      leagueType: data.leagueType || '',
      members: data.members || '',
      frequency: data.frequency || '',
      timeline: data.timeline || '',
      challenges: data.challenges || '',
      moduleCount: data.moduleCount || '0',
      modules: data.modules || ''
    };

    // Send data to SheetDB
    const sheetDBResponse = await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: rowData })
    });

    if (!sheetDBResponse.ok) {
      const errorText = await sheetDBResponse.text();
      console.error('SheetDB API Error:', sheetDBResponse.status, errorText);
      return res.status(500).json({
        success: false,
        error: 'Failed to write to Google Sheets via SheetDB',
        details: errorText
      });
    }

    const result = await sheetDBResponse.json();
    console.log('Successfully appended data to Google Sheets via SheetDB:', result);

    // Success
    return res.status(200).json({
      success: true,
      message: 'Proposal submitted successfully',
      sheetDBResponse: result
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

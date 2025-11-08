// Vercel Serverless Function - API Backend for League Solutions Configurator
// This file goes in /api/submit-proposal.js in your GitHub repo

import nodemailer from 'nodemailer';

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

    // Send email notification (fail gracefully if email fails)
    try {
      const emailEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';

      if (emailEnabled) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
          }
        });

        const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER;

        const emailHtml = `
          <h2>New League Solutions Proposal Submitted</h2>
          <p><strong>Submitted:</strong> ${rowData.timestamp}</p>

          <h3>Contact Information</h3>
          <ul>
            <li><strong>Name:</strong> ${rowData.name}</li>
            <li><strong>Email:</strong> ${rowData.email}</li>
            <li><strong>Phone:</strong> ${rowData.phone}</li>
          </ul>

          <h3>League Information</h3>
          <ul>
            <li><strong>League Name:</strong> ${rowData.leagueName}</li>
            <li><strong>League Type:</strong> ${rowData.leagueType}</li>
            <li><strong>Number of Members:</strong> ${rowData.members}</li>
            <li><strong>Frequency:</strong> ${rowData.frequency}</li>
            <li><strong>Timeline:</strong> ${rowData.timeline}</li>
          </ul>

          <h3>Additional Details</h3>
          <p><strong>Challenges/Comments:</strong> ${rowData.challenges || 'None provided'}</p>

          <h3>Selected Modules</h3>
          <p><strong>Count:</strong> ${rowData.moduleCount}</p>
          <p><strong>Modules:</strong> ${rowData.modules || 'None selected'}</p>

          <hr>
          <p style="color: #666; font-size: 12px;">This notification was sent from your League Solutions Configurator form.</p>
        `;

        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: notificationEmail,
          subject: `New Proposal: ${rowData.leagueName} - ${rowData.name}`,
          html: emailHtml
        });

        console.log('Email notification sent successfully');
      }
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error('Email notification failed:', emailError.message);
    }

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

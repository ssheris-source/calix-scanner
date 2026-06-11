const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { to, subject, date, count, csv, filename } = body;

  if (!to || !csv) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Calix Scanner" <${process.env.GMAIL_USER}>`,
    to,
    subject: subject || 'Calix Inventory Export',
    text: `Calix Inventory Export\n\n${count} device(s) scanned on ${date}.\n\nCSV file is attached.\n\n— Calix Scanner (do not reply)`,
    attachments: [
      {
        filename: filename || 'InventoryModel58_fields.csv',
        content:  csv,
        contentType: 'text/csv',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Mail error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

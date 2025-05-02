import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,  // Disable body parser for handling file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing file' });

    const file = files.file[0];  // Assuming files.file is an array
    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'Uploaded file not found' });
    }

    try {
      // Access the uploaded file path
      const filePath = file.filepath;

      // Parse the Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Setup Gmail transporter
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const resumePath = path.join(process.cwd(), 'public', 'resume.pdf');
      const results = [];

      // Loop through data and send emails
      for (const row of data) {
        const to = row['company_email'];
        const company = row['company_name'];
        const position = row['position'];
        const isHR = row['is_hr_mail'] === true || row['is_hr_mail'] === 'TRUE';

        const subject = isHR
          ? `Application for ${position} at ${company}`
          : `Interested in the ${position} role at ${company}`;

        const body = isHR
          ? `Dear HR,\n\nI am writing to apply for the position of ${position} at ${company}. Please find my resume attached.\n\nBest regards,\nGray`
          : `Hello,\n\nI'm interested in the ${position} role at ${company}. I've attached my resume. Looking forward to hearing from you!\n\nThanks,\nGray`;

        try {
          await transport.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            text: body,
            attachments: [
              {
                filename: 'resume.pdf',
                path: resumePath,
              },
            ],
          });

          results.push({ email: to, status: 'sent' });
        } catch (error) {
          results.push({ email: to, status: 'error', error: error.message });
        }
      }

      return res.status(200).json({ success: true, results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to process Excel file' });
    }
  });
}

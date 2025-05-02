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
          : `Request to Forward Job Application to HR Team (${position})`;

        const body = isHR
          ? `Dear Hiring Manager, \n\nI am writing to express my keen interest in being an/a ${position} at ${company}. With over 4 years of combined experience as a Finance Executive and External Audit Associate, I bring a comprehensive skill set in financial reporting, audit preparation, variance analysis, and regulatory compliance. My hands-on experience across full-set accounts, payroll administration, and statutory audit processes has equipped me to contribute effectively to your dynamic team. 
          \nI hold a Diploma in Accounting and Business (ACCA Part 1), a Certificate in Corporate and Business Law (LW) (ACCA Part 2/F4), and a Diploma in Accounting and Finance (LCCI Level 3, UK). These qualifications have not only deepened my technical knowledge of IFRS and corporate taxation but also enhanced my ability to evaluate internal controls and support clients across diverse industries. My Diploma in Communicative English has further sharpened my ability to communicate clearly with both clients and colleagues.
          \nI am proficient in MYOB, QuickBooks, and Xero, and experienced in preparing audit schedules, resolving discrepancies, and collaborating with external auditors to ensure timely and accurate reporting. I am confident that my background aligns well with the responsibilities of the role. Please refer to my resume attached for your review.
          \nThank you for considering my application. I am available for an immediate start and would welcome the chance to further discuss how my skills and experiences can contribute to your team. I can be reached via email at tyatisu7777@gmail.com or WhatsApp at +95 9780759728. \n\nBest regards,\nThin Yati Su\nemail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`
          : `Dear Respective Team, \n\nI hope this message finds you well. My name is Thin Yati Su, and I am reaching out to express my interest in joining as ${position} at ${company}. 
          \nWhile exploring your company’s website, I was unable to locate HR contact details for job applications.  I kindly ask if you could forward my resume to the appropriate HR representative or hiring manager.
          \nIf there’s a preferred process or contact for submitting applications, I’d greatly appreciate your guidance. I would also appreciate it if you could share the contact information of the HR team.Thank you for your time and assistance. 
          \nI’m enthusiastic about the opportunity to contribute to your company's success and would be grateful for your support in connecting me with the HR team. I can be reached via email at tyatisu7777@gmail.com or WhatsApp at +95 9780759728. \n\nBest regards,\nThin Yati Su\nemail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`;

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

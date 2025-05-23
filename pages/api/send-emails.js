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

const gmailAccounts = [
  { user: process.env.GMAIL_USER_1, pass: process.env.GMAIL_PASS_1 },
  { user: process.env.GMAIL_USER_2, pass: process.env.GMAIL_PASS_2 },
  { user: process.env.GMAIL_USER_3, pass: process.env.GMAIL_PASS_3 },
  { user: process.env.GMAIL_USER_4, pass: process.env.GMAIL_PASS_4 },
];

function createTransporterByIndex(index) {
  const account = gmailAccounts[index % gmailAccounts.length];
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
}

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
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const transporter = createTransporterByIndex(i);
        const sender = gmailAccounts[i % gmailAccounts.length].user;

        const to = row['company_email'];
        const company = row['company_name'];
        const position = row['position'];
        const isHR = row['is_hr_mail'] === true || row['is_hr_mail'] === 'TRUE';

        const subject = isHR
          ? `Application for ${position}`
          : `Request to Forward Job Application to HR Team (${position})`;

          const body = isHR
          ? `Dear Hiring Manager, \n\nI am writing to express my interest in being the ${position} at ${company}. With formal qualifications including a Diploma in Accounting and Business (ACCA Part 1), a Certificate in Corporate and Business Law (LW) (ACCA Part 2/F4), and a Diploma in Accounting and Finance (LCCI Level 3, UK), I bring over four years of experience in financial operations and full-set accounting. I have built a solid foundation in managing day-to-day finance functions while ensuring compliance and accuracy—skills that align closely with the requirements of the ${position} role at ${company}. 
          \nAt The Rain Channel Co., Ltd., I was responsible for full sets of accounts, staff claims, payment processing, and maintaining accurate financial records. This role sharpened my attention to detail and ability to work efficiently within tight timelines. My earlier experience as an External Audit Associate at Win Thin & Associates enhanced my skills in reconciliations, internal controls, and audit preparation while developing my ability to continuously support my effectiveness in financial operations.
          \nTechnically, I am proficient in MYOB, QuickBooks, Xero, and advanced Excel tools such as PivotTables and VLOOKUP. I am well-versed in Singapore’s regulatory environment, including GST submission, CPF calculation, payroll processing, and corporate tax filing. I am confident that my technical skills and practical experience would allow me to contribute effectively to your growing finance team. Please refer to my resume attached for your review.
          \nThank you for considering my application. I am available for an immediate start and would welcome the chance to further discuss how my skills and experiences can contribute to your team. \n\nBest regards,\nThin Yati Su\nemail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`
          : `Dear Respective Team, \n\nI hope this message finds you well. My name is Thin Yati Su, and I am reaching out to express my interest in joining as ${position} at ${company}. 
          \nWhile exploring your company’s website, I was unable to locate HR contact details for job applications.  I kindly ask if you could forward my resume to the appropriate HR representative or hiring manager.
          \nIf there’s a preferred process or contact for submitting applications, I’d greatly appreciate your guidance. I would also appreciate it if you could share the contact information of the HR team.Thank you for your time and assistance. 
          \nI’m enthusiastic about the opportunity to contribute to your company's success and would be grateful for your support in connecting me with the HR team. I can be reached via email at tyatisu7777@gmail.com or WhatsApp at +95 9780759728. \n\nBest regards,\nThin Yati Su\nemail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`;

          const htmlBody = isHR
          ? `<div style="text-align: justify; font-family: Arial, sans-serif; line-height: 1.6; width:80%;">
              <p>Dear Hiring Manager,</p>
              <p>I am writing to express my interest in being the ${position} at ${company}. With formal qualifications including a Diploma in Accounting and Business (ACCA Part 1), a Certificate in Corporate and Business Law (LW) (ACCA Part 2/F4), and a Diploma in Accounting and Finance (LCCI Level 3, UK), I bring over four years of experience in financial operations and full-set accounting. I have built a solid foundation in managing day-to-day finance functions while ensuring compliance and accuracy—skills that align closely with the requirements of the ${position} role at ${company}.</p>
              <p>At The Rain Channel Co., Ltd., I was responsible for full sets of accounts, staff claims, payment processing, and maintaining accurate financial records. This role sharpened my attention to detail and ability to work efficiently within tight timelines. My earlier experience as an External Audit Associate at Win Thin & Associates enhanced my skills in reconciliations, internal controls, and audit preparation while developing my ability to continuously support my effectiveness in financial operations.</p>
              <p>Technically, I am proficient in MYOB, QuickBooks, Xero, and advanced Excel tools such as PivotTables and VLOOKUP. I am well-versed in Singapore’s regulatory environment, including GST submission, CPF calculation, payroll processing, and corporate tax filing. I am confident that my technical skills and practical experience would allow me to contribute effectively to your growing finance team. Please refer to my resume attached for your review.</p>
              <p>Thank you for considering my application. I am available for an immediate start and would welcome the chance to further discuss how my skills and experiences can contribute to your team.</p>
              <p>Best regards,<br/>Thin Yati Su<br/>email: tyatisu7777@gmail.com<br/>WhatsApp: +95 9780759728</p>
            </div>`
          : `<div style="text-align: justify; font-family: Arial, sans-serif; line-height: 1.6; width: 80%;">
              <p>Dear Respective Team,</p>
              <p>I hope this message finds you well. My name is Thin Yati Su, and I am reaching out to express my interest in joining as ${position} at ${company}.</p>
              <p>While exploring your company’s website, I was unable to locate HR contact details for job applications.I kindly ask if you could forward my resume to the appropriate HR representative or hiring manager.</p>
              <p>If there’s a preferred process or contact for submitting applications, I’d greatly appreciate your guidance. I would also appreciate it if you could share the contact information of the HR team. Thank you for your time and assistance.</p>
              <p>I’m enthusiastic about the opportunity to contribute to your company's success and would be grateful for your support in connecting me with the HR team. I can be reached via email at tyatisu7777@gmail.com or WhatsApp at +95 9780759728.</p>
              <p>Best regards,<br/>Thin Yati Su<br/>email: tyatisu7777@gmail.com<br/>WhatsApp: +95 9780759728</p>
            </div>`;
        
        try {
          await transporter.sendMail({
            from: sender,
            to,
            subject,
            text: body,
            html: htmlBody,
            attachments: [
              {
                filename: 'Thin Yati Su - resume.pdf',
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

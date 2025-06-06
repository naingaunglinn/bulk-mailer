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
          ? `Application for ${position} position`
          : `Request to Forward Job Application to HR Team (${position})`;

          const body = isHR
          ? `Dear Hiring Manager, \n\nI am writing to express my keen interest in the ${position} position at ${company}. With formal qualifications including a Diploma in Accounting and Business (ACCA Part 1), a Certificate in Corporate and Business Law (LW) (ACCA Part 2/F4), and a Diploma in Accounting and Finance (LCCI Level 3, UK), I bring over five years of hands-on experience in financial operations and external auditing. I have built a solid foundation in managing day-to-day finance functions while ensuring compliance and accuracy—skills that align closely with the requirements of your team. 
          \nDuring my time at The Rain Channel Co., Ltd., I handled full sets of accounts, processed staff claims and payments, and ensured timely and accurate financial recordkeeping. This role not only deepened my attention to detail but also strengthened my ability to thrive under deadlines. Earlier, as an External Audit Associate at Win Thin & Associates, I honed my expertise in reconciliations, internal controls, and audit preparation, all while building a dependable and analytical approach to financial operations.
          \nTechnically, I’m proficient in MYOB, QuickBooks, and Xero, and Advanced excel tools such as pivot table and VLOOKUP. On the other hand, I am well-versed in Singapore-specific processes, including GST submission, CPF calculation, payroll processing, and corporate tax filing. I am confident that my technical skills and practical experience would allow me to contribute effectively to your growing finance team.  Kindly find my resume attached for your consideration. If this message has reached the wrong department, I would be truly grateful if you could forward it to the appropriate person.
          \nThank you for taking the time to review my application. I am available to start immediately and would be glad to further explore how my background and enthusiasm can support your team’s goals. \n\nBest regards,\nThin Yati Su\nEmail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`
          : `Dear Respective Team, \n\nI hope this message finds you well. My name is Thin Yati Su, and I am writing to express my keen interest in the ${position} position at ${company}. 
          \nWhile exploring your official website, I was unable to locate the direct contact information for your HR or recruitment team. As such, I would be sincerely grateful if you could kindly assist by forwarding my attached resume to the appropriate department or hiring personnel handling job applications.
          \nIf there is a preferred channel or contact person for career-related submissions, I would greatly appreciate it if you could advise me accordingly. I am genuinely enthusiastic about the opportunity to contribute to your esteemed organization and would be thankful for any support in guiding my application to the relevant team. 
          \nThank you for your time, consideration, and kind assistance. I look forward to the possibility of contributing to your team. \n\nBest regards,\nThin Yati Su\nEmail: tyatisu7777@gmail.com\nWhatsApp: +95 9780759728`;

          const htmlBody = isHR
          ? `<div style="text-align: justify; font-family: Arial, sans-serif; line-height: 1.6; width:80%;">
              <p>Dear Hiring Manager,</p>
              <p>I am writing to express my keen interest in the ${position} position at ${company}. With formal qualifications including a Diploma in Accounting and Business (ACCA Part 1), a Certificate in Corporate and Business Law (LW) (ACCA Part 2/F4), and a Diploma in Accounting and Finance (LCCI Level 3, UK), I bring over five years of hands-on experience in financial operations and external auditing. I have built a solid foundation in managing day-to-day finance functions while ensuring compliance and accuracy—skills that align closely with the requirements of your team.</p>
              <p>During my time at The Rain Channel Co., Ltd., I handled full sets of accounts, processed staff claims and payments, and ensured timely and accurate financial recordkeeping. This role not only deepened my attention to detail but also strengthened my ability to thrive under deadlines. Earlier, as an External Audit Associate at Win Thin & Associates, I honed my expertise in reconciliations, internal controls, and audit preparation, all while building a dependable and analytical approach to financial operations.</p>
              <p>Technically, I’m proficient in MYOB, QuickBooks, and Xero, and Advanced excel tools such as pivot table and VLOOKUP. On the other hand, I am well-versed in Singapore-specific processes, including GST submission, CPF calculation, payroll processing, and corporate tax filing. I am confident that my technical skills and practical experience would allow me to contribute effectively to your growing finance team.  Kindly find my resume attached for your consideration. If this message has reached the wrong department, I would be truly grateful if you could forward it to the appropriate person.</p>
              <p>Thank you for taking the time to review my application. I am available to start immediately and would be glad to further explore how my background and enthusiasm can support your team’s goals.</p>
              <p>Best regards,<br/>Thin Yati Su<br/>Email: tyatisu7777@gmail.com<br/>WhatsApp: +95 9780759728</p>
            </div>`
          : `<div style="text-align: justify; font-family: Arial, sans-serif; line-height: 1.6; width: 80%;">
              <p>Dear Respective Team,</p>
              <p>I hope this message finds you well. My name is Thin Yati Su, and I am writing to express my keen interest in the ${position} position at ${company}.</p>
              <p>While exploring your official website, I was unable to locate the direct contact information for your HR or recruitment team. As such, I would be sincerely grateful if you could kindly assist by forwarding my attached resume to the appropriate department or hiring personnel handling job applications.</p>
              <p>If there is a preferred channel or contact person for career-related submissions, I would greatly appreciate it if you could advise me accordingly. I am genuinely enthusiastic about the opportunity to contribute to your esteemed organization and would be thankful for any support in guiding my application to the relevant team.</p>
              <p>Thank you for your time, consideration, and kind assistance. I look forward to the possibility of contributing to your team. </p>
              <p>Best regards,<br/>Thin Yati Su<br/>Email: tyatisu7777@gmail.com<br/>WhatsApp: +95 9780759728</p>
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

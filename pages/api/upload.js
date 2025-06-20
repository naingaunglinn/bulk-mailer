import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

export default async function handler(req, res) {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing error' });

    try {
      const uploadedFile = files.file;
      const filePath = uploadedFile?.filepath || uploadedFile?.[0]?.filepath;

      if (!filePath) {
        return res.status(400).json({ error: 'No valid file path found' });
      }

      const fileMetadata = {
        name: uploadedFile.originalFilename || 'untitled',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      };

      const media = {
        mimeType: uploadedFile.mimetype,
        body: fs.createReadStream(filePath),
      };

      const uploadRes = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      res.status(200).json({ success: true, file: uploadRes.data });
    } catch (uploadError) {
      console.error(uploadError);
      res.status(500).json({ error: uploadError.message });
    }
  });
}

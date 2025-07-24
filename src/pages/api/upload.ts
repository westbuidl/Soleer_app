// src/pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for multipart form data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if BLOB_READ_WRITE_TOKEN is set
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Parse the form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB.',
      });
    }

    // Generate unique filename
    const fileExtension = file.originalFilename?.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueId = nanoid(10);
    const filename = `gig-${uniqueId}.${fileExtension}`;

    // Read file and upload to Vercel Blob
    const fileBuffer = fs.readFileSync(file.filepath);
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    console.log('File uploaded successfully:', blob.url);

    res.status(200).json({
      url: blob.url,
      filename,
      size: file.size,
      type: file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}
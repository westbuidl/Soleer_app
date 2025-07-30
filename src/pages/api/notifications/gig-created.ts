import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Define a type for the expected request body
interface GigNotificationRequest {
  gigTitle: string;
  gigDescription: string;
  gigPrice: number | string;
  gigId: string;
  userEmail: string;
  gigUrl: string;
}

// Define custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class EmailSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendError';
  }
}

// Create nodemailer transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new EmailSendError('Missing SMTP configuration: SMTP_HOST, SMTP_USER, and SMTP_PASS are required');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email sending function
async function sendEmailNotification({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return result;
  } catch (error) {
    throw new EmailSendError(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validation helper functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { gigTitle, gigDescription, gigPrice, gigId, userEmail, gigUrl } = req.body as GigNotificationRequest;

    // Validate required fields
    if (!gigTitle || !gigDescription || !gigPrice || !gigId || !userEmail || !gigUrl) {
      throw new ValidationError('Missing required fields: gigTitle, gigDescription, gigPrice, gigId, userEmail, and gigUrl are required');
    }

    // Validate email format
    if (!validateEmail(userEmail)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate URL format
    if (!validateUrl(gigUrl)) {
      throw new ValidationError('Invalid gig URL format');
    }

    // Validate price
    const priceNumber = typeof gigPrice === 'string' ? parseFloat(gigPrice) : gigPrice;
    if (isNaN(priceNumber) || priceNumber <= 0) {
      throw new ValidationError('Price must be a positive number');
    }

    // Validate gigId
    if (typeof gigId !== 'string' || gigId.trim().length === 0) {
      throw new ValidationError('Invalid gig ID');
    }

    // Send email notification
    await sendEmailNotification({
      to: userEmail,
      subject: 'Gig Posted Successfully!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your gig "${gigTitle}" has been posted successfully!</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Title:</strong> ${gigTitle}</p>
            <p><strong>Description:</strong> ${gigDescription}</p>
            <p><strong>Price:</strong> ${priceNumber} SOL</p>
            <p><strong>Gig ID:</strong> ${gigId}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="${gigUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Your Gig
            </a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for using our platform!
          </p>
        </div>
      `
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Gig notification sent successfully',
      gigId,
      sentTo: userEmail
    });

  } catch (unknownError: unknown) {
    console.error('Gig notification error:', unknownError);
    
    if (unknownError instanceof ValidationError) {
      return res.status(400).json({ message: unknownError.message });
    }
    
    if (unknownError instanceof EmailSendError) {
      return res.status(500).json({ 
        message: 'Failed to send email notification',
        error: unknownError.message
      });
    }
    
    const error = unknownError instanceof Error ? unknownError : new Error('An unexpected error occurred');
    
    return res.status(500).json({ message: error.message });
  }
}
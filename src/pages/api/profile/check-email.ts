import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet, email } = req.query;

    console.log('Received query:', { wallet, email });

    if (!wallet || typeof wallet !== 'string') {
      console.error('Invalid wallet parameter:', wallet);
      return res.status(400).json({ error: 'Wallet address is required and must be a string' });
    }

    const decodedWallet = decodeURIComponent(wallet);
    const decodedEmail = email ? decodeURIComponent(email as string) : null;

    const user = await prisma.user.findUnique({
      where: { walletAddress: decodedWallet },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        username: true,
        name: true,
        bio: true,
        website: true,
        twitter: true,
        linkedin: true,
        discord: true,
        profileImage: true,
        bannerImage: true,
        jobProfile: {
          select: {
            title: true,
            skills: true,
            description: true,
            portfolio: true,
            bannerImage: true
          }
        }
      }
    });

    if (!user) {
      console.error('User not found for wallet:', decodedWallet);
      return res.status(404).json({ error: 'User not found for the provided wallet address' });
    }

    console.log('User found:', {
      id: user.id,
      emailVerified: user.emailVerified,
      email: user.email,
      username: user.username
    });

    const isVerified = user.emailVerified && (!decodedEmail || user.email === decodedEmail);
    const userData = {
      username: user.username || '',
      name: user.name || '',
      bio: user.bio || '',
      website: user.website || '',
      twitter: user.twitter || '',
      linkedin: user.linkedin || '',
      discord: user.discord || '',
      profileImageUrl: user.profileImage || '',
      bannerImageUrl: user.bannerImage || '',
      jobTitle: user.jobProfile?.title || '',
      skills: user.jobProfile?.skills ? user.jobProfile.skills.join(', ') : '',
      jobDescription: user.jobProfile?.description || '',
      portfolio: user.jobProfile?.portfolio || '',
      jobBannerImageUrl: user.jobProfile?.bannerImage || ''
    };

    return res.status(200).json({
      isVerified,
      email: user.email || '',
      userData
    });
  } catch (error) {
    console.error('Check-email error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      error: 'Failed to check email verification',
      details: error instanceof Error ? error.message : 'Unknown server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}




/*import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Update UserData to match Prisma schema exactly
interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  bannerImage: string | null;
  verificationCode: string | null;
  isEmailVerified: boolean;
  username: string | null;
  walletAddress: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  discord: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SuccessResponse {
  isVerified: boolean;
  email?: string | null;
  userData?: UserData | null;
  message?: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

// Validation schemas
const emailSchema = z
  .string()
  .email()
  .transform(email => email.toLowerCase())
  .optional();

const walletSchema = z
  .string()
  .min(1, 'Wallet address is required')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
  .optional();

const querySchema = z.object({
  email: emailSchema,
  wallet: walletSchema
}).refine(data => data.email || data.wallet, {
  message: "At least one parameter (email or wallet) must be provided"
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // If no query parameters are provided, return early with clear message
    if (!req.query.email && !req.query.wallet) {
      return res.status(400).json({
        isVerified: false,
        message: 'Please provide either an email address or wallet address'
      });
    }

    // Validate query parameters
    const validationResult = querySchema.safeParse({
      email: req.query.email,
      wallet: req.query.wallet
    });

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation error',
        error: validationResult.error.errors[0].message
      });
    }

    const { email, wallet } = validationResult.data;

    // Case 1: Only wallet provided - check for any verified email
    if (wallet && !email) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: wallet }
      });

      if (user?.isEmailVerified) {  // Updated to match schema
        return res.status(200).json({
          isVerified: true,
          email: user.email,
          userData: user
        });
      }
      return res.status(200).json({
        isVerified: false,
        message: 'No verified email found for this wallet address'
      });
    }

    // Case 2: Both email and wallet provided - check specific combination
    if (email && wallet) {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
          walletAddress: wallet,
          isEmailVerified: true  // Updated to match schema
        }
      });

      if (user) {
        return res.status(200).json({
          isVerified: true,
          userData: user
        });
      }
      return res.status(200).json({
        isVerified: false,
        message: 'No verified user found with this email and wallet combination'
      });
    }

    // Case 3: Only email provided
    if (email && !wallet) {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
          isEmailVerified: true  // Updated to match schema
        }
      });

      if (user) {
        return res.status(200).json({
          isVerified: true,
          userData: user
        });
      }
      return res.status(200).json({
        isVerified: false,
        message: 'No verified user found with this email'
      });
    }

    // Default case (should never reach here due to validation)
    return res.status(200).json({
      isVerified: false,
      message: 'No matching user found'
    });

  } catch (error) {
    console.error('Error in verification API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });

  } finally {
    await prisma.$disconnect();
  }
}*/
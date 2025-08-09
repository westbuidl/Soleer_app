import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        name: true,
        profileImage: true,
        email: true,
        emailVerified: true,
        verificationCode: true,
        bio: true,
        bannerImage: true,
        isEmailVerified: true,
        verifiedEmail: true,
        website: true,
        twitter: true,
        linkedin: true,
        discord: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Map response to match User interface
    const response = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username || undefined,
      name: user.name || undefined,
      profileImage: user.profileImage || undefined,
      email: user.email || undefined,
      emailVerified: user.emailVerified,
      verificationCode: user.verificationCode || undefined,
      bio: user.bio || undefined,
      bannerImage: user.bannerImage || undefined,
      isEmailVerified: user.isEmailVerified,
      verifiedEmail: user.verifiedEmail || undefined,
      website: user.website || undefined,
      twitter: user.twitter || undefined,
      linkedin: user.linkedin || undefined,
      discord: user.discord || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
// pages/api/saved-gigs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const savedGigs = await prisma.savedGig.findMany({
      where: { userId: user.id },
      include: {
        gig: {
          include: {
            user: {
              select: {
                username: true,
                profileImage: true,
                walletAddress: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(savedGigs);
  } catch (error) {
    console.error('Error fetching saved gigs:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { wallet } = req.query;
      if (!wallet || typeof wallet !== 'string') {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      const user = await prisma.user.findUnique({
        where: { walletAddress: wallet },
        select: {
          id: true,
          walletAddress: true,
          emailVerified: true,
          verifiedEmail: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        id: user.id,
        walletAddress: user.walletAddress,
        emailVerified: user.emailVerified,
        verifiedEmail: user.verifiedEmail,
      });
    } catch (error) {
      console.error('User fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    } finally {
      await prisma.$disconnect();
    }
  }

  if (req.method === 'POST') {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      // Check if user exists, create if not
      let user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            createdAt: new Date(),
            emailVerified: false,
            isEmailVerified: false, // Keep for schema compatibility
          },
        });
      }

      return res.status(201).json({
        id: user.id,
        walletAddress: user.walletAddress,
        emailVerified: user.emailVerified,
        verifiedEmail: user.verifiedEmail,
      });
    } catch (error) {
      console.error('User creation error:', error);
      return res.status(500).json({ error: 'Failed to create or fetch user' });
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
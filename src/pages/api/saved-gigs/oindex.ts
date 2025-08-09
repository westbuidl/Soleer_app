// API endpoint for saved gigs (pages/api/saved-gigs/index.ts)
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API Call: ${req.method} /api/saved-gigs`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  if (req.method === 'GET') {
    try {
      const walletAddress = req.headers.authorization?.replace('Bearer ', '');
      console.log('Wallet address from auth:', walletAddress);
      
      if (!walletAddress) {
        console.log('No authorization header found');
        return res.status(401).json({ error: 'Authorization required' });
      }

      // Get user by wallet address
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      });

      console.log('User found:', user ? user.id : 'Not found');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const savedGigs = await prisma.savedGig.findMany({
        where: { userId: user.id },
        include: {
          Gig: {
            include: {
              User: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`Found ${savedGigs.length} saved gigs for user ${user.id}`);
      res.status(200).json(savedGigs);
    } catch (error) {
      console.error('Error fetching saved gigs:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'POST') {
    try {
      const { gigId, userId } = req.body;
      const walletAddress = req.headers.authorization?.replace('Bearer ', '');

      console.log('Save gig request:', { gigId, userId, walletAddress });

      if (!walletAddress) {
        console.log('No authorization header found');
        return res.status(401).json({ error: 'Authorization required' });
      }

      if (!gigId || !userId) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Gig ID and User ID are required' });
      }

      // Verify user owns the wallet
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      });

      console.log('User verification:', { 
        userFound: !!user, 
        userIdMatch: user?.id === userId,
        userIdFromDB: user?.id,
        userIdFromRequest: userId
      });

      if (!user || user.id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Verify gig exists
      const gig = await prisma.gig.findUnique({
        where: { id: gigId }
      });

      if (!gig) {
        console.log('Gig not found:', gigId);
        return res.status(404).json({ error: 'Gig not found' });
      }

      // Check if already saved
      const existingSave = await prisma.savedGig.findFirst({
        where: {
          userId,
          gigId
        }
      });

      console.log('Existing save found:', !!existingSave);

      if (existingSave) {
        return res.status(400).json({ error: 'Gig already saved' });
      }

      const savedGig = await prisma.savedGig.create({
        data: {
          userId,
          gigId
        },
        include: {
          Gig: {
            include: {
              User: true
            }
          }
        }
      });

      console.log('Gig saved successfully:', savedGig.id);
      res.status(201).json(savedGig);
    } catch (error) {
      console.error('Error saving gig:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
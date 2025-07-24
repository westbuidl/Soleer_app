import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { title, description, amount, image, status, userId, category, tags } = req.body;

      // Validate required fields
      if (!title || !description || !amount || !userId) {
        console.error('Missing required fields:', { title, description, amount, userId });
        return res.status(400).json({
          error: 'Missing required fields: title, description, amount, and userId are required',
        });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        console.error('Invalid amount:', amount);
        return res.status(400).json({
          error: 'Invalid amount. Must be between 0.01 and 1000 SOL',
        });
      }

      // Validate status
      const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
      if (status && !validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        return res.status(400).json({
          error: 'Invalid status. Must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED',
        });
      }

      // Validate tags
      if (tags && (!Array.isArray(tags) || tags.some((tag: string) => typeof tag !== 'string'))) {
        console.error('Invalid tags:', tags);
        return res.status(400).json({
          error: 'Tags must be an array of strings',
        });
      }

      // Check if user exists and is email-verified
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, emailVerified: true },
      });

      if (!user) {
        console.error('User not found for userId:', userId);
        return res.status(404).json({
          error: 'User not found. Please register your wallet address.',
        });
      }

      if (!user.emailVerified) {
        console.error('Email not verified for userId:', userId);
        return res.status(403).json({
          error: 'Email verification required. Please verify your email before posting a gig.',
        });
      }

      // Create gig in the database
      const gig = await prisma.gig.create({
        data: {
          title,
          description,
          amount,
          image: image || null,
          status: status || 'ACTIVE',
          userId,
          category: category || null,
          tags: tags || [],
        },
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          image: true,
          status: true,
          userId: true,
          category: true,
          tags: true,
        },
      });

      console.log('Created gig:', { id: gig.id, title: gig.title, userId: gig.userId });
      return res.status(201).json(gig);
    } else if (req.method === 'GET') {
      const { wallet } = req.query;

      if (wallet && typeof wallet === 'string') {
        // Fetch user-specific gigs (for dashboard, etc.)
        const decodedWallet = decodeURIComponent(wallet);
        console.log('Fetching gigs for wallet:', decodedWallet);

        const user = await prisma.user.findUnique({
          where: { walletAddress: decodedWallet },
          select: { id: true },
        });

        if (!user) {
          console.error('User not found for wallet:', decodedWallet);
          return res.status(404).json({ error: 'User not found' });
        }

        const gigs = await prisma.gig.findMany({
          where: {
            userId: user.id,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched user gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else if (!wallet) {
        // Fetch all gigs (for marketplace)
        const gigs = await prisma.gig.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched all gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else {
        console.error('Invalid wallet parameter:', wallet);
        return res.status(400).json({ error: 'Wallet address must be a string' });
      }
    } else {
      console.error('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`${req.method} gig error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      error: `Failed to ${req.method === 'POST' ? 'create' : 'fetch'} gig`,
      details: error instanceof Error ? error.message : 'Unknown server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}
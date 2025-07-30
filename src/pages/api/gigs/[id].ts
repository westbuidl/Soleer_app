// pages/api/gigs/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Only handle GET requests for individual gig details
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gig ID' });
  }

  try {
    console.log('Fetching gig with ID:', id);

    const gig = await prisma.gig.findUnique({
      where: { 
        id: id,
        status: 'ACTIVE' // Only fetch active gigs
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        amount: true,
        status: true,
        category: true,
        tags: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            profileImage: true,
            jobProfile: {
              select: { 
                skills: true 
              },
            },
          },
        },
      },
    });

    if (!gig) {
      console.log('Gig not found with ID:', id);
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Format the response to match your component's expected structure
    const formattedGig = {
      id: gig.id,
      image: gig.image || '/images/default-gig.jpg',
      title: gig.title,
      description: gig.description,
      price: Number(gig.amount),
      category: gig.category,
      tags: gig.tags || [],
      createdAt: gig.createdAt?.toISOString(),
      userId: gig.userId,
      freelancer: {
        name: gig.user.name || 'Anonymous',
        avatar: gig.user.profileImage || '/images/default-avatar.png',
        skills: gig.user.jobProfile?.skills || [],
      },
    };

    console.log('Successfully fetched gig:', formattedGig.id);
    return res.status(200).json(formattedGig);

  } catch (error) {
    console.error('Error fetching gig:', {
      gigId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return res.status(500).json({
      error: 'Failed to fetch gig',
      details: error instanceof Error ? error.message : 'Unknown server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}
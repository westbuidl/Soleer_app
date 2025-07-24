// src/pages/api/gigs/[id]/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gig ID' });
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return await updateGigStatus(req, res, id);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH - Update only gig status
async function updateGigStatus(req: NextApiRequest, res: NextApiResponse, gigId: string) {
  try {
    const { status, userId } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required for authorization' });
    }

    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED' 
      });
    }

    // Check if gig exists and verify ownership
    const existingGig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { user: true }
    });

    if (!existingGig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Authorization check
    if (existingGig.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own gigs' });
    }

    // Update only the status
    const updatedGig = await prisma.gig.update({
      where: { id: gigId },
      data: {
        status: status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    console.log('Gig status updated successfully:', updatedGig.id, 'Status:', status);

    return res.status(200).json({
      id: updatedGig.id,
      title: updatedGig.title,
      description: updatedGig.description,
      image: updatedGig.image,
      amount: updatedGig.amount,
      status: updatedGig.status,
      category: updatedGig.category,
      tags: updatedGig.tags,
      user: updatedGig.user,
      createdAt: updatedGig.createdAt,
      updatedAt: updatedGig.updatedAt
    });

  } catch (error) {
    console.error('Error updating gig status:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gig not found' });
    }
    
    return res.status(500).json({ error: 'Failed to update gig status' });
  }
}

// Utility function to get user ID from wallet address (if needed)
export async function getUserIdFromWallet(walletAddress: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true }
    });
    
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID from wallet:', error);
    return null;
  }
}
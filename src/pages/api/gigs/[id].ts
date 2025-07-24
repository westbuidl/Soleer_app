// src/pages/api/gigs/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid gig ID' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        return await updateGig(req, res, id);
      case 'DELETE':
        return await deleteGig(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update entire gig
async function updateGig(req: NextApiRequest, res: NextApiResponse, gigId: string) {
  try {
    const {
      title,
      description,
      amount,
      image,
      status,
      category,
      tags,
      userId // Include userId for authorization
    } = req.body;

    // Validation
    if (!title || !description || amount === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, and amount are required' 
      });
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
      return res.status(400).json({ 
        error: 'Amount must be a number between 0.01 and 1000' 
      });
    }

    if (title.length > 100) {
      return res.status(400).json({ 
        error: 'Title must be 100 characters or less' 
      });
    }

    if (description.length > 500) {
      return res.status(400).json({ 
        error: 'Description must be 500 characters or less' 
      });
    }

    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
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

    // Authorization check - ensure user owns the gig
    if (existingGig.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own gigs' });
    }

    // Process tags
    let processedTags: string[] = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    // Update the gig
    const updatedGig = await prisma.gig.update({
      where: { id: gigId },
      data: {
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount.toFixed(2)),
        image: image || existingGig.image,
        status: status || existingGig.status,
        category: category?.trim() || null,
        tags: processedTags,
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

    console.log('Gig updated successfully:', updatedGig.id);

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
    console.error('Error updating gig:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gig not found' });
    }
    
    return res.status(500).json({ error: 'Failed to update gig' });
  }
}

// DELETE - Delete gig
async function deleteGig(req: NextApiRequest, res: NextApiResponse, gigId: string) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required for authorization' });
    }

    // Check if gig exists and verify ownership
    const existingGig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { 
        user: true,
        savedBy: true // Include saved relationships
      }
    });

    if (!existingGig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Authorization check
    if (existingGig.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own gigs' });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First, delete all saved gig relationships
      await tx.savedGig.deleteMany({
        where: { gigId: gigId }
      });

      // Then delete the gig
      await tx.gig.delete({
        where: { id: gigId }
      });
    });

    console.log('Gig deleted successfully:', gigId);

    return res.status(200).json({ 
      message: 'Gig deleted successfully',
      deletedGigId: gigId 
    });

  } catch (error) {
    console.error('Error deleting gig:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Gig not found' });
    }
    
    return res.status(500).json({ error: 'Failed to delete gig' });
  }
}
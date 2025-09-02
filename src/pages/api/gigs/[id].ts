// pages/api/gigs/[id].ts
/*import { NextApiRequest, NextApiResponse } from 'next';
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
}*/


// pages/api/gigs/[id].ts
/*import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  console.log(`=== API /gigs/[id] ${req.method} ===`);
  console.log('Request ID:', id);
  console.log('Request method:', req.method);

  // Only handle GET requests for individual gig details
  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id || typeof id !== 'string') {
    console.log('Invalid gig ID:', id);
    return res.status(400).json({ error: 'Invalid gig ID' });
  }

  try {
    console.log('Connecting to database...');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (connectError) {
      console.error('Database connection failed:', connectError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: connectError instanceof Error ? connectError.message : 'Unknown connection error'
      });
    }

    console.log('Querying gig with ID:', id);

    // First, let's check if the gig exists at all (regardless of status)
    const gigExists = await prisma.gig.findUnique({
      where: { id: id },
      select: { id: true, status: true, title: true }
    });

    console.log('Gig existence check:', gigExists);

    if (!gigExists) {
      console.log('Gig does not exist in database');
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Now fetch the full gig data
    const gig = await prisma.gig.findUnique({
      where: { 
        id: id
        // Remove status filter temporarily to debug
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
            id: true,
            name: true,
            profileImage: true,
            email: true, // Add for debugging
            jobProfile: {
              select: { 
                skills: true 
              },
            },
          },
        },
      },
    });

    console.log('Full gig query result:', {
      found: !!gig,
      id: gig?.id,
      title: gig?.title,
      status: gig?.status,
      userId: gig?.userId,
      userExists: !!gig?.user,
      userName: gig?.user?.name
    });

    if (!gig) {
      console.log('Gig not found in full query');
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Check if gig is active (but still return inactive gigs for debugging)
    if (gig.status !== 'ACTIVE') {
      console.log('WARNING: Gig status is not ACTIVE:', gig.status);
      // In production, you might want to return 404 here
      // For debugging, let's continue but log the status
    }

    // Format the response to match your component's expected structure
    const formattedGig = {
      id: gig.id,
      image: gig.image || '/images/default-gig.jpg',
      title: gig.title,
      description: gig.description,
      price: Number(gig.amount),
      category: gig.category,
      tags: Array.isArray(gig.tags) ? gig.tags : [],
      createdAt: gig.createdAt?.toISOString(),
      userId: gig.userId,
      freelancer: {
        name: gig.user?.name || 'Anonymous',
        avatar: gig.user?.profileImage || '/images/default-avatar.png',
        skills: Array.isArray(gig.user?.jobProfile?.skills) ? gig.user.jobProfile.skills : [],
      },
    };

    console.log('Successfully formatted gig:', {
      id: formattedGig.id,
      title: formattedGig.title,
      price: formattedGig.price,
      freelancerName: formattedGig.freelancer.name
    });

    return res.status(200).json(formattedGig);

  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error fetching gig:', {
      gigId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    });
    
    // More detailed error response for debugging
    const errorResponse: {
      error: string;
      details: string;
      gigId: string | string[];
      timestamp: string;
      stack?: string;
    } = {
      error: 'Failed to fetch gig',
      details: error instanceof Error ? error.message : 'Unknown server error',
      gigId: id,
      timestamp: new Date().toISOString()
    };

    // Add additional error details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error instanceof Error ? error.stack : undefined;
    }
    
    return res.status(500).json(errorResponse);
  } finally {
    console.log('Disconnecting from database...');
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

// Add a health check endpoint for debugging
export const config = {
  api: {
    externalResolver: true,
  },
}*/

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  console.log(`=== API /gigs/[id] ${req.method} ===`);
  console.log('Request ID:', id);
  console.log('Request method:', req.method);

  if (!id || typeof id !== 'string') {
    console.log('Invalid gig ID:', id);
    return res.status(400).json({ error: 'Invalid gig ID' });
  }

  const walletAddress = req.headers['x-wallet-address'] as string | undefined;
  console.log('Wallet address from header:', walletAddress ? walletAddress.substring(0, 8) + '...' : 'None');

  try {
    console.log('Connecting to database...');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (connectError) {
      console.error('Database connection failed:', connectError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: connectError instanceof Error ? connectError.message : 'Unknown connection error'
      });
    }

    if (req.method === 'GET') {
      console.log('Handling GET request');
      console.log('Querying gig with ID:', id);

      // First, check if the gig exists
      const gigExists = await prisma.gig.findUnique({
        where: { id: id },
        select: { id: true, status: true, title: true, userId: true }
      });

      console.log('Gig existence check:', gigExists);

      if (!gigExists) {
        console.log('Gig not found in database');
        return res.status(404).json({ error: 'Gig not found' });
      }

      // Now fetch the full gig data
      const gig = await prisma.gig.findUnique({
        where: { id: id },
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
              id: true,
              name: true,
              profileImage: true,
              email: true, // Add for debugging
              jobProfile: {
                select: { 
                  skills: true 
                },
              },
            },
          },
        },
      });

      console.log('Full gig query result:', {
        found: !!gig,
        id: gig?.id,
        title: gig?.title,
        status: gig?.status,
        userId: gig?.userId,
        userExists: !!gig?.user,
        userName: gig?.user?.name
      });

      if (!gig) {
        console.log('Gig not found in full query');
        return res.status(404).json({ error: 'Gig not found' });
      }

      // Check if gig is active
      if (gig.status !== 'ACTIVE') {
        console.log('WARNING: Gig status is not ACTIVE:', gig.status);
        // For debugging, return the gig anyway but note the status
        // In production, uncomment the following:
        // return res.status(404).json({ error: 'Gig not found' });
      }

      // Format the response
      const formattedGig = {
        id: gig.id,
        image: gig.image || '/images/default-gig.jpg',
        title: gig.title,
        description: gig.description,
        price: Number(gig.amount),
        category: gig.category,
        tags: Array.isArray(gig.tags) ? gig.tags : [],
        createdAt: gig.createdAt?.toISOString(),
        userId: gig.userId,
        freelancer: {
          name: gig.user?.name || 'Anonymous',
          avatar: gig.user?.profileImage || '/images/default-avatar.png',
          skills: Array.isArray(gig.user?.jobProfile?.skills) ? gig.user.jobProfile.skills : [],
        },
      };

      console.log('Successfully formatted gig:', {
        id: formattedGig.id,
        title: formattedGig.title,
        price: formattedGig.price,
        freelancerName: formattedGig.freelancer.name
      });

      return res.status(200).json(formattedGig);
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Handling PUT/PATCH request');
      if (!walletAddress) {
        console.log('No wallet address provided');
        return res.status(401).json({ error: 'Unauthorized: Wallet address required' });
      }

      // Fetch existing gig
      const existingGig = await prisma.gig.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingGig) {
        console.log('Gig not found for update');
        return res.status(404).json({ error: 'Gig not found' });
      }

      if (existingGig.userId !== walletAddress) {
        console.log('Unauthorized update attempt');
        console.log('Gig userId:', existingGig.userId);
        console.log('Request wallet:', walletAddress);
        return res.status(403).json({ error: 'Forbidden: You do not own this gig' });
      }

      const updateData = req.body;

      console.log('Update data received:', {
        title: updateData.title,
        description: updateData.description?.substring(0, 50) + '...',
        amount: updateData.amount,
        status: updateData.status,
        category: updateData.category,
        tags: updateData.tags,
        image: updateData.image,
      });

      // Validate data
      if (updateData.amount && (isNaN(updateData.amount) || updateData.amount <= 0)) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (updateData.status && !['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'].includes(updateData.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const updatedGig = await prisma.gig.update({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description,
          amount: updateData.amount,
          status: updateData.status,
          category: updateData.category,
          tags: updateData.tags,
          image: updateData.image,
        },
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
              jobProfile: { select: { skills: true } },
            },
          },
        },
      });

      console.log('Gig updated successfully');

      const formattedUpdatedGig = {
        id: updatedGig.id,
        image: updatedGig.image || '/images/default-gig.jpg',
        title: updatedGig.title,
        description: updatedGig.description,
        price: Number(updatedGig.amount),
        category: updatedGig.category,
        tags: Array.isArray(updatedGig.tags) ? updatedGig.tags : [],
        createdAt: updatedGig.createdAt?.toISOString(),
        userId: updatedGig.userId,
        freelancer: {
          name: updatedGig.user?.name || 'Anonymous',
          avatar: updatedGig.user?.profileImage || '/images/default-avatar.png',
          skills: Array.isArray(updatedGig.user?.jobProfile?.skills) ? updatedGig.user.jobProfile.skills : [],
        },
      };

      return res.status(200).json(formattedUpdatedGig);
    } else if (req.method === 'DELETE') {
      console.log('Handling DELETE request');
      if (!walletAddress) {
        console.log('No wallet address provided');
        return res.status(401).json({ error: 'Unauthorized: Wallet address required' });
      }

      const existingGig = await prisma.gig.findUnique({
        where: { id },
      });

      if (!existingGig) {
        console.log('Gig not found for deletion');
        return res.status(404).json({ error: 'Gig not found' });
      }

      if (existingGig.userId !== walletAddress) {
        console.log('Unauthorized delete attempt');
        return res.status(403).json({ error: 'Forbidden: You do not own this gig' });
      }

      await prisma.gig.delete({
        where: { id },
      });

      console.log('Gig deleted successfully');
      return res.status(200).json({ message: 'Gig deleted successfully' });
    } else {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    console.log('Disconnecting from database...');
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

// Add a health check endpoint for debugging
export const config = {
  api: {
    externalResolver: true,
  },
};





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
import { NextApiRequest, NextApiResponse } from 'next';
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
}
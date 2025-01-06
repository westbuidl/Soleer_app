import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';

// Define interface for extended session type
interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;  // Add the id field
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req }) as ExtendedSession | null;
    
    // Type guard to ensure session and user exist
    if (!session?.user?.id) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found' });
    }

    const { title, description, amount, image, status } = req.body;

    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        amount,
        image,
        status,
        userId: session.user.id,
      },
    });

    return res.status(201).json(gig);
  } catch (error) {
    console.error('Error creating gig:', error);
    return res.status(500).json({ message: 'Error creating gig' });
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, amount, image, status } = req.body;

    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        amount,
        image,
        status,
        userId: session.user.id, // Assuming you have the user ID in the session
      },
    });

    return res.status(201).json(gig);
  } catch (error) {
    console.error('Error creating gig:', error);
    return res.status(500).json({ message: 'Error creating gig' });
  }
}
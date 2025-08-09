// pages/api/saved-gigs/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Saved gig ID is required' });
      }

      await prisma.savedGig.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Saved gig removed successfully' });
    } catch (error) {
      console.error('Error removing saved gig:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

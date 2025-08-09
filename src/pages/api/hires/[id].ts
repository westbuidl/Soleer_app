// pages/api/hires/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Hire ID is required' });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updatedHire = await prisma.hire.update({
        where: { id },
        data: { status },
        include: {
          gig: true,
          client: {
            select: {
              id: true,
              username: true,
              profileImage: true,
              walletAddress: true
            }
          }
        }
      });

      res.status(200).json(updatedHire);
    } catch (error) {
      console.error('Error updating hire:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

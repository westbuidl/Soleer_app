import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('PATCH /api/hire-requests/[id] - Starting request processing');
    console.log('Query:', req.query);
    
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing ID parameter' });
    }
    
    // Your implementation here
    // Example:
    const updatedHireRequest = await prisma.hire.update({
      where: { id },
      data: req.body,
    });
    
    return res.status(200).json(updatedHireRequest);
  } catch (error: any) {
    console.error('Error updating hire request:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update hire request' 
    });
  } finally {
    await prisma.$disconnect();
  }
}
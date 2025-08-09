// pages/api/transactions.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wallet, timeRange } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate date range for filtering
    let dateFilter = {};
    if (timeRange && timeRange !== 'All time') {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case 'Last 24 hours':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'Last 7 days':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'This month':
        case 'Last 30 days':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'Last 3 months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'Last 6 months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case 'Last year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = {
        createdAt: {
          gte: startDate
        }
      };
    }

    // For now, create mock transactions based on completed hires
    const completedHires = await prisma.hire.findMany({
      where: {
        freelancerId: user.id,
        status: 'COMPLETED',
        ...dateFilter
      },
      include: {
        gig: true
      }
    });

    // Transform hires into transaction format
    const transactions = completedHires.map(hire => ({
      id: hire.id,
      type: 'EARNING' as const,
      amount: hire.amount,
      description: `Payment for "${hire.gig.title}"`,
      status: 'COMPLETED' as const,
      transactionId: hire.transactionId,
      createdAt: hire.updatedAt.toISOString()
    }));

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

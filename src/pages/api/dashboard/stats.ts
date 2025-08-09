// pages/api/dashboard/stats.ts
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

    // Find user by wallet address
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

    // Get all gigs for the user
    const allGigs = await prisma.gig.findMany({
      where: {
        userId: user.id,
        ...dateFilter
      }
    });

    // Get completed hires where user is the freelancer
    const completedHires = await prisma.hire.findMany({
      where: {
        freelancerId: user.id,
        status: 'COMPLETED',
        ...dateFilter
      }
    });

    // Get pending hires where user is the freelancer
    const pendingHires = await prisma.hire.findMany({
      where: {
        freelancerId: user.id,
        status: 'ACCEPTED',
        ...dateFilter
      }
    });

    // Calculate stats
    const totalEarnings = completedHires.reduce((sum, hire) => sum + hire.amount, 0);
    const pendingPayments = pendingHires.reduce((sum, hire) => sum + hire.amount, 0);
    const gigsCompleted = allGigs.filter(gig => gig.status === 'COMPLETED').length;
    const totalGigs = allGigs.length;
    const activeGigs = allGigs.filter(gig => gig.status === 'ACTIVE').length;
    const completionRate = totalGigs > 0 ? (gigsCompleted / totalGigs) * 100 : 0;
    const totalViews = allGigs.reduce((sum, gig) => sum + gig.views, 0);

    const stats = {
      totalEarnings,
      pendingPayments,
      gigsCompleted,
      totalGigs,
      activeGigs,
      completionRate,
      totalViews,
      averageRating: 4.8 // This would come from a reviews table when implemented
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

// pages/api/gigs/[id].ts (Update existing or create new)
/*import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Gig ID is required' });
      }

      const { title, description, amount, status, category, tags, image } = req.body;

      const updatedGig = await prisma.gig.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(status && { status }),
          ...(category !== undefined && { category }),
          ...(tags && { tags }),
          ...(image !== undefined && { image })
        }
      });

      res.status(200).json(updatedGig);
    } catch (error) {
      console.error('Error updating gig:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Gig ID is required' });
      }

      await prisma.gig.delete({
        where: { id }
      });

      res.status(200).json({ message: 'Gig deleted successfully' });
    } catch (error) {
      console.error('Error deleting gig:', error);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}*/
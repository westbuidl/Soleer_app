import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const walletAddress = req.headers['x-wallet-address'] as string;
  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet address required' });
  }

  try {
    const { gigId, freelancerId, amount } = req.body;

    if (!gigId || !freelancerId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify buyer
    const buyer = await prisma.user.findUnique({
      where: { walletAddress },
    });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    if (!buyer.emailVerified) {
      return res.status(403).json({ error: 'Email verification required' });
    }

    // Verify gig and freelancer
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { user: true },
    });
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.userId !== freelancerId) {
      return res.status(400).json({ error: 'Freelancer does not own this gig' });
    }
    if (gig.amount !== amount) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (buyer.id === freelancerId) {
      return res.status(400).json({ error: 'Cannot hire yourself' });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        gigId,
        buyerId: buyer.id,
        freelancerId,
        amount,
        status: 'PENDING',
      },
      include: {
        gig: true,
        buyer: true,
        freelancer: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    await prisma.$disconnect();
  }
}
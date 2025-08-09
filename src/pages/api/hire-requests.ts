/*import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const prisma = new PrismaClient();
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gigId, clientWallet } = req.body;

  if (!gigId || !clientWallet) {
    return res.status(400).json({ error: 'Missing gigId or clientWallet' });
  }

  try {
    // Fetch gig and freelancer
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { user: true },
    });

    if (!gig || gig.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Gig not found or not active' });
    }

    // Fetch client
    const client = await prisma.user.findUnique({
      where: { walletAddress: clientWallet },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check client balance
    const clientPublicKey = new PublicKey(clientWallet);
    const balance = await connection.getBalance(clientPublicKey);
    const amountInLamports = gig.amount * 1_000_000_000; // Convert SOL to lamports

    if (balance < amountInLamports) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: clientPublicKey,
        toPubkey: new PublicKey(gig.user.walletAddress),
        lamports: amountInLamports,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = clientPublicKey;

    // Serialize transaction for client-side signing
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
    const transactionBase64 = serializedTransaction.toString('base64');

    // Create hire record
    const hire = await prisma.hire.create({
      data: {
        gigId,
        clientId: client.id,
        freelancerId: gig.userId,
        amount: gig.amount,
        status: 'PENDING',
      },
    });

    // Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: client.id } } },
          { participants: { some: { userId: gig.userId } } },
        ],
      },
      include: { participants: true },
    });

    // Create conversation if none exists
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: client.id },
              { userId: gig.userId },
            ],
          },
        },
      });

      // Send initial message
      await prisma.message.create({
        data: {
          content: `Hire request for gig: ${gig.title}`,
          senderId: client.id,
          receiverId: gig.userId,
          conversationId:  conversation,
        },
      });
    } else {
      // Update conversation with new message
      await prisma.message.create({
        data: {
          content: `New hire request for gig: ${gig.title}`,
          senderId: client.id,
          receiverId: gig.userId,
          conversationId: conversation.id,
        },
      });
    }

    return res.status(200).json({
      hireId: hire.id,
      transaction: transactionBase64,
      conversationId: conversation,
    });
  } catch (error: any) {
    console.error('Error creating hire:', error);
    return res.status(500).json({ error: error.message || 'Failed to create hire' });
  } finally {
    await prisma.$disconnect();
  }
}*/
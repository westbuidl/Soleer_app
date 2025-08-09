// /app/api/hire-requests/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const prisma = new PrismaClient();
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/hire-requests - Starting request processing');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { gigId, clientWallet, message, deadline, requirements, amount } = body;

    if (!gigId || !clientWallet) {
      console.log('Missing required fields:', { gigId, clientWallet });
      return NextResponse.json({ error: 'Missing gigId or clientWallet' }, { status: 400 });
    }

    console.log('Fetching gig with ID:', gigId);
    
    // Fetch gig and freelancer
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { user: true },
    });

    if (!gig || gig.status !== 'ACTIVE') {
      console.log('Gig not found or not active:', { gig: !!gig, status: gig?.status });
      return NextResponse.json({ error: 'Gig not found or not active' }, { status: 404 });
    }

    console.log('Gig found:', { id: gig.id, title: gig.title, userId: gig.userId });

    // Fetch client
    const client = await prisma.user.findUnique({
      where: { walletAddress: clientWallet },
    });

    if (!client) {
      console.log('Client not found for wallet:', clientWallet);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('Client found:', { id: client.id, name: client.name });

    // Check if client is trying to hire themselves
    if (client.id === gig.userId) {
      console.log('Client trying to hire themselves');
      return NextResponse.json({ error: 'Cannot hire yourself' }, { status: 400 });
    }

    // Check client balance
    const clientPublicKey = new PublicKey(clientWallet);
    const balance = await connection.getBalance(clientPublicKey);
    const finalAmount = amount || gig.amount;
    const amountInLamports = finalAmount * 1_000_000_000; // Convert SOL to lamports

    console.log('Balance check:', { balance, finalAmount, amountInLamports });

    if (balance < amountInLamports) {
      console.log('Insufficient balance');
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
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

    console.log('Creating hire record...');

    // Create hire record with additional fields
    const hire = await prisma.hire.create({
      data: {
        gigId,
        clientId: client.id,
        freelancerId: gig.userId,
        amount: finalAmount,
        status: 'PENDING',
        message: message || `Hire request for gig: ${gig.title}`,
        deadline: deadline ? new Date(deadline) : null,
        requirements: requirements || null,
      },
    });

    console.log('Hire record created:', hire.id);

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
      console.log('Creating new conversation...');
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: client.id },
              { userId: gig.userId },
            ],
          },
        },
        include: { participants: true },
      });

      // Send initial message
      await prisma.message.create({
        data: {
          content: message || `Hire request for gig: ${gig.title}`,
          senderId: client.id,
          receiverId: gig.userId,
          conversationId: conversation.id,
        },
      });
    } else {
      console.log('Using existing conversation:', conversation.id);
      // Update conversation with new message
      await prisma.message.create({
        data: {
          content: message || `New hire request for gig: ${gig.title}`,
          senderId: client.id,
          receiverId: gig.userId,
          conversationId: conversation.id,
        },
      });
    }

    console.log('Hire request created successfully');
    
    return NextResponse.json({
      success: true,
      hireId: hire.id,
      transaction: transactionBase64,
      conversationId: conversation.id,
      message: 'Hire request created successfully',
    });

  } catch (error) {
    console.error('Error creating hire:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create hire' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/hire-requests - Starting request processing');
    
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet');
    const type = searchParams.get('type'); // 'sent' or 'received'

    console.log('Query params:', { walletAddress, type });

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      console.log('User not found for wallet:', walletAddress);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', { id: user.id, name: user.name });

    let whereClause = {};
    
    if (type === 'sent') {
      whereClause = { clientId: user.id };
    } else if (type === 'received') {
      whereClause = { freelancerId: user.id };
    } else {
      // Return both sent and received
      whereClause = {
        OR: [
          { clientId: user.id },
          { freelancerId: user.id },
        ],
      };
    }

    const hires = await prisma.hire.findMany({
      where: whereClause,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found hire requests:', hires.length);

    // Transform to match frontend interface
    const transformedHires = hires.map(hire => ({
      id: hire.id,
      gigId: hire.gigId,
      gigTitle: hire.gig.title,
      freelancerId: hire.freelancerId,
      freelancerName: hire.freelancer.name,
      clientId: hire.clientId,
      clientName: hire.client.name,
      amount: hire.amount,
      status: hire.status,
      message: hire.message,
      deadline: hire.deadline?.toISOString(),
      requirements: hire.requirements,
      createdAt: hire.createdAt.toISOString(),
      updatedAt: hire.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedHires);

  } catch (error) {
    console.error('Error fetching hire requests:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hire requests';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
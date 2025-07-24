// app/api/gigs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, amount, image, status, userId, category, tags } = body;

    // Validate required fields
    if (!title || !description || !amount || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, amount, and userId are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0 || amount > 1000) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be between 0.01 and 1000 SOL' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED' },
        { status: 400 }
      );
    }

    // Validate tags
    if (tags && (!Array.isArray(tags) || tags.some((tag: string) => typeof tag !== 'string'))) {
      return NextResponse.json(
        { error: 'Tags must be an array of strings' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register your wallet address.' },
        { status: 404 }
      );
    }

    // Create gig in the database
    const gig = await prisma.gig.create({
      data: {
        title,
        description,
        amount,
        image: image || null,
        status: status || 'ACTIVE',
        userId,
        category: category || null,
        tags: tags || [],
      },
    });

    return NextResponse.json(gig, { status: 201 });
  } catch (error) {
    console.error('Gig creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create gig' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
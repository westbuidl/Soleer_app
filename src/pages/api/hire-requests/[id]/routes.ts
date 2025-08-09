// /app/api/hire-requests/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    console.log('PATCH /api/hire-requests/[id] - Starting request processing');
    console.log('Params:', params);
    
    const { id } = params;
    const body = await req.json();
    console.log('Request body:', body);
    
    const { status, transactionId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hire request ID is required' }, { status: 400 });
    }

    // Find the hire request
    const existingHire = await prisma.hire.findUnique({
      where: { id },
      include: {
        gig: {
          select: { title: true }
        },
        client: {
          select: { name: true, walletAddress: true }
        },
        freelancer: {
          select: { name: true, walletAddress: true }
        }
      }
    });

    if (!existingHire) {
      console.log('Hire request not found:', id);
      return NextResponse.json({ error: 'Hire request not found' }, { status: 404 });
    }

    console.log('Found hire request:', {
      id: existingHire.id,
      currentStatus: existingHire.status,
      newStatus: status
    });

    // Update the hire request
    const updatedHire = await prisma.hire.update({
      where: { id },
      data: {
        status: status || existingHire.status,
        transactionId: transactionId || existingHire.transactionId,
        updatedAt: new Date(),
      },
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
    });

    console.log('Hire request updated successfully:', updatedHire.id);

    // Transform response to match frontend interface
    const transformedHire = {
      id: updatedHire.id,
      gigId: updatedHire.gigId,
      gigTitle: updatedHire.gig.title,
      freelancerId: updatedHire.freelancerId,
      freelancerName: updatedHire.freelancer.name,
      clientId: updatedHire.clientId,
      clientName: updatedHire.client.name,
      amount: updatedHire.amount,
      status: updatedHire.status,
      message: updatedHire.message,
      deadline: updatedHire.deadline?.toISOString(),
      requirements: updatedHire.requirements,
      transactionId: updatedHire.transactionId,
      createdAt: updatedHire.createdAt.toISOString(),
      updatedAt: updatedHire.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      hire: transformedHire,
      message: 'Hire request updated successfully',
    });

  } catch (error) {
    console.error('Error updating hire request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update hire request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req, { params }) {
  try {
    console.log('GET /api/hire-requests/[id] - Starting request processing');
    console.log('Params:', params);
    
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Hire request ID is required' }, { status: 400 });
    }

    // Find the specific hire request
    const hire = await prisma.hire.findUnique({
      where: { id },
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
    });

    if (!hire) {
      console.log('Hire request not found:', id);
      return NextResponse.json({ error: 'Hire request not found' }, { status: 404 });
    }

    console.log('Found hire request:', hire.id);

    // Transform response to match frontend interface
    const transformedHire = {
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
      transactionId: hire.transactionId,
      createdAt: hire.createdAt.toISOString(),
      updatedAt: hire.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedHire);

  } catch (error) {
    console.error('Error fetching hire request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hire request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
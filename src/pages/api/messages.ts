import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, senderId, receiverId, conversationId } = req.body;

  if (!content || !senderId || !receiverId || !conversationId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify sender exists and is part of the conversation
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.userId === senderId)) {
      return res.status(403).json({ error: 'Sender not part of conversation' });
    }

    if (!conversation.participants.some(p => p.userId === receiverId)) {
      return res.status(400).json({ error: 'Receiver not part of conversation' });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Update conversation's updatedAt timestamp and lastMessage
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        lastMessage: {
          connect: { id: message.id },
        },
      },
    });

    // Map response
    const response = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      conversationId: message.conversationId,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        username: message.sender.username || undefined,
        name: message.sender.name || undefined,
        profileImage: message.sender.profileImage || undefined,
      },
      receiver: {
        id: message.receiver.id,
        username: message.receiver.username || undefined,
        name: message.receiver.name || undefined,
        profileImage: message.receiver.profileImage || undefined,
      },
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
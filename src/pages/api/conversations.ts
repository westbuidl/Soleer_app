import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const walletAddress = req.headers['x-wallet-address'] as string;

  if (!walletAddress) {
    return res.status(401).json({ error: 'Unauthorized: Wallet address required' });
  }

  // Verify user exists
  const currentUser = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!currentUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch conversations for the user - note the correct casing
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: currentUser.id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
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
            orderBy: { createdAt: 'asc' },
          },
          lastMessage: {
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
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Map to ensure optional fields are handled
      const response = conversations.map(conversation => ({
        id: conversation.id,
        participants: conversation.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          user: {
            id: p.user.id,
            username: p.user.username || undefined,
            name: p.user.name || undefined,
            profileImage: p.user.profileImage || undefined,
          },
          lastReadAt: p.lastReadAt ? p.lastReadAt.toISOString() : undefined,
        })),
        messages: conversation.messages.map(m => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          receiverId: m.receiverId,
          conversationId: m.conversationId,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString(),
          sender: {
            id: m.sender.id,
            username: m.sender.username || undefined,
            name: m.sender.name || undefined,
            profileImage: m.sender.profileImage || undefined,
          },
          receiver: {
            id: m.receiver.id,
            username: m.receiver.username || undefined,
            name: m.receiver.name || undefined,
            profileImage: m.receiver.profileImage || undefined,
          },
        })),
        lastMessage: conversation.lastMessage
          ? {
              id: conversation.lastMessage.id,
              content: conversation.lastMessage.content,
              senderId: conversation.lastMessage.senderId,
              receiverId: conversation.lastMessage.receiverId,
              conversationId: conversation.lastMessage.conversationId,
              isRead: conversation.lastMessage.isRead,
              createdAt: conversation.lastMessage.createdAt.toISOString(),
              sender: {
                id: conversation.lastMessage.sender.id,
                username: conversation.lastMessage.sender.username || undefined,
                name: conversation.lastMessage.sender.name || undefined,
                profileImage: conversation.lastMessage.sender.profileImage || undefined,
              },
              receiver: {
                id: conversation.lastMessage.receiver.id,
                username: conversation.lastMessage.receiver.username || undefined,
                name: conversation.lastMessage.receiver.name || undefined,
                profileImage: conversation.lastMessage.receiver.profileImage || undefined,
              },
            }
          : undefined,
        updatedAt: conversation.updatedAt.toISOString(),
      }));

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'POST') {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length !== 2) {
      return res.status(400).json({ error: 'Exactly two participant IDs are required' });
    }

    if (!participantIds.includes(currentUser.id)) {
      return res.status(403).json({ error: 'Authenticated user must be a participant' });
    }

    try {
      // Verify participants exist
      const users = await prisma.user.findMany({
        where: { id: { in: participantIds } },
      });

      if (users.length !== 2) {
        return res.status(404).json({ error: 'One or more users not found' });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: participantIds[0] } } },
            { participants: { some: { userId: participantIds[1] } } },
          ],
        },
        include: {
          participants: { include: { user: true } },
          messages: { include: { sender: true, receiver: true } },
          lastMessage: { include: { sender: true, receiver: true } },
        },
      });

      if (existingConversation) {
        return res.status(400).json({ error: 'Conversation already exists', conversation: existingConversation });
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: participantIds.map(userId => ({
              user: { connect: { id: userId } },
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
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
          },
          lastMessage: {
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
          },
        },
      });

      // Map response
      const response = {
        id: conversation.id,
        participants: conversation.participants.map(p => ({
          id: p.id,
          userId: p.userId,
          user: {
            id: p.user.id,
            username: p.user.username || undefined,
            name: p.user.name || undefined,
            profileImage: p.user.profileImage || undefined,
          },
          lastReadAt: p.lastReadAt ? p.lastReadAt.toISOString() : undefined,
        })),
        messages: conversation.messages.map(m => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          receiverId: m.receiverId,
          conversationId: m.conversationId,
          isRead: m.isRead,
          createdAt: m.createdAt.toISOString(),
          sender: {
            id: m.sender.id,
            username: m.sender.username || undefined,
            name: m.sender.name || undefined,
            profileImage: m.sender.profileImage || undefined,
          },
          receiver: {
            id: m.receiver.id,
            username: m.receiver.username || undefined,
            name: m.receiver.name || undefined,
            profileImage: m.receiver.profileImage || undefined,
          },
        })),
        lastMessage: conversation.lastMessage
          ? {
              id: conversation.lastMessage.id,
              content: conversation.lastMessage.content,
              senderId: conversation.lastMessage.senderId,
              receiverId: conversation.lastMessage.receiverId,
              conversationId: conversation.lastMessage.conversationId,
              isRead: conversation.lastMessage.isRead,
              createdAt: conversation.lastMessage.createdAt.toISOString(),
              sender: {
                id: conversation.lastMessage.sender.id,
                username: conversation.lastMessage.sender.username || undefined,
                name: conversation.lastMessage.sender.name || undefined,
                profileImage: conversation.lastMessage.sender.profileImage || undefined,
              },
              receiver: {
                id: conversation.lastMessage.receiver.id,
                username: conversation.lastMessage.receiver.username || undefined,
                name: conversation.lastMessage.receiver.name || undefined,
                profileImage: conversation.lastMessage.receiver.profileImage || undefined,
              },
            }
          : undefined,
        updatedAt: conversation.updatedAt.toISOString(),
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
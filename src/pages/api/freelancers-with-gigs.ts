import { NextApiRequest, NextApiResponse } from 'next';
  import { PrismaClient } from '@prisma/client';

  const prisma = new PrismaClient();

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Fetch users with at least one active gig
      const freelancers = await prisma.user.findMany({
        where: {
          gigs: {
            some: {
              status: 'ACTIVE',
            },
          },
        },
        select: {
          id: true,
          walletAddress: true,
          username: true,
          name: true,
          profileImage: true,
          gigs: {
            where: {
              status: 'ACTIVE',
            },
            select: {
              id: true,
              title: true,
              description: true,
              image: true,
              amount: true,
              userId: true,
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
        },
      });

      // Map to ensure response matches FreelancerWithGigs type
      const response = freelancers.map(freelancer => ({
        id: freelancer.id,
        walletAddress: freelancer.walletAddress,
        username: freelancer.username || undefined,
        name: freelancer.name || undefined,
        profileImage: freelancer.profileImage || undefined,
        gigs: freelancer.gigs.map(gig => ({
          id: gig.id,
          title: gig.title,
          description: gig.description,
          image: gig.image || undefined,
          amount: gig.amount,
          userId: gig.userId,
          user: {
            id: gig.user.id,
            username: gig.user.username || undefined,
            name: gig.user.name || undefined,
            profileImage: gig.user.profileImage || undefined,
          },
        })),
      }));

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching freelancers with gigs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  }
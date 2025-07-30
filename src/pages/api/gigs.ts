import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email sending function using your working email configuration
const sendGigNotificationEmail = async (gigData: {
  title: string;
  description: string;
  amount: number;
  gigId: string;
  userEmail: string;
  gigUrl: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      auth: {
        user: "founder@soleer.xyz",
        pass: "@#possibilities",
      },
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif;
              background-color: #000000;
              color: #FFFFFF;
              margin: 0;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
            }
            h1 { 
              color: #FFFFFF; 
              font-size: 24px;
              margin-bottom: 20px;
            }
            .gig-details {
              background-color: #1A1B1E;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #26272B;
            }
            .price {
              font-size: 24px;
              font-weight: bold;
              color: #8B5CF6;
              margin: 20px 0;
            }
            .view-button {
              display: inline-block;
              background: linear-gradient(to right, #8B5CF6, #7C3AED);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            p {
              margin-bottom: 15px;
              line-height: 1.6;
            }
            .footer { 
              margin-top: 30px; 
              font-size: 12px; 
              color: #888;
              border-top: 1px solid #26272B;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Gig Posted Successfully!</h1>
            
            <p>Hi there,</p>
            
            <p>Great news! Your gig "<strong>${gigData.title}</strong>" has been posted successfully on the Soleer marketplace.</p>
            
            <div class="gig-details">
              <p><strong>Title:</strong> ${gigData.title}</p>
              <p><strong>Description:</strong> ${gigData.description}</p>
              <p><strong>Gig ID:</strong> ${gigData.gigId}</p>
              <div class="price">${gigData.amount} SOL</div>
            </div>
            
            <p>Your gig is now live and visible to potential clients. You can view and manage it using the link below:</p>
            
            <a href="${gigData.gigUrl}" class="view-button">View Your Gig</a>
            
            <p>Tips for success:</p>
            <ul style="color: #CCCCCC; line-height: 1.6;">
              <li>Keep your gig description clear and detailed</li>
              <li>Respond quickly to client inquiries</li>
              <li>Deliver high-quality work on time</li>
              <li>Build your reputation with excellent service</li>
            </ul>
            
            <div class="footer">
              <p>This message was sent to ${gigData.userEmail}</p>
              <p>&copy; ${new Date().getFullYear()} Soleer Labs. All rights reserved.</p>
              <p>Visit us at <a href="https://www.soleer.xyz" style="color: #8B5CF6;">soleer.xyz</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: "founder@soleer.xyz",
      to: gigData.userEmail,
      subject: "🎉 Your Gig is Now Live on Soleer!",
      html: htmlContent,
    });

    console.log('Gig notification email sent successfully to:', gigData.userEmail);
  } catch (error) {
    console.error('Failed to send gig notification email:', error);
    // Don't throw error - we don't want email failure to break gig creation
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { title, description, amount, image, status, userId, category, tags } = req.body;

      // Validate required fields
      if (!title || !description || !amount || !userId) {
        console.error('Missing required fields:', { title, description, amount, userId });
        return res.status(400).json({
          error: 'Missing required fields: title, description, amount, and userId are required',
        });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        console.error('Invalid amount:', amount);
        return res.status(400).json({
          error: 'Invalid amount. Must be between 0.01 and 1000 SOL',
        });
      }

      // Validate status
      const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
      if (status && !validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        return res.status(400).json({
          error: 'Invalid status. Must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED',
        });
      }

      // Validate tags
      if (tags && (!Array.isArray(tags) || tags.some((tag: string) => typeof tag !== 'string'))) {
        console.error('Invalid tags:', tags);
        return res.status(400).json({
          error: 'Tags must be an array of strings',
        });
      }

      // Check if user exists and is email-verified, also get email for notification
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          emailVerified: true,
          email: true // Added email field for notification
        },
      });

      if (!user) {
        console.error('User not found for userId:', userId);
        return res.status(404).json({
          error: 'User not found. Please register your wallet address.',
        });
      }

      if (!user.emailVerified) {
        console.error('Email not verified for userId:', userId);
        return res.status(403).json({
          error: 'Email verification required. Please verify your email before posting a gig.',
        });
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
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          image: true,
          status: true,
          userId: true,
          category: true,
          tags: true,
        },
      });

      console.log('Created gig:', { id: gig.id, title: gig.title, userId: gig.userId });

      // Send notification email (non-blocking) - only if user has email
      if (user.email) {
        const gigUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gig/${gig.id}`;
        
        console.log('Attempting to send notification email to:', user.email);
        
        // Send email asynchronously - don't wait for it
        sendGigNotificationEmail({
          title: gig.title,
          description: gig.description,
          amount: gig.amount,
          gigId: gig.id,
          userEmail: user.email,
          gigUrl
        }).catch(error => {
          console.error('Email notification failed:', error);
        });
      } else {
        console.warn('No email found for user, skipping notification');
      }

      return res.status(201).json(gig);
    } else if (req.method === 'GET') {
      const { wallet } = req.query;

      if (wallet && typeof wallet === 'string') {
        // Fetch user-specific gigs (for dashboard, etc.)
        const decodedWallet = decodeURIComponent(wallet);
        console.log('Fetching gigs for wallet:', decodedWallet);

        const user = await prisma.user.findUnique({
          where: { walletAddress: decodedWallet },
          select: { id: true },
        });

        if (!user) {
          console.error('User not found for wallet:', decodedWallet);
          return res.status(404).json({ error: 'User not found' });
        }

        const gigs = await prisma.gig.findMany({
          where: {
            userId: user.id,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched user gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else if (!wallet) {
        // Fetch all gigs (for marketplace)
        const gigs = await prisma.gig.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched all gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else {
        console.error('Invalid wallet parameter:', wallet);
        return res.status(400).json({ error: 'Wallet address must be a string' });
      }
    } else {
      console.error('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`${req.method} gig error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      error: `Failed to ${req.method === 'POST' ? 'create' : 'fetch'} gig`,
      details: error instanceof Error ? error.message : 'Unknown server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}





/*import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { title, description, amount, image, status, userId, category, tags } = req.body;

      // Validate required fields
      if (!title || !description || !amount || !userId) {
        console.error('Missing required fields:', { title, description, amount, userId });
        return res.status(400).json({
          error: 'Missing required fields: title, description, amount, and userId are required',
        });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0 || amount > 1000) {
        console.error('Invalid amount:', amount);
        return res.status(400).json({
          error: 'Invalid amount. Must be between 0.01 and 1000 SOL',
        });
      }

      // Validate status
      const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];
      if (status && !validStatuses.includes(status)) {
        console.error('Invalid status:', status);
        return res.status(400).json({
          error: 'Invalid status. Must be one of: DRAFT, ACTIVE, PAUSED, COMPLETED',
        });
      }

      // Validate tags
      if (tags && (!Array.isArray(tags) || tags.some((tag: string) => typeof tag !== 'string'))) {
        console.error('Invalid tags:', tags);
        return res.status(400).json({
          error: 'Tags must be an array of strings',
        });
      }

      // Check if user exists and is email-verified
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, emailVerified: true },
      });

      if (!user) {
        console.error('User not found for userId:', userId);
        return res.status(404).json({
          error: 'User not found. Please register your wallet address.',
        });
      }

      if (!user.emailVerified) {
        console.error('Email not verified for userId:', userId);
        return res.status(403).json({
          error: 'Email verification required. Please verify your email before posting a gig.',
        });
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
        select: {
          id: true,
          title: true,
          description: true,
          amount: true,
          image: true,
          status: true,
          userId: true,
          category: true,
          tags: true,
        },
      });

      console.log('Created gig:', { id: gig.id, title: gig.title, userId: gig.userId });
      return res.status(201).json(gig);
    } else if (req.method === 'GET') {
      const { wallet } = req.query;

      if (wallet && typeof wallet === 'string') {
        // Fetch user-specific gigs (for dashboard, etc.)
        const decodedWallet = decodeURIComponent(wallet);
        console.log('Fetching gigs for wallet:', decodedWallet);

        const user = await prisma.user.findUnique({
          where: { walletAddress: decodedWallet },
          select: { id: true },
        });

        if (!user) {
          console.error('User not found for wallet:', decodedWallet);
          return res.status(404).json({ error: 'User not found' });
        }

        const gigs = await prisma.gig.findMany({
          where: {
            userId: user.id,
            status: 'ACTIVE',
          },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched user gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else if (!wallet) {
        // Fetch all gigs (for marketplace)
        const gigs = await prisma.gig.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            amount: true,
            status: true,
            user: {
              select: {
                name: true,
                profileImage: true,
                jobProfile: {
                  select: { skills: true },
                },
              },
            },
          },
        });

        const formattedGigs = gigs.map(gig => ({
          id: gig.id,
          image: gig.image || '/images/default-gig.jpg',
          title: gig.title,
          description: gig.description,
          price: Number(gig.amount),
          freelancer: {
            name: gig.user.name || 'Anonymous',
            avatar: gig.user.profileImage || '/images/default-avatar.png',
            skills: gig.user.jobProfile?.skills || [],
          },
        }));

        console.log('Fetched all gigs:', formattedGigs.length);
        return res.status(200).json(formattedGigs);
      } else {
        console.error('Invalid wallet parameter:', wallet);
        return res.status(400).json({ error: 'Wallet address must be a string' });
      }
    } else {
      console.error('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`${req.method} gig error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      error: `Failed to ${req.method === 'POST' ? 'create' : 'fetch'} gig`,
      details: error instanceof Error ? error.message : 'Unknown server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}*/
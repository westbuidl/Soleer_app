import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      walletAddress,
      email,
      emailVerified,
      username,
      name,
      bio,
      website,
      twitter,
      linkedin,
      discord,
      profileImage,
      bannerImage,
      jobTitle,
      skills,
      jobDescription,
      portfolio,
      jobBannerImage
    } = req.body;

    if (!walletAddress) {
      console.error('Missing walletAddress');
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!username) {
      console.error('Missing required field: username');
      return res.status(400).json({ error: 'Username is required' });
    }

    const processedSkills = skills
      ? Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s: string) => s.trim()).filter(s => s)
        : [skills]
      : [];

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        email: email || null,
        emailVerified: emailVerified || false,
        username,
        name: name || null,
        bio: bio || null,
        website: website || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        discord: discord || null,
        profileImage: profileImage || null,
        bannerImage: bannerImage || null
      },
      create: {
        walletAddress,
        email: email || null,
        emailVerified: emailVerified || false,
        username,
        name: name || null,
        bio: bio || null,
        website: website || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        discord: discord || null,
        profileImage: profileImage || null,
        bannerImage: bannerImage || null
      },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        emailVerified: true,
        username: true,
        name: true,
        bio: true,
        website: true,
        twitter: true,
        linkedin: true,
        discord: true,
        profileImage: true,
        bannerImage: true
      }
    });

    let jobProfile = null;
    if (jobTitle || processedSkills.length > 0 || jobDescription || portfolio || jobBannerImage) {
      jobProfile = await prisma.jobProfile.upsert({
        where: { userId: user.id },
        update: {
          title: jobTitle || null,
          skills: processedSkills,
          description: jobDescription || null,
          portfolio: portfolio || null,
          bannerImage: jobBannerImage || null
        },
        create: {
          userId: user.id,
          title: jobTitle || '',
          skills: processedSkills,
          description: jobDescription || null,
          portfolio: portfolio || null,
          bannerImage: jobBannerImage || null
        },
        select: {
          title: true,
          skills: true,
          description: true,
          portfolio: true,
          bannerImage: true
        }
      });
    }

    console.log('Profile updated for wallet:', walletAddress);
    return res.status(200).json({
      ...user,
      jobTitle: jobProfile?.title || '',
      skills: jobProfile?.skills || [],
      jobDescription: jobProfile?.description || '',
      portfolio: jobProfile?.portfolio || '',
      jobBannerImage: jobProfile?.bannerImage || ''
    });
  } catch (error) {
    console.error('Profile update error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown server error'
    });
  } finally {
    await prisma.$disconnect();
  }
}

/*import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      walletAddress,
      email,
      username,
      name,
      bio,
      profileImage,
      bannerImage,
      website,
      twitter,
      linkedin,
      discord,
      jobTitle,
      skills,
      jobDescription,
      jobBannerImage,
      portfolio
    } = req.body;

    const user = await prisma.user.upsert({
      where: {
        walletAddress: walletAddress,
      },
      update: {
        email,
        username,
        name,
        bio,
        profileImage,
        bannerImage,
        website,
        twitter,
        linkedin,
        discord,
      },
      create: {
        walletAddress,
        email,
        username,
        name,
        bio,
        profileImage,
        bannerImage,
        website,
        twitter,
        linkedin,
        discord,
      },
    });

    if (jobTitle || skills || jobDescription) {
      await prisma.jobProfile.upsert({
        where: {
          userId: user.id,
        },
        update: {
          title: jobTitle,
          skills: Array.isArray(skills) ? skills : [skills],
          description: jobDescription,
          bannerImage: jobBannerImage,
          portfolio,
        },
        create: {
          userId: user.id,
          title: jobTitle,
          skills: Array.isArray(skills) ? skills : [skills],
          description: jobDescription,
          bannerImage: jobBannerImage,
          portfolio,
        },
      });
    }

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Error updating profile', error });
  }
}*/
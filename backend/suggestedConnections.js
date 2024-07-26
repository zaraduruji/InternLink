import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/suggested-connections', async (req, res) => {
  try {
    const currentUserId = req.session.user.id;


    const userConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: currentUserId },
          { friendId: currentUserId },
        ],
        status: 'CONNECTED',
      },
      select: {
        userId: true,
        friendId: true,
      },
    });


    const connectionIds = userConnections.map(connection =>
      connection.userId === currentUserId ? connection.friendId : connection.userId
    );


    const suggestedConnections = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...connectionIds, currentUserId],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        jobTitle: true,
      },
      take: 10,
    });

    res.status(200).json(suggestedConnections);
  } catch (error) {
    console.error('Error fetching suggested connections:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;

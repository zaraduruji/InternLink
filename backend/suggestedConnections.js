import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/suggested-connections', async (req, res) => {
  try {
    const currentUserId = req.session.user.id; // Assume user is authenticated and user object is attached to req.session

    // Fetch current user's connections
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

    // Get the IDs of the connections
    const connectionIds = userConnections.map(connection =>
      connection.userId === currentUserId ? connection.friendId : connection.userId
    );

    // Fetch users who are not connected to the current user
    const suggestedConnections = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...connectionIds, currentUserId], // Exclude current user's connections and current user
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        jobTitle: true, // Ensure job title is selected
      },
      take: 10, // Limit to 10 suggested connections
    });

    res.status(200).json(suggestedConnections);
  } catch (error) {
    console.error('Error fetching suggested connections:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;

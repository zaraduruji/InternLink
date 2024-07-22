import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import env from 'dotenv';
import session from 'express-session';
import Sequelize from 'sequelize';
import SequelizeStoreInit from 'connect-session-sequelize';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { ApolloServer } from 'apollo-server-express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { addHours } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

env.config();

const app = express();
const port = 3000;

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
});

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      sameSite: false,
      secure: false,
      expires: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000))
    }
  })
);

sessionStore.sync();

// Load GraphQL schema
const typeDefs = fs.readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf8'
);

// Define resolvers
const resolvers = {
  Query: {
    getNotifications: async (_, { userId }) => {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { friendRequest: true, story: true },
      });
    },
  },
  Mutation: {
    createFriendRequest: async (_, { requesterId, recipientId }) => {
      const requester = await prisma.user.findUnique({
        where: { id: requesterId },
        select: { firstName: true, lastName: true }
      });

      const friendRequest = await prisma.friendRequest.create({
        data: {
          requesterId,
          recipientId,
          status: 'PENDING',
          notifications: {
            create: {
              userId: recipientId,
              type: 'FRIEND_REQUEST',
              content: `You have a new friend request from ${requester.firstName} ${requester.lastName}`,
            }
          }
        },
      });

      return friendRequest;
    },
    acceptFriendRequest: async (_, { requestId }) => {
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id: requestId },
        include: { requester: true, recipient: true }
      });

      if (!friendRequest) {
        throw new Error('Friend request not found');
      }

      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      await prisma.connection.create({
        data: {
          userId: friendRequest.requesterId,
          friendId: friendRequest.recipientId,
          status: 'CONNECTED',
        },
      });

      // Create notification for the requester
      await prisma.notification.create({
        data: {
          userId: friendRequest.requesterId,
          type: 'FRIEND_REQUEST_ACCEPTED',
          content: `${friendRequest.recipient.firstName} ${friendRequest.recipient.lastName} accepted your friend request`,
          isRead: false,
        },
      });

      // Update connection count for both users
      await prisma.user.update({
        where: { id: friendRequest.requesterId },
        data: { connectionCount: { increment: 1 } }
      });
      await prisma.user.update({
        where: { id: friendRequest.recipientId },
        data: { connectionCount: { increment: 1 } }
      });

      return friendRequest;
    },
    declineFriendRequest: async (_, { requestId }) => {
      return prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'DECLINED' },
      });
    },
    markNotificationAsRead: async (_, { notificationId }) => {
      return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    },
    createStoryNotification: async (_, { userId, storyId }) => {
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: { user: true },
      });

      if (!story) {
        throw new Error('Story not found');
      }

      // Get the user's connections
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { userId: story.userId },
            { friendId: story.userId }
          ],
          status: 'CONNECTED'
        },
      });

      // Create notifications for all connections
      const notifications = await Promise.all(
        connections.map(async (connection) => {
          const recipientId = connection.userId === story.userId ? connection.friendId : connection.userId;
          return prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'STORY_UPLOAD',
              content: `${story.user.firstName} ${story.user.lastName} uploaded a new story`,
              isRead: false,
              storyId: story.id,
            },
          });
        })
      );

      // Return the first notification (you might want to adjust this based on your needs)
      return notifications[0];
    },
  },
};
// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Existing routes
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: '',
        lastName: ''
      },
    });
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.put('/update-profile', async (req, res) => {
  const { userId, firstName, lastName, location, jobTitle, about, education, profilePicture } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { firstName, lastName, location, jobTitle, about, education, profilePicture },
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/job-listings', (req, res) => {
  const jsonFilePath = path.join(process.cwd(), 'jobListings.json');
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading JSON file');
      return;
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';

  try {
    const jobListings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'jobListings.json'), 'utf8'));
    const jobResults = jobListings.filter(job =>
      (job.uploaderName && job.uploaderName.toLowerCase().includes(query)) ||
      (job.companyName && job.companyName.toLowerCase().includes(query)) ||
      (job.role && job.role.toLowerCase().includes(query))
    );

    const userResults = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      }
    });

    res.json({ jobResults, userResults });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during search' });
  }
});

app.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      uploadStream.end(file.buffer);
    });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { profilePicture: result.secure_url },
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).send('Error updating profile picture.');
  }
});

app.post('/api/send-friend-request', async (req, res) => {
  const { userId, targetUserId } = req.body;
  try {
    // Check if users are already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            userId: parseInt(userId, 10),
            friendId: parseInt(targetUserId, 10),
            status: 'CONNECTED',
          },
          {
            userId: parseInt(targetUserId, 10),
            friendId: parseInt(userId, 10),
            status: 'CONNECTED',
          },
        ],
      },
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'You are already connected with this user' });
    }

    // Check if a friend request already exists
    const existingFriendRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            requesterId: parseInt(userId, 10),
            recipientId: parseInt(targetUserId, 10),
          },
          {
            requesterId: parseInt(targetUserId, 10),
            recipientId: parseInt(userId, 10),
          },
        ],
      },
    });

    if (existingFriendRequest) {
      return res.status(400).json({ message: 'A friend request is already pending with this user' });
    }

    // Create new friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        requesterId: parseInt(userId, 10),
        recipientId: parseInt(targetUserId, 10),
        status: 'PENDING',
      },
    });

    // Fetch the requester's name
    const requester = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: { firstName: true, lastName: true }
    });

    // Create a notification for the recipient
    await prisma.notification.create({
      data: {
        userId: parseInt(targetUserId, 10),
        type: 'FRIEND_REQUEST',
        content: `You have a new friend request from ${requester.firstName} ${requester.lastName}`,
        createdAt: new Date(),
        friendRequestId: friendRequest.id // Store the friend request ID
      },
    });

    res.status(200).json({ message: 'Friend request sent successfully', friendRequest });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'An error occurred while sending the friend request' });
  }
});

app.get('/api/connections/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: parseInt(userId, 10) },
          { friendId: parseInt(userId, 10) },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    // Format the response to return the relevant user data
    const formattedConnections = connections.map((connection) => {
      const isRequester = connection.userId === parseInt(userId, 10);
      return {
        id: connection.id,
        friendId: isRequester ? connection.friendId : connection.userId,
        friend: isRequester ? connection.friend : connection.user,
      };
    });

    res.json(formattedConnections);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.delete('/api/connections/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;
  try {
    await prisma.connection.deleteMany({
      where: {
        OR: [
          {
            userId: parseInt(userId, 10),
            friendId: parseInt(friendId, 10),
          },
          {
            userId: parseInt(friendId, 10),
            friendId: parseInt(userId, 10),
          },
        ],
      },
    });
    res.status(200).json({ message: 'Connection removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/stories', upload.single('story'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      uploadStream.end(file.buffer);
    });

    const story = await prisma.story.create({
      data: {
        userId: parseInt(userId, 10),
        fileUrl: result.secure_url,
        expiresAt: addHours(new Date(), 24), // Set expiration to 24 hours from now
      },
    });

    // Create notifications for connections
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      select: { firstName: true, lastName: true },
    });

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: parseInt(userId, 10) },
          { friendId: parseInt(userId, 10) },
        ],
        status: 'CONNECTED',
      },
    });

    for (const connection of connections) {
      const recipientId = connection.userId === parseInt(userId, 10) ? connection.friendId : connection.userId;
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'STORY_UPLOAD',
          content: `${user.firstName} ${user.lastName} uploaded a new story`,
          isRead: false,
          storyId: story.id,
        },
      });
    }

    res.status(200).json({ message: 'Story uploaded successfully!', story });
  } catch (error) {
    console.error('Error uploading story:', error);
    res.status(500).send('Error uploading story.');
  }
});

app.get('/api/stories', async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gte: new Date(), // Only fetch stories that haven't expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = {
          user: story.user,
          stories: [],
        };
      }
      acc[story.userId].stories.push(story);
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    res.status(500).send('Error fetching stories.');
  }
});

app.delete('/api/stories/:storyId', async (req, res) => {
  const { storyId } = req.params;

  try {
    const deletedStory = await prisma.story.delete({
      where: { id: parseInt(storyId, 10) },
    });

    res.status(200).json({ message: 'Story deleted successfully', deletedStory });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

app.delete('/api/stories/expired', async (req, res) => {
  try {
    const expiredStories = await prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Delete stories where expiresAt is less than current time
        },
      },
    });

    res.json({ deletedCount: expiredStories.count });
  } catch (error) {
    res.status(500).send('Error deleting expired stories.');
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/api/users/:id/connections-count', async (req, res) => {
  const { id } = req.params;
  try {
    const connectionCount = await prisma.connection.count({
      where: {
        OR: [
          { userId: parseInt(id, 10) },
          { friendId: parseInt(id, 10) },
        ],
      },
    });
    res.json({ count: connectionCount });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.clearCookie('connect.sid');
    res.status(200).send('Logged out successfully');
  });
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`GraphQL endpoint: http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();

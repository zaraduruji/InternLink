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

const upload = multer({ dest: 'uploads/' });

// Adjust the body size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
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
  console.log(req.body)
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

  const fileUrl = `http://localhost:${port}/uploads/${file.filename}`;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { profilePicture: fileUrl },
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).send('Error updating profile picture.');
  }
});

app.post('/api/uploadStory', upload.single('story'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileUrl = `http://localhost:${port}/uploads/${file.filename}`;

  try {
    const story = await prisma.story.create({
      data: {
        userId: parseInt(userId, 10),
        fileUrl: fileUrl,
      },
    });
    res.status(200).send('Story uploaded successfully!');
  } catch (error) {
    res.status(500).send('Error uploading story.');
  }
});

app.get('/api/stories', async (req, res) => {
  try {
    const stories = await prisma.story.findMany();
    res.json(stories);
  } catch (error) {
    res.status(500).send('Error fetching stories.');
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

app.post('/api/connect', async (req, res) => {
  const { userId, targetUserId } = req.body;
  try {
    await prisma.friendRequest.create({
      data: {
        requesterId: parseInt(userId, 10),
        recipientId: parseInt(targetUserId, 10),
        status: 'PENDING',
      },
    });
    res.status(200).json({ message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

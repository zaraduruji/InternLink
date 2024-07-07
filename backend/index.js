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
import router from './users.js';

const app = express();
const port = 3000;
env.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
});

const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:5173', // Update to match your frontend port
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
app.use(router);

// Serve job listings from jobListings.json
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

// Search endpoint
app.get('/api/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const jsonFilePath = path.join(process.cwd(), 'jobListings.json');
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading JSON file');
      return;
    }
    const jobListings = JSON.parse(data);
    const results = jobListings.filter(job =>
      (job.uploaderName && job.uploaderName.toLowerCase().includes(query)) ||
      (job.companyName && job.companyName.toLowerCase().includes(query)) ||
      (job.role && job.role.toLowerCase().includes(query))
    );
    res.json(results);
  });
});

// Endpoint to upload stories
app.post('/api/uploadStory', upload.single('story'), async (req, res) => {
  const file = req.file;
  const userId = req.body.userId;

  if (!file) {
    console.error('No file uploaded.');
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
    console.log('Story uploaded successfully:', story);
    res.status(200).send('Story uploaded successfully!');
  } catch (error) {
    console.error('Error uploading story:', error);
    res.status(500).send('Error uploading story.');
  }
});

// Endpoint to fetch stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await prisma.story.findMany();
    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).send('Error fetching stories.');
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

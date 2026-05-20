require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();

// Parse JSON request bodies
app.use(express.json({ limit: '100kb' }));

// Serve your static site (HTML/CSS/JS/assets) from the repo root
const repoRoot = path.join(__dirname, '..');
app.use(express.static(repoRoot));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}



// MongoDB setup (lazy connection)
let mongoClient;
let mongoDb;

async function getMongo() {
  if (mongoDb) return mongoDb;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  if (!mongoClient) {
    const { MongoClient } = require('mongodb');
    mongoClient = new MongoClient(uri);
  }

  await mongoClient.connect();

  const dbName = process.env.MONGODB_DB;
  mongoDb = mongoClient.db(dbName);
  return mongoDb;
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  const errors = [];

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Please enter your name.' });
  }

  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }

  if (typeof message !== 'string' || message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message should be at least 10 characters.' });
  }

  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  const payload = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    receivedAt: new Date().toISOString()
  };

  try {
    const db = await getMongo();
    const collectionName = process.env.MONGODB_COLLECTION || 'contactMessages';
    await db.collection(collectionName).insertOne(payload);

    console.log('[contact][saved]', payload);
    return res.status(200).json({ ok: true, message: 'Message received.' });
  } catch (err) {
    console.error('[contact][error]', err);
    return res.status(500).json({ ok: false, errors: [{ field: 'server', message: 'Failed to save message.' }] });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Portfolio server running on http://localhost:${port}`);
  console.log('POST /api/contact to submit the contact form');
});


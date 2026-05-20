#!/usr/bin/env node
'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SEED_EMAIL = 'admin@example.com';
const SEED_PASSWORD = 'changeme123';
const SALT_ROUNDS = 10;

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: SEED_EMAIL });
  if (existing) {
    console.log(`User "${SEED_EMAIL}" already exists. Skipping seed.`);
  } else {
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
    await User.create({ email: SEED_EMAIL, password: hashedPassword });
    console.log(`User "${SEED_EMAIL}" created successfully.`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});

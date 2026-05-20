'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');

// Set JWT_SECRET before importing app so the middleware picks it up
const JWT_SECRET = 'test-jwt-secret-integration';
process.env.JWT_SECRET = JWT_SECRET;

const app = require('../index');
const User = require('../models/User');

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'TestPassword123';

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect mongoose to the in-memory server
  await mongoose.connect(uri);

  // Create a test user with a bcrypt-hashed password
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  await User.create({ email: TEST_EMAIL, password: hashedPassword });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/auth/login — integration tests', () => {
  it('returns HTTP 200 and a non-empty token with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(0);
  });

  it('returns HTTP 401 with "Credenciales inválidas" for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Credenciales inválidas' });
  });

  it('returns HTTP 401 with "Credenciales inválidas" for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Credenciales inválidas' });
  });

  it('returns HTTP 401 (or 400) when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect([400, 401]).toContain(res.status);
  });

  it('returns a JWT whose payload contains the correct email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    const { token } = res.body;

    // jwt.verify throws if the token is invalid
    const payload = jwt.verify(token, JWT_SECRET);
    expect(payload.email).toBe(TEST_EMAIL);
  });
});

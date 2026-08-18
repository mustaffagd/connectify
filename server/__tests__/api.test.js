const request = require('supertest');
const http = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');

let app, server, io;
let testUser, testToken;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CLIENT_URL = 'http://localhost:5173';

  const mod = require('../src/server');
  app = mod.app;
  server = mod.server;
  io = mod.io;
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

afterAll(async () => {
  if (server) server.close();
  const { pool } = require('../src/config/database');
  await pool.end();
});

describe('Auth API', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testUsername = `testuser_${Date.now()}`;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'password123',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(testUsername);
    expect(res.body.user.email).toBe(testEmail);
    testUser = res.body.user;
    testToken = res.body.token;
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anotheruser',
        email: testEmail,
        password: 'password123',
      });
    expect(res.status).toBe(409);
  });

  it('should reject duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        email: 'other@example.com',
        password: 'password123',
      });
    expect(res.status).toBe(409);
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.id).toBe(testUser.id);
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should reject wrong email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('should get current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(testUser.id);
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('User API', () => {
  let userToken;

  beforeAll(async () => {
    const testEmail = `userapi_${Date.now()}@example.com`;
    const testUsername = `userapi_${Date.now()}`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: testUsername, email: testEmail, password: 'password123' });
    userToken = res.body.token;
  });

  it('should search users', async () => {
    const res = await request(app)
      .get('/api/users/search?q=test')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should require min 2 chars for search', async () => {
    const res = await request(app)
      .get('/api/users/search?q=a')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(400);
  });

  it('should update profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bio: 'Hello world' });
    expect(res.status).toBe(200);
    expect(res.body.user.bio).toBe('Hello world');
  });
});

describe('Conversation API', () => {
  let user1Token, user2Id;

  beforeAll(async () => {
    const ts = Date.now();
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: `conv1_${ts}`, email: `conv1_${ts}@example.com`, password: 'password123' });
    user1Token = res1.body.token;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ username: `conv2_${ts}`, email: `conv2_${ts}@example.com`, password: 'password123' });
    user2Id = res2.body.user.id;
  });

  it('should create a conversation', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: user2Id });
    expect(res.status).toBe(201);
    expect(res.body.conversation).toHaveProperty('id');
  });

  it('should get conversations list', async () => {
    const res = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.conversations)).toBe(true);
  });

  it('should reject creating conversation with self', async () => {
    const me = jwt.decode(user1Token);
    const res = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: me.userId });
    expect(res.status).toBe(400);
  });
});

describe('Message API', () => {
  let user1Token, conversationId;

  beforeAll(async () => {
    const ts = Date.now();
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ username: `msg1_${ts}`, email: `msg1_${ts}@example.com`, password: 'password123' });
    user1Token = res1.body.token;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ username: `msg2_${ts}`, email: `msg2_${ts}@example.com`, password: 'password123' });

    const convRes = await request(app)
      .post('/api/conversations')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: res2.body.user.id });
    conversationId = convRes.body.conversation.id;
  });

  it('should send a message', async () => {
    const res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: 'Hello there!' });
    expect(res.status).toBe(201);
    expect(res.body.message.content).toBe('Hello there!');
  });

  it('should get messages', async () => {
    const res = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBeGreaterThan(0);
  });

  it('should reject empty message', async () => {
    const res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ content: '' });
    expect(res.status).toBe(400);
  });
});

describe('Socket.IO', () => {
  let socket;
  let userToken;

  beforeAll(async () => {
    const ts = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: `sock_${ts}`, email: `sock_${ts}@example.com`, password: 'password123' });
    userToken = res.body.token;
  });

  afterEach(() => {
    if (socket && socket.connected) socket.disconnect();
  });

  it('should connect with valid token', (done) => {
    socket = Client(`http://localhost:${server.address().port}`, {
      auth: { token: userToken },
    });
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });
    socket.on('connect_error', (err) => {
      done(err);
    });
  });

  it('should receive online users list', (done) => {
    socket = Client(`http://localhost:${server.address().port}`, {
      auth: { token: userToken },
    });
    socket.on('users-online', (users) => {
      expect(Array.isArray(users)).toBe(true);
      done();
    });
  });
});

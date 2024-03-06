const request = require('supertest');
const http = require('http');
const app = require('../src/index.js');
const User = require("../src/db/models/user");
const server = http.createServer(app);
const request = require('supertest')(server);


describe('POST /login', () => {
  it('should login with correct credentials', async () => {
    const existingUser = {
      email: 'john@example.com',
      password: 'password123',
    };
    

    const response = await request(app)
      .post('/login')
      .send(existingUser)
      .expect(200);

    expect(response.body.session.token).toBeTruthy();
    expect(response.body.user.user_metadata.fullName).toBe('John Doe');
    expect(response.body.user.user_metadata.email).toBe('john@example.com');
  });

  it('should return 401 with incorrect password', async () => {
    const existingUser = {
      email: 'john@example.com',
      password: 'password123',
    };

    await User.create({
      fullName: 'John Doe',
      ...existingUser,
    });

    const response = await request(app)
      .post('/login')
      .send({ ...existingUser, password: 'incorrect' })
      .expect(401);

    expect(response.body.message).toBe('Incorrect password.');
  });

  it('should return 401 if user does not exist', async () => {
    const nonExistingUser = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/login')
      .send(nonExistingUser)
      .expect(401);

    expect(response.body.message).toBe('User with provided email not found.');
  });
});
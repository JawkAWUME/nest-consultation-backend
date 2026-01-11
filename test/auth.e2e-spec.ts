import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nom: 'Test',
        prenom: 'User',
        email: 'testuser@example.com',
        motDePasse: 'password123',
      })
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    jwtToken = res.body.accessToken;
  });

  it('/auth/login (POST) - should login with correct credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        motDePasse: 'password123',
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    jwtToken = res.body.accessToken;
  });

  it('/auth/profile (GET) - should return user profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('nom');
  });

  it('/auth/change-password (PUT) - should change password', async () => {
    await request(app.getHttpServer())
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ oldPassword: 'password123', newPassword: 'newpass456' })
      .expect(200);
  });

  it('/auth/validate (POST) - should validate token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/validate')
      .send({ token: jwtToken })
      .expect(200);

    expect(res.body.valid).toBe(true);
  });

  it('/auth/logout (POST) - should logout user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res.body.message).toBe('Déconnexion réussie');
  });
});

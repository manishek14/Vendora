import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / should return 200', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });

  describe('Auth endpoints', () => {
    it('POST /auth/register/local - should return 400 for invalid body', () => {
      return request(app.getHttpServer())
        .post('/auth/register/local')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('POST /auth/login/phone - should return 201 for valid phone', () => {
      return request(app.getHttpServer())
        .post('/auth/login/phone')
        .send({ phone: '09123456789' })
        .expect((res) => {
          expect([200, 201]).toContain(res.status);
        });
    });
  });

  describe('Products endpoints', () => {
    it('GET /products - should return 200', () => {
      return request(app.getHttpServer()).get('/products').expect(200);
    });

    it('POST /products - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({ title: 'test' })
        .expect(401);
    });
  });

  describe('Tickets endpoints', () => {
    it('GET /tickets - should return 401 without token', () => {
      return request(app.getHttpServer()).get('/tickets').expect(401);
    });

    it('POST /tickets - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/tickets')
        .send({ title: 'test', subject: 'sub' })
        .expect(401);
    });
  });

  describe('Reviews endpoints', () => {
    it('GET /reviews/product/1 - should return 200', () => {
      return request(app.getHttpServer()).get('/reviews/product/1').expect(200);
    });

    it('POST /reviews/product/1 - should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/reviews/product/1')
        .send({ rating: 5 })
        .expect(401);
    });
  });

  describe('Admin endpoints', () => {
    it('GET /admin/dashboard - should return 401 without token', () => {
      return request(app.getHttpServer()).get('/admin/dashboard').expect(401);
    });
  });
});

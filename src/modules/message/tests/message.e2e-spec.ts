import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { testDatabaseModule } from '@core/database/testDatabase';
import { seed } from '@core/database/seedData';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { MessageModule } from '../message.module';
import { CreateMessageDtoFactory, UpdateMessageDtoFactory } from './factories';
import { EmailModule } from '@modules/email/email.module';
import { User } from '@modules/user/entities/user.entity';

describe('MessageController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let user: Partial<User>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        testDatabaseModule,
        UserModule,
        AuthModule,
        EmailModule,
        MessageModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    await seed();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });
  beforeEach(async () => {
    const data = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Passw0rd',
      })
      .expect(200);
    user = data.body.user;
    token = data.body.token;
  });
  it('/messages (POST)', async () => {
    const createMessageDto = CreateMessageDtoFactory();
    const response = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(response.body).toStrictEqual({
      ...createMessageDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/messages (GET)', async () => {
    return request(app.getHttpServer())
      .get('/messages')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
  it('/messages/:id (GET)', async () => {
    const createMessageDto = CreateMessageDtoFactory();
    const { body: message } = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const response = await request(app.getHttpServer())
      .get(`/messages/${message.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      ...createMessageDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/messages/:id (PATCH)', async () => {
    const createMessageDto = CreateMessageDtoFactory();
    const { body: message } = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const updateMessageDto = UpdateMessageDtoFactory();
    const response = await request(app.getHttpServer())
      .patch(`/messages/${message.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateMessageDto)
      .expect(200);
    expect(response.body).toMatchObject({
      ...updateMessageDto,
      id: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      userId: user.id,
    });
    return;
  });
  it('/messages/:id (DELETE)', async () => {
    const createMessageDto = CreateMessageDtoFactory();
    const { body: message } = await request(app.getHttpServer())
      .post('/messages')
      .send(createMessageDto)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    return request(app.getHttpServer())
      .delete(`/messages/${message.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});

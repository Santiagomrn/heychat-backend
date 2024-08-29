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
import { EmailModule } from '@modules/email/email.module';
import { faker } from '@faker-js/faker';

describe('MessageController (e2e)', () => {
  let app: INestApplication;
  let token: string;
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
    token = data.body.token;
  });

  it('/messages/users/:userId (GET)', async () => {
    return request(app.getHttpServer())
      .get('/messages/users/' + faker.number.int())
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});

import { Test } from '@nestjs/testing';
import { WebsocketGateway } from '../websocket.gateway';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { MessageModule } from '@modules/message/message.module';
import { testDatabaseModule } from '@core/database/testDatabase';
import { AuthModule } from '@modules/auth/auth.module';
import { EmailModule } from '@modules/email/email.module';
import { seed } from '@core/database/seedData';
import { UserModule } from '@modules/user/user.module';
import { wait } from '@libraries/util';
import request from 'supertest';
import { CredentialsDto } from '@modules/auth/dto/Credentials.dto';
import { AppController } from 'src/app.controller';

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    imports: [
      testDatabaseModule,
      AuthModule,
      MessageModule,
      UserModule,
      EmailModule,
    ],
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;
  let app: INestApplication;
  let ioSender: Socket;
  let ioReceiver: Socket;
  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(WebsocketGateway);
    await seed();
    await app.listen(3000);
    // Get the gateway instance from the app instance
    gateway = app.get<WebsocketGateway>(WebsocketGateway);
    // Create a new client that will interact with the gateway
    ioSender = await getAuthIoClient('user@example.com', 'Passw0rd');
    ioReceiver = await getAuthIoClient('admin@example.com', 'Passw0rd');
  });
  const getAuthIoClient = async (
    email: string,
    password: string,
  ): Promise<Socket> => {
    const { body: credentials } = await loginUser(email, password);
    return io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: {
        token: credentials.token,
      },
    });
  };
  const loginUser = async (
    email: string,
    password: string,
  ): Promise<{ body: CredentialsDto }> => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email,
        password: password,
      })
      .expect(function (res) {
        if (res.status != HttpStatus.OK) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect(HttpStatus.OK);
    return response;
  };

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit "newMessage" on "message"', async () => {
    ioSender.connect();
    ioReceiver.connect();

    ioSender.on('connect', () => {
      console.log('ioSender connected');
    });

    ioReceiver.on('connect', () => {
      console.log('ioReceiver connected');
    });

    try {
      ioSender.emit('sendMessage', {
        content: 'data',
        receiverId: 1,
      });
    } catch (error) {}

    await new Promise<void>((resolve, reject) => {
      ioReceiver.on('newMessage', (data) => {
        try {
          expect(data).toMatchObject({
            id: expect.any(Number),
            content: 'data',
            receiverId: 1,
            senderId: 2,
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          });
          resolve();
        } catch (ex) {
          ioReceiver.disconnect();
          reject(ex);
        }
      });
    });

    ioSender.disconnect();
    ioReceiver.disconnect();
    await wait(2000);
  });
});

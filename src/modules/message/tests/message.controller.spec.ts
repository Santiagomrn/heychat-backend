import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageService } from '../message.service';
import { MessageFactory } from './factories';
import { Message } from '../entities/message.entity';
import { testDatabaseModule } from '@core/database/testDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

describe('Message Controller', () => {
  let controller: MessageController, service: MessageService;
  const createTestingModule = async () => {
    const mockMessageService = {
      getChat: async () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [testDatabaseModule, SequelizeModule.forFeature([Message])],
      controllers: [MessageController],
      providers: [MessageService, JwtService],
    })
      .overrideProvider(MessageService)
      .useValue(mockMessageService)
      .compile();

    return module;
  };

  beforeAll(async () => {
    const module = await createTestingModule();
    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of messages', async () => {
    const mockedMessages = MessageFactory(10);
    jest.spyOn(service, 'getChat').mockImplementation(
      jest.fn(async () => {
        return { count: 10, limit: 10, offset: 0, data: mockedMessages };
      }),
    );
    const session = { jwt: { id: 2 } };
    expect(await controller.findAllWithUser(1, session)).toStrictEqual({
      count: 10,
      limit: 10,
      offset: 0,
      data: mockedMessages,
    });
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});

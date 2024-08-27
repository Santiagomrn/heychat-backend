import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../message.controller';
import { MessageService } from '../message.service';
import {
  CreateMessageDtoFactory,
  MessageFactory,
  UpdateMessageDtoFactory,
} from './factories';
import { Message } from '../entities/message.entity';
import { testDatabaseModule } from '@core/database/testDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { JwtService } from '@nestjs/jwt';

describe('Message Controller', () => {
  let controller: MessageController, service: MessageService;
  const createTestingModule = async () => {
    const mockMessageService = {
      findOne: async () => {},
      findAll: async () => {},
      create: jest.fn(async (dto: CreateMessageDto) => {
        return Message.build({
          id: Math.round(Math.random() * (1000 - 1) + 1),
          ...dto,
        });
      }),
      update: jest.fn(async (id: number, dto: UpdateMessageDto) => {
        return Message.build({
          id: id,
          ...dto,
        });
      }),
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

  it('should return a message', async () => {
    const mockedMessage: Message = MessageFactory();
    jest.spyOn(service, 'findOne').mockImplementation(
      jest.fn(async (id) => {
        mockedMessage.id = id;
        return mockedMessage;
      }),
    );
    expect(await controller.findOne(mockedMessage.id)).toStrictEqual(
      mockedMessage,
    );
  });

  it('should return an array of messages', async () => {
    const mockedMessages = MessageFactory(10);
    jest.spyOn(service, 'findAll').mockImplementation(
      jest.fn(async () => {
        return { count: 10, limit: 10, offset: 0, data: mockedMessages };
      }),
    );
    expect(await controller.findAll()).toStrictEqual({
      count: 10,
      limit: 10,
      offset: 0,
      data: mockedMessages,
    });
  });

  it('should create a message', async () => {
    const createMessageDto: CreateMessageDto = CreateMessageDtoFactory();
    expect(await controller.create(createMessageDto)).toMatchObject({
      id: expect.any(Number),
      ...createMessageDto,
    });
  });

  it('should update a message', async () => {
    const updateMessageDto: UpdateMessageDto = UpdateMessageDtoFactory();
    const id = 1;
    expect(await controller.update(id, updateMessageDto)).toMatchObject({
      id,
      ...updateMessageDto,
    });
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
});

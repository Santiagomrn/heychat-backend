import { faker } from '@faker-js/faker';
import { Message } from '../entities/message.entity';
import _ from 'lodash';
import { CreateMessageDto } from '../dto/create-message.dto';
import { plainToClass } from 'class-transformer';
import { UpdateMessageDto } from '../dto/update-message.dto';

const createRandomMessage = (): Message => {
  return new Message({
    id: faker.number.int(),
  });
};

export function MessageFactory(count: number): Message[];
export function MessageFactory(count?: number): Message;
export function MessageFactory(count: number): Message[] | Message {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomMessage, { count });
  }
  return createRandomMessage();
}

const createRandomCreateMessageDto = (): CreateMessageDto => {
  return plainToClass(CreateMessageDto, {
    name: faker.company.name(),
    userId: faker.number.int(),
  });
};

export function CreateMessageDtoFactory(count: number): CreateMessageDto[];
export function CreateMessageDtoFactory(count?: number): CreateMessageDto;
export function CreateMessageDtoFactory(
  count: number,
): CreateMessageDto[] | CreateMessageDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomCreateMessageDto, { count });
  }
  return createRandomCreateMessageDto();
}

const createRandomUpdateMessageDto = (): UpdateMessageDto => {
  return plainToClass(UpdateMessageDto, {
    name: faker.company.name(),
  });
};

export function UpdateMessageDtoFactory(count: number): UpdateMessageDto[];
export function UpdateMessageDtoFactory(count?: number): UpdateMessageDto;
export function UpdateMessageDtoFactory(
  count: number,
): UpdateMessageDto[] | UpdateMessageDto {
  if (!_.isNil(count) && _.isNumber(count)) {
    return faker.helpers.multiple(createRandomUpdateMessageDto, { count });
  }
  return createRandomUpdateMessageDto();
}

import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageRepository } from './message.repository';
import {
  IncludeOptions,
  OrderItem,
  where,
  WhereAttributeHash,
  WhereOptions,
} from 'sequelize';
import { Message } from './entities/message.entity';
import { PaginatedDto } from '@common/dto/paginated.dto';
import { Op } from 'sequelize';
import { ArrayWhereOptions, Plain } from '@libraries/baseModel.entity';

@Injectable()
export class MessageService {
  constructor(private messageRepository: MessageRepository) {}
  async create(createMessageDto: CreateMessageDto) {
    return await this.messageRepository.create(createMessageDto);
  }

  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<Message>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<Message>> {
    return await this.messageRepository.findAndCountAll(options);
  }

  async getChat(
    userId: number,
    otherUserId: number,
    options: {
      include?: IncludeOptions[];
      where?: ArrayWhereOptions<Message>;
      limit?: number;
      offset?: number;
      order?: OrderItem[];
      attributes?: string[];
    } = {
      where: [],
    },
  ) {
    options.where.push({
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });
    return await this.messageRepository.findAndCountAll(options);
  }
  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    return await this.messageRepository.findOneById(id, include, attributes);
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    return await this.messageRepository.update(id, updateMessageDto);
  }

  async remove(id: number) {
    return await this.messageRepository.delete(id);
  }

  async read(id: number) {
    return await this.messageRepository.update(id, { read: true });
  }

  async delivered(id: number) {
    return await this.messageRepository.update(id, { delivered: true });
  }
}

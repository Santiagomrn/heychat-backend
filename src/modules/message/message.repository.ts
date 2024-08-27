import { SequelizeCrudRepository } from 'src/libraries/SequelizeCrudRepository';
import { Message } from './entities/message.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaginatedDto } from '@common/dtopaginated.dto';
import { WhereOptions, OrderItem, Includeable, Transaction } from 'sequelize';
import { config } from '@config/index';
import { User } from '@modules/user/entities/user.entity';
import { Op } from 'sequelize';

@Injectable()
export class MessageRepository extends SequelizeCrudRepository<Message> {
  constructor(
    @InjectModel(Message)
    protected model: typeof Message,
    protected sequelize?: Sequelize,
  ) {
    super(sequelize);
  }
}

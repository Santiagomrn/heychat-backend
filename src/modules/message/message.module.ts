import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from './entities/message.entity';
import { MessageRepository } from './message.repository';

@Module({
  imports: [SequelizeModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [SequelizeModule, MessageService, MessageRepository],
})
export class MessageModule {}

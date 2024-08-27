import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { RoleModule } from '@modules/role/role.module';
import { IsRoleGuard } from '@modules/auth/guards/isRole.guard';
import { IsSelfUserGuard } from '@modules/auth/guards/isSelfUser.guard';
import { MessageModule } from '@modules/message/message.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), RoleModule, MessageModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, IsRoleGuard, IsSelfUserGuard],
  exports: [SequelizeModule, UserService, UserRepository],
})
export class UserModule {}

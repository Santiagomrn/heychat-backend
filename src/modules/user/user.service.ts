import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { IncludeOptions, OrderItem, WhereOptions } from 'sequelize';
import { User } from './entities/user.entity';
import { RoleRepository } from '@modules/role/role.repository';
import { ROLES } from '@modules/role/enums/roles.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedDto } from '@common/dto/paginated.dto';
import { UserChatResponseDto } from './dto/user-online-response.dto';
import { MessageRepository } from '@modules/message/message.repository';
import { Op } from 'sequelize';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private messageRepository: MessageRepository,
  ) {}
  async create(createUserDto: CreateUserDto) {
    let user: User = null;

    await this.userRepository.executeTransaction(async (t) => {
      user = await this.userRepository.create(createUserDto, t);
      const userRole = await this.roleRepository.findByName(ROLES.USER, t);
      await user.addRole(userRole.id, t);
    });

    return UserResponseDto.fromUser(user);
  }
  async findAll(options?: {
    include?: IncludeOptions[];
    where?: ArrayWhereOptions<User>;
    limit?: number;
    offset?: number;
    order?: OrderItem[];
    attributes?: string[];
  }): Promise<PaginatedDto<UserResponseDto>> {
    const paginatedUsers = await this.userRepository.findAndCountAll(options);

    const users = UserResponseDto.fromUser(paginatedUsers.data);
    const paginatedUserResponses = { ...paginatedUsers, data: users };
    return paginatedUserResponses as PaginatedDto<UserResponseDto>;
  }
  async findAllUserChats(
    userId: number,
    options: {
      where?: ArrayWhereOptions<User>;
      offset?: number;
      limit?: number;
    },
  ) {
    const paginatedUsers = await this.userRepository.findAndCountAllUserChats(
      userId,
      {
        ...options,
      },
    );
    const users = UserChatResponseDto.fromUser(paginatedUsers.data);
    const paginatedUserResponses = { ...paginatedUsers, data: users };
    return paginatedUserResponses as PaginatedDto<UserChatResponseDto>;
  }
  async findOne(id: number, include?: IncludeOptions[], attributes?: string[]) {
    const user = await this.userRepository.findOneById(id, include, attributes);
    return UserResponseDto.fromUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    return UserResponseDto.fromUser(user);
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }
  async online(id: number) {
    return await this.userRepository.update(id, { isOnline: true });
  }
  async offline(id: number) {
    return await this.userRepository.update(id, { isOnline: false });
  }
}

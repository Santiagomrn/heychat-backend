import { Plain } from '@libraries/baseModel.entity';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { AuthType, User } from '../entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { UserRole } from '@modules/userrole/entities/userrole.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Message } from '@modules/message/entities/message.entity';

export class UserChatResponseDto implements Plain<User> {
  @Expose()
  id: number;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  isOnline: boolean;
  @Expose()
  avatar: string;

  @Exclude()
  @ApiHideProperty()
  email: string;
  @Exclude()
  @ApiHideProperty()
  isActive: boolean;
  @Exclude()
  @ApiHideProperty()
  isEmailConfirmed: boolean;
  @Exclude()
  @ApiHideProperty()
  password: string;
  @Exclude()
  @ApiHideProperty()
  authType: AuthType;
  @Exclude()
  @ApiHideProperty()
  createdAt: Date;
  @Exclude()
  @ApiHideProperty()
  updatedAt: Date;
  @Exclude()
  @ApiHideProperty()
  userRoles: UserRole[];
  @Exclude()
  @ApiHideProperty()
  roles: Role[] = undefined;
  @Expose()
  @ApiHideProperty()
  sentMessages: Message[] = undefined;
  @Expose()
  @ApiHideProperty()
  receivedMessages: Message[] = undefined;

  static fromPlain(user: Plain<User>): UserChatResponseDto;
  static fromPlain(user: Plain<User>[]): UserChatResponseDto[];
  static fromPlain(
    user: Plain<User> | Plain<User>[],
  ): UserChatResponseDto | UserChatResponseDto[] {
    return plainToClass(UserChatResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static fromUser(user: User): UserChatResponseDto;
  static fromUser(user: User[]): UserChatResponseDto[];
  static fromUser(
    _user: User | User[],
  ): UserChatResponseDto | UserChatResponseDto[] {
    let user: Plain<User> | Plain<User>[];
    if (Array.isArray(_user)) {
      user = _user.map((user) => {
        return user.toJSON();
      });
    } else {
      user = _user.toJSON();
    }

    return plainToClass(UserChatResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}

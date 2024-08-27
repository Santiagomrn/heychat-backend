import {
  Column,
  DataType,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel, Plain } from '@libraries/baseModel.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Table({
  tableName: 'message',
})
export class Message extends BaseModel<Message> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  senderId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  receiverId: number;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  delivered: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  read: boolean;

  @ApiHideProperty()
  @BelongsTo(() => User, { foreignKey: 'senderId', as: 'sender' })
  sender: User;

  @ApiHideProperty()
  @BelongsTo(() => User, { foreignKey: 'receiverId', as: 'receiver' })
  receiver: User;
}

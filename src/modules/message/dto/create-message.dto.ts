import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';
export class CreateMessageDto {
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @ApiHideProperty()
  @IsNumber()
  senderId: number;
}

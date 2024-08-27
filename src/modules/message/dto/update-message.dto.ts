import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
export class UpdateMessageDto {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(1000)
  @IsString()
  content?: string;
}

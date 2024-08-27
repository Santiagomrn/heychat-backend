import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  Session,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ParseOffsetPipe } from '@pipes/parseOffset.pipe';
import { ParseLimitPipe } from '@pipes/parseLimit.pipe';
import { ParseWherePipe } from '@pipes/parseWhere.pipe';
import { IncludeOptions, OrderItem, WhereOptions } from 'sequelize';
import { ParseIncludePipe } from '@pipes/parseInclude.pipe';
import { ParseOrderPipe } from '@pipes/parseOrder.pipe';
import { Message } from './entities/message.entity';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from '@swagger/utils/commonResponses.decorator';
import { ParseAttributesPipe } from '@pipes/parseAttributes.pipe';
import { ApiQueryAttributes } from '@swagger/parameters/attributes.decorator';
import { ApiQueryWhere } from '@swagger/parameters/where.decorator';
import { ApiQueryInclude } from '@swagger/parameters/include.decorator';
import { ApiQueryPagination } from '@swagger/utils/pagination.decorator';
import { ApiOkResponsePaginatedData } from '@swagger/httpResponses/OkPaginatedData.decorator';
import { ApiOkResponseData } from '@swagger/httpResponses/Ok.decorator';
import { ApiCreatedResponseData } from '@swagger/httpResponses/Created.decorator';
import { IsOwner } from '@modules/auth/decorators/isOwner.decorator';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { FilterOwner } from '@decorators/filterOwner.decorator';
import { AppendUser } from '@decorators/appendUser.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';

@ApiExtraModels(Message)
@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Create a Message' })
  @ApiCommonResponses()
  @ApiCreatedResponseData(Message)
  @AppendUser<CreateMessageDto>('senderId')
  @ValidateJWT()
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.create(createMessageDto);
  }

  @ApiOperation({ summary: 'Get all Message entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Message)
  @ApiCommonResponses()
  @FilterOwner<Message>('senderId')
  @ValidateJWT()
  @Get('sent')
  async findAllSent(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Message>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Message))
    include?: IncludeOptions[],
  ) {
    const data = await this.messageService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
    return data;
  }

  @ApiOperation({ summary: 'Get all Message entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Message)
  @ApiCommonResponses()
  @FilterOwner<Message>('receiverId')
  @ValidateJWT()
  @Get('received')
  async findAllReceive(
    @Query('where', ParseWherePipe) where?: ArrayWhereOptions<Message>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Message))
    include?: IncludeOptions[],
  ) {
    const data = await this.messageService.findAll({
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
    return data;
  }

  @ApiOperation({ summary: 'Get all Message entries' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Message)
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('chat/user/:userId')
  async findChatWith(
    @Param('userId', ParseIntPipe) userId: number,
    @Session() session,
    @Query('where', ParseWherePipe)
    where?: ArrayWhereOptions<Message>,
    @Query('offset', ParseOffsetPipe) offset?: number,
    @Query('limit', ParseLimitPipe) limit?: number,
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
    @Query('order', ParseOrderPipe) order?: OrderItem[],
    @Query('include', new ParseIncludePipe(Message))
    include?: IncludeOptions[],
  ) {
    const authUserId = session.jwt.id;
    return await this.messageService.getChat(authUserId, userId, {
      where,
      attributes,
      offset,
      limit,
      include,
      order,
    });
  }

  @ApiOperation({ summary: 'Get Message entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Message)
  @ApiQueryAttributes()
  @ApiQueryInclude()
  @IsOwner(MessageService)
  @ValidateJWT()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include', new ParseIncludePipe(Message))
    include?: IncludeOptions[],
    @Query('attributes', ParseAttributesPipe)
    attributes?: string[],
  ) {
    return await this.messageService.findOne(+id, include, attributes);
  }

  @ApiOperation({ summary: 'Set Message entry as read' })
  @ApiCommonResponses()
  @ApiOkResponseData(Message)
  @IsOwner<Message>(MessageService, 'senderId')
  @ValidateJWT()
  @Patch('read/:id')
  async setMessageRead(@Param('id', ParseIntPipe) id: number) {
    return await this.messageService.read(+id);
  }

  @ApiOperation({ summary: 'Update Message entry by id' })
  @ApiCommonResponses()
  @ApiOkResponseData(Message)
  @IsOwner<Message>(MessageService, 'senderId')
  @ValidateJWT()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return await this.messageService.update(+id, updateMessageDto);
  }

  @ApiOperation({ summary: 'Delete Message entry by id' })
  @ApiCommonResponses()
  @HttpCode(HttpStatus.NO_CONTENT)
  @IsOwner<Message>(MessageService, 'senderId')
  @ValidateJWT()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.messageService.remove(+id);
  }
}

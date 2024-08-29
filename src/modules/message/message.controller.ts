import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Session,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { ParseOffsetPipe } from '@pipes/parseOffset.pipe';
import { ParseLimitPipe } from '@pipes/parseLimit.pipe';
import { ParseWherePipe } from '@pipes/parseWhere.pipe';
import { IncludeOptions, OrderItem } from 'sequelize';
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
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { ArrayWhereOptions } from '@libraries/baseModel.entity';

@ApiExtraModels(Message)
@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @ApiOperation({ summary: 'Get all Message entries of a chat with userId' })
  @ApiQueryAttributes()
  @ApiQueryWhere()
  @ApiQueryInclude()
  @ApiQueryPagination()
  @ApiOkResponsePaginatedData(Message)
  @ApiCommonResponses()
  @ValidateJWT()
  @Get('users/:userId')
  async findAllWithUser(
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
}

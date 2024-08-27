import { Logger } from '@core/logger/Logger';
import { AppendUserWS } from '@decorators/appendUserWS.decorator';
import { AuthService, IJwtPayload } from '@modules/auth/auth.service';
import { ValidateJWT } from '@modules/auth/decorators/validateJWT.decorator';
import { ValidateJWTWS } from '@modules/auth/decorators/validateJWTWS.decorator';
import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { MessageService } from '@modules/message/message.service';
import { UserChatResponseDto } from '@modules/user/dto/user-online-response.dto';
import { UserService } from '@modules/user/user.service';
import {
  OnApplicationShutdown,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect<Socket>,
    OnApplicationShutdown
{
  private readonly logger = new Logger(WebsocketGateway.name);
  @WebSocketServer()
  private io: Server;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private userService: UserService,
  ) {}
  afterInit() {
    this.logger.log('Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const { sockets } = this.io.sockets;
    const token: string = String(client.handshake.auth.token);
    const jwtPayload = this.authService.validateJwt(token);

    this.logger.log(`UserId: ${jwtPayload.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
    client.join(jwtPayload.id.toString());
    const user = await this.userService.online(jwtPayload.id);
    this.logger.log(`Client id: ${client.id} joined to room: ${jwtPayload.id}`);
    this.io.emit('onlineUser', UserChatResponseDto.fromUser(user));
  }

  async handleDisconnect(client: Socket) {
    const token: string = String(client.handshake.auth.token);
    const jwtPayload: IJwtPayload = this.authService.decodeJwt(token);
    await this.userService.offline(jwtPayload.id);
    this.logger.log(`UserId:${jwtPayload.id} disconnected`);
    const user = await this.userService.findOne(jwtPayload.id);
    this.io.emit('offlineUser', UserChatResponseDto.fromPlain(user));
    client.disconnect();
  }

  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @AppendUserWS<CreateMessageDto>('senderId')
  @ValidateJWTWS()
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    const jwtPayload: IJwtPayload = client.data.jwtPayload;
    this.logger.info(
      `Message received from UserId: ${jwtPayload.id} `,
      'Payload:',
      { data },
    );
    const message = await this.messageService.create(data);
    this.io.to(data.receiverId.toString()).emit('newMessage', message);
    this.logger.info(
      `Message Send to UserId: ${message.receiverId} `,
      'Message',
      message,
    );

    return message;
  }

  @SubscribeMessage('messageDelivered') //add guards by participants
  async messageDelivered(@MessageBody() messageId: number) {
    const message = await this.messageService.delivered(messageId);
    this.io.to(message.senderId.toString()).emit('messageDelivered', message);
    return message;
  }

  @SubscribeMessage('messageRead') //add guards by participants
  async messageRead(@MessageBody() messageId: number) {
    const message = await this.messageService.read(messageId);
    this.io.to(message.senderId.toString()).emit('messageRead', message);
    return message;
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
  onApplicationShutdown(signal?: string) {
    this.close();
  }
  close() {
    this.io.close();
  }
}

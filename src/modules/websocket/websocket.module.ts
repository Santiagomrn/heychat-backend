import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [MessageModule, AuthModule, UserModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './core/database/database';
import { EmailModule } from '@modules/email/email.module';

import { WebsocketModule } from '@modules/websocket/websocket.module';
import { MessageModule } from '@modules/message/message.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    UserModule,
    AuthModule,
    MessageModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthController, AuthService],
  exports: [AuthService],
})
export class AuthModule {}

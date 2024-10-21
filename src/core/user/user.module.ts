import { forwardRef, Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserService } from "./services/user.service";
import { UserContoller } from "./controller/user.controller";
import { AccountModule } from "../account/account.module";


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AccountModule),
  ],
  providers: [UserService],
  controllers: [UserContoller],
  exports: [UserService],
})
export class UserModule {}
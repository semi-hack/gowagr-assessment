import { forwardRef, Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { AccountService } from "./services/account.service";
import { AccountController } from "./controllers/account.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => UserModule)
  ],
  providers: [AccountService,
  ],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { AccountService } from "./services/account.service";




@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
  ],
  providers: [AccountService,
  ],
  controllers: [],
  exports: [AccountService],
})
export class AccountModule {}
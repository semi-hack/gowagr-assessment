import { forwardRef, Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transfer } from "./entities/transfer.entity";
import { TransferService } from "./services/transfer.service";
import { AccountModule } from "../account/account.module";
import { UserModule } from "../user/user.module";
import { TransferController } from "./controllers/transfer.controller";




@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer]),
    forwardRef(() => AccountModule),
    forwardRef(() => UserModule)
  ],
  providers: [TransferService],
  controllers: [TransferController],
  exports: [TransferService],
})
export class TransferModule {}
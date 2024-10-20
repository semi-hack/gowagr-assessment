import { Body, Controller, forwardRef, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { TransferService } from "../services/transfer.service";
import { JWTHTTPAuthGuard } from "src/shared/guards/auth.guard";
import { InitiateTransferDto } from "../dto/transfer.dto";
import { SuccessResponse } from "src/shared/utils/response.util";


@Controller('transfers')
export class TransferController {
  constructor(
    @Inject(forwardRef(() => TransferService))
    private readonly transferService: TransferService,
  ) {}

    
    @Post()
    @UseGuards(JWTHTTPAuthGuard)
    async intiate(@Req() req: any, @Body() body: InitiateTransferDto ) {
      const { currentUser } = req
      const transfer = await this.transferService.initiateTransfer({
        sender: currentUser.id,
        ...body
      });
      return SuccessResponse('Transfer Successful', transfer);
    }

    @Get()
    @UseGuards(JWTHTTPAuthGuard)
    async fetchTransfers(@Req() req: any) {
        const { currentUser, query, pagination } = req
        const transfers = await this.transferService.find({
            currentUser,
            query,
            pagination
        })
        return SuccessResponse('Query Successful', transfers)
    }
}
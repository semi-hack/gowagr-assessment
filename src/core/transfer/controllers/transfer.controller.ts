import { Body, Controller, forwardRef, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { TransferService } from "../services/transfer.service";
import { JWTHTTPAuthGuard } from "../../../shared/guards/auth.guard";
import { InitiateTransferDto } from "../dto/transfer.dto";
import { SuccessResponse } from "../../../shared/utils/response.util";
import { ApiTags } from "@nestjs/swagger";


@Controller('transfers')
export class TransferController {
  constructor(
    @Inject(forwardRef(() => TransferService))
    private readonly transferService: TransferService,
  ) {}

    
    @Post()
    @ApiTags('Transfer')
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
    @ApiTags('Transfer')
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
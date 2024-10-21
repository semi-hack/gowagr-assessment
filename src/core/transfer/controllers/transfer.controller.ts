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

    /**
     * Initiates a transfer
     * @param {any} req - The request object
     * @param {InitiateTransferDto} body - The transfer data
     * @returns {Promise<object>} The response object containing the transfer data
     * @throws {BadRequestException} If the transfer fails
     */
    @Post()
    @ApiTags('Transfer')
    @UseGuards(JWTHTTPAuthGuard)
    async initiate(@Req() req: any, @Body() body: InitiateTransferDto ) {
      const { currentUser } = req
      const transfer = await this.transferService.initiateTransfer({
        sender: currentUser.id,
        ...body
      });
      return SuccessResponse('Transfer Successful', transfer);
    }

    /**
     * Fetches transfers based on the provided query parameters
     * @param {any} req - The request object
     * @returns {Promise<object>} The response object containing the transfers
     */
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
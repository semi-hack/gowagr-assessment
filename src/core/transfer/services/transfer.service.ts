import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transfer } from "../entities/transfer.entity";
import { Between, DataSource, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { ServiceMethodOptions } from "src/shared/interfaces/service-method-options";
import { PaginatedResult } from "src/shared/interfaces/paginated-result.interface";
import { InitiateTransferInput } from "../interfaces/transfer.interface";
import { AccountService } from "src/core/account/services/account.service";
import { UserService } from "src/core/user/services/user.service";
import * as randomstring from 'randomstring';




@Injectable()
export class TransferService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    
  }

  async initiateTransfer(initiateTransferInput: InitiateTransferInput ) {
    const {  sender, amount, receiver} = initiateTransferInput
    return this.datasource.transaction(async (manager) => {
        const senderAccount = await this.userService.findByUserId(sender);
        const receiverAccount = await this.userService.findByUsername(receiver)

        if (!receiverAccount) {
            throw new BadRequestException('Recipient not found');
        }

        const balanceBefore = senderAccount.account.balance;
        const updatedSenderAccount = await this.accountService.debitAccount(senderAccount.account.id, amount);
        await this.accountService.creditAccount(receiverAccount.account.id, amount);

        const reference = randomstring.generate({
            length: 12,
            charset: 'alphanumeric'
        })

        const transfer = await this.transferRepo.create({
            sender: senderAccount,
            receiver: receiverAccount,
            amount: amount,
            reference,
            balanceBefore: balanceBefore,
            balanceAfter: updatedSenderAccount.balance
        })

        const savedTransfer = await manager.save(transfer)

        return savedTransfer
    })
  }

  buildFilter(query: any) {
    const filter = {};

    if (query.startPeriodDatetime) {
      filter['createdAt'] = MoreThanOrEqual(query.startPeriodDatetime);
    }

    if (query.endPeriodDatetime) {
      filter['createdAt'] = LessThanOrEqual(query.endPeriodDatetime);
    }

    if (query.startPeriodDatetime && query.endPeriodDatetime) {
      filter['createdAt'] = Between(
        query.startPeriodDatetime,
        query.endPeriodDatetime,
      );
    }

    return filter;
  }

  async find(options: ServiceMethodOptions): Promise<PaginatedResult<Transfer>> {
    const { currentUser, query, pagination } = options;
    const filter = this.buildFilter(query);

    let transferQuery = this.transferRepo
      .createQueryBuilder('transfer')
      .skip(pagination.skip)
      .take(pagination.take)
      .where('transfer.senderId = :userId OR transfer.receiverId = :userId', { userId: currentUser.id })
      .andWhere({ ...filter })
      .leftJoinAndSelect('transfer.sender', 'sender')
      .leftJoinAndSelect('transfer.receiver', 'receiver')
      .orderBy('transfer.createdAt', 'DESC')


    const [records, count] = await transferQuery.getManyAndCount();

    return { records, count };
  }


}

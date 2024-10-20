import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "../entities/account.entity";



@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {
    
  }

  async create(user: any): Promise<Account> {
    const account = this.accountRepo.create({ user })
    return account;
  }

  async debitAccount(accountId: string, amount: number): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    account.balance -= amount;
    return this.accountRepo.save(account);
  }

  async creditAccount(accountId: string, amount: number): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    account.balance += amount;
    return this.accountRepo.save(account);
  }


}


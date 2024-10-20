import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Account } from "../entities/account.entity";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";



@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    
  }
  private createCacheKeyForUser(userId: string): string {
    return `user_balance_${userId}`;
  }

  async getBalance(accountId: string): Promise<number> {
    const cacheKey = this.createCacheKeyForUser(accountId);
    
    const cachedBalance = await this.cacheManager.get<number>(cacheKey);
    if (cachedBalance !== null) {
      return cachedBalance; 
    }

    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    await this.cacheManager.set(cacheKey, account.balance); 

    return account.balance;
  }

  async create(user: any): Promise<Account> {
    const account = this.accountRepo.create({ user })
    return account;
  }

  async debitAccount(accountId: string, amount: number, manager: EntityManager): Promise<Account> {
    const account = await manager.findOne(Account, { where: { id: accountId } });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    account.balance -= amount;
    const updatedAccount = await manager.save(account);

    await this.cacheManager.set(this.createCacheKeyForUser(accountId), updatedAccount.balance);

    return updatedAccount
  }

  async creditAccount(accountId: string, amount: number,  manager: EntityManager): Promise<Account> {
    const account = await manager.findOne(Account, { where: { id: accountId } });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    account.balance += amount;

    const updatedAccount = await manager.save(account)

    await this.cacheManager.set(this.createCacheKeyForUser(accountId), updatedAccount.balance);

    return updatedAccount;
  }


}


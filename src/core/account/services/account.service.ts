import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Account } from "../entities/account.entity";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class AccountService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    
  }
  /**
   * Generates a cache key based on the user ID.
   * @param userId The ID of the user.
   * @returns The cache key for the user.
   */
  private createCacheKeyForUser(userId: string): string {
    return `user_balance_${userId}`;
  }

/**
 * Retrieves the balance for a specific account ID. If the balance is cached, it is returned directly from the cache. 
 * Otherwise, the balance is fetched from the database and cached for future use.
 * 
 * @param {string} accountId - The ID of the account to retrieve the balance for.
 * @returns {Promise<number>} A Promise that resolves to the balance of the account.
 * @throws {BadRequestException} If the account with the specified ID is not found.
 */
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

  /**
   * Creates a new account associated with the given user.
   * 
   * @param {any} user - The user to associate with the new account.
   * @returns {Promise<Account>} A Promise that resolves to the newly created account.
   */
  async create(user: any): Promise<Account> {
    const account = this.accountRepo.create({ user })
    return account;
  }

  /**
   * Decreases the balance of an account by a given amount. If the account is not found or the balance is insufficient, 
   * a BadRequestException is thrown. The new balance is also cached for future use.
   * 
   * @param {string} accountId - The ID of the account to debit.
   * @param {number} amount - The amount to debit from the account.
   * @param {EntityManager} manager - The entity manager to use for the transaction.
   * @returns {Promise<Account>} A Promise that resolves to the updated account.
   * @throws {BadRequestException} If the account with the specified ID is not found or the balance is insufficient.
   */
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

  /**
   * Increases the balance of an account by a given amount. If the account is not found, a BadRequestException is thrown. 
   * The new balance is also cached for future use.
   * 
   * @param {string} accountId - The ID of the account to credit.
   * @param {number} amount - The amount to credit the account with.
   * @param {EntityManager} manager - The entity manager to use for the transaction.
   * @returns {Promise<Account>} A Promise that resolves to the updated account.
   * @throws {BadRequestException} If the account with the specified ID is not found.
   */
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

  /**
   * Funds an account with a given amount in a transactional manner.
   * 
   * @param {string} accountId - The ID of the account to fund.
   * @param {number} amount - The amount to fund the account with.
   * @returns {Promise<Account>} A Promise that resolves to the updated account.
   */
  async fundAccount(accountId: string, amount: number): Promise<Account> {
    return this.datasource.transaction(async (manager) => {
      const account = await this.creditAccount(accountId, amount, manager)
      return account
    })

  }

}


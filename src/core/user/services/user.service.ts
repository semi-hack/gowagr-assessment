import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from '../interfaces/user.interface';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import { AccountService } from '../../../core/account/services/account.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Checks if a username is already taken.
   * 
   * @param {string} username - The username to check.
   * @returns {Promise<void>} A Promise that resolves if the username is available, or rejects with a BadRequestException if the username is already taken.
   */
  async checkDuplicateUserName(username: string): Promise<void> {
    const user = await this.findByUsername(username);
    if (user) {
      throw new BadRequestException('This username is already taken');
    }
  }

  /**
   * Registers a new user.
   * 
   * @param {CreateUserInput} input - The input data for creating a new user.
   * @returns {Promise<User>} The newly created user.
   * @throws {BadRequestException} If the username is already taken.
   */
  async register(input: CreateUserInput): Promise<User> {
    return this.datasource.transaction(async (manager) => {

        await this.checkDuplicateUserName(input.username);
        const hashedPassword = await this.hashPassword(input.password);

        let user = this.userRepo.create({ ...input, password: hashedPassword });

        const savedUser = await manager.save(user);

        let account = await this.accountService.create(savedUser)

        await manager.save(account)

        return savedUser
    })
  }
  

  /**
   * Finds users that match the query and returns a paginated result.
   * 
   * @param {ServiceMethodOptions} options - The options for the query.
   * @returns {Promise<PaginatedResult<User>>} The paginated result of users.
   */
  async find(options: ServiceMethodOptions): Promise<PaginatedResult<User>> {
    const { query, pagination } = options;

    let userQuery = this.userRepo
      .createQueryBuilder('user')
      .skip(pagination.skip)
      .take(pagination.take)
      .where({ ...query })
      .orderBy('user.createdAt', 'DESC');

    const [records, count] = await userQuery.getManyAndCount();

    return { records, count };
  }

  /**
   * Finds a user by its ID.
   * 
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<any>} The user with its balance. If the user is not found, a NotFoundException is thrown.
   */
  async findOne(id: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cacheKey = `user_balance_${user.account.id}`;
    let cachedBalance = await this.cacheManager.get<number>(cacheKey);

    if (cachedBalance === null) {
      cachedBalance = await this.accountService.getBalance(user.account.id);
      await this.cacheManager.set(cacheKey, cachedBalance); 
    }

    return {
      id: user.id,
      username: user.username,
      balance: cachedBalance
    };
  }

  /**
   * Finds a user by their username.
   * 
   * @param {string} username - The username of the user to find.
   * @param {boolean} [withAccount=false] - Whether to include the associated account in the result.
   * @returns {Promise<User>} A promise that resolves to the found user.
   */
  async findByUsername(username: string, withAccount: boolean = false): Promise<User> {
    const queryOptions: any = {
      where: { username },
    };
  
    if (withAccount) {
      queryOptions.relations = ['account'];
    }

    return this.userRepo.findOne(queryOptions);

  }

  /**
   * Finds a user by their user ID.
   * 
   * @param {string} id - The ID of the user to find.
   * @returns {Promise<User>} A promise that resolves to the found user with associated account.
   */
  async findByUserId(id: string): Promise<User> {
    return this.userRepo.findOne({
        where: { id },
        relations: ['account']
    });
  }

  /**
   * Hashes a given password using the BCRYPT_SALT environment variable.
   * 
   * @param {string} password - The password to hash.
   * @returns {Promise<string>} A promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));
  }

  /**
   * Compares a given password with an encrypted password.
   * 
   * @param {string} rawPassword - The raw password to compare.
   * @param {string} encryptedPassword - The encrypted password to compare with.
   * @returns {Promise<void>} A promise that resolves or rejects with a BadRequestException
   * if the passwords do not match.
   */
  async comparePasswords(
    rawPassword: string,
    encryptedPassword: string,
  ): Promise<void> {
    const match = await bcrypt.compare(rawPassword, encryptedPassword);
    if (!match) {
      throw new BadRequestException('Current password is incorrect');
    }
  }
}

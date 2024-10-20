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

  async checkDuplicateUserName(username: string): Promise<void> {
    const user = await this.findByUsername(username);
    if (user) {
      throw new BadRequestException('This username is already taken');
    }
  }


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

    // If balance is not cached, fetch it and cache it
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


  async findByUsername(username: string, withAccount: boolean = false): Promise<User> {
    const queryOptions: any = {
      where: { username },
    };
  
    if (withAccount) {
      queryOptions.relations = ['account'];
    }

    return this.userRepo.findOne(queryOptions);

  }

  async findByUserId(id: string): Promise<User> {
    return this.userRepo.findOne({
        where: { id },
        relations: ['account']
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));
  }

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

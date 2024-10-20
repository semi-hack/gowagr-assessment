import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from '../interfaces/user.interface';
import { ServiceMethodOptions } from 'src/shared/interfaces/service-method-options';
import { PaginatedResult } from 'src/shared/interfaces/paginated-result.interface';
import { AccountService } from 'src/core/account/services/account.service';

@Injectable()
export class UserService {
  constructor(
    private readonly datasource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
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

  async findByUsername(username: string): Promise<User> {
    return this.userRepo.findOne({
        where: { username },
        relations: ['account']
    });
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

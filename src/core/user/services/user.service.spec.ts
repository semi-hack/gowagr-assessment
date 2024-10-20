import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { AccountService } from '../../../core/account/services/account.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserInput } from '../interfaces/user.interface';
import { PaginatedResult } from '../../../shared/interfaces/paginated-result.interface';
import { MockAccountService } from '../../../../test/mocks/services/account.service';
import * as randomstring from 'randomstring';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Repository<User>;
  let accountService: AccountService;
  let dataSource: DataSource;

  const mockUser = {
    id: '44fd2db2-eb17-47fb-bf3b-055bab132e5b',
    username: 'john_doe',
    password: 'hashed_password',
    account: {},
  } as User;

  const mockCreateUserInput: CreateUserInput = {
    username: 'john_doe',
    password: 'password123',
  };

  const mockPaginatedResult: PaginatedResult<User> = {
    records: [mockUser],
    count: 1,
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  class MockUserService extends UserService {
    hashPassword(password: string): Promise<string> {
      return Promise.resolve('hashed_password');
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule
    ({
      providers: [
        UserService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((fn) =>
              fn({
                save: jest.fn(),
              }),
            ),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
            })),
          },
        },
        {
          provide: AccountService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            getBalance: jest.fn().mockResolvedValue(1000),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCache,
        },
      ],
    })
    .overrideProvider(AccountService)
    .useValue(MockAccountService)
    .compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('checkDuplicateUserName', () => {
    it('should throw an error if username is already taken', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      await expect(service.checkDuplicateUserName('john_doe')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if username is not taken', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.checkDuplicateUserName('john_doe'),
      ).resolves.toBeUndefined();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      jest.spyOn(service, 'checkDuplicateUserName').mockResolvedValue();
      jest.spyOn(service, 'hashPassword').mockResolvedValue('hashed_password');

      const savedUser = await service.register(mockCreateUserInput);

      expect(service.checkDuplicateUserName).toHaveBeenCalledWith('john_doe');
      expect(service.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepo.create).toHaveBeenCalledWith({
        ...mockCreateUserInput,
        password: 'hashed_password',
      });
      expect(dataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return paginated users', async () => {
      const options = {
        query: {},
        pagination: { skip: 0, take: 10 },
      };

      const result = await service.find(options);

      expect(result).toEqual(mockPaginatedResult);
      expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    });
  });

  describe('findOne', () => {
    it('should return a user with cached balance', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      mockCache.get.mockResolvedValue(1000);

      const result = await service.findOne('44fd2db2-eb17-47fb-bf3b-055bab132e5b');

      expect(result).toEqual({
        id: '44fd2db2-eb17-47fb-bf3b-055bab132e5b',
        username: 'john_doe',
        balance: 1000,
      });
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: '44fd2db2-eb17-47fb-bf3b-055bab132e5b' },
        relations: ['account'],
      });
      expect(mockCache.get).toHaveBeenCalledWith('user_balance_undefined');
      expect(mockCache.set).not.toHaveBeenCalled();
    })
  })

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      const user = await service.findByUsername('john_doe');

      expect(user).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'john_doe' },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);

      const user = await service.findByUserId('44fd2db2-eb17-47fb-bf3b-055bab132e5b');

      expect(user).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: '44fd2db2-eb17-47fb-bf3b-055bab132e5b' },
        relations: ['account'],
      });
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');

      const result = await service.hashPassword('password123');

      expect(result).toEqual('hashed_password');
      expect(bcrypt.hash).toHaveBeenCalledWith(
        'password123',
        expect.any(Number),
      );
    });
  });

  describe('comparePasswords', () => {
    it('should throw an error if passwords do not match', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.comparePasswords('raw_password', 'hashed_password'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not throw if passwords match', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(
        service.comparePasswords('raw_password', 'hashed_password'),
      ).resolves.toBeUndefined();
    });
  });
});

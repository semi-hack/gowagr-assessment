import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { Account } from '../entities/account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepo: Repository<Account>;
  let entityManager: EntityManager;

  const mockAccountRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
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
        { provide: getRepositoryToken(Account), useValue: mockAccountRepo },
        { provide: EntityManager, useValue: mockEntityManager },
        {
            provide: CACHE_MANAGER,
            useValue: mockCache,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepo = module.get<Repository<Account>>(getRepositoryToken(Account));
    entityManager = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an account for a user', async () => {
      const user = { id: 'user123', name: 'John Doe' };
      const account = { id: 'account123', user };

      mockAccountRepo.create.mockReturnValue(account);
      mockAccountRepo.save.mockResolvedValue(account);

      const result = await service.create(user);

      expect(mockAccountRepo.create).toHaveBeenCalledWith({ user });
      expect(result).toEqual(account);
    });
  });

  describe('debitAccount', () => {
    it('should throw an error if the account is not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(
        service.debitAccount('account123', 100, entityManager),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Account, {
        where: { id: 'account123' },
      });
    });

    it('should throw an error if the balance is insufficient', async () => {
      const account = { id: 'account123', balance: 50 };
      mockEntityManager.findOne.mockResolvedValue(account);

      await expect(
        service.debitAccount('account123', 100, entityManager),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Account, {
        where: { id: 'account123' },
      });
    });

    it('should debit the account if there are sufficient funds', async () => {
      const account = { id: 'account123', balance: 200 };
      const updatedAccount = { ...account, balance: 100 };

      mockEntityManager.findOne.mockResolvedValue(account);
      mockEntityManager.save.mockResolvedValue(updatedAccount);

      const result = await service.debitAccount(
        'account123',
        100,
        entityManager,
      );

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Account, {
        where: { id: 'account123' },
      });
      expect(result.balance).toEqual(100);
      expect(mockEntityManager.save).toHaveBeenCalledWith(updatedAccount);
    });
  });

  describe('creditAccount', () => {
    it('should throw an error if the account is not found', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(
        service.creditAccount('account123', 100, entityManager),
      ).rejects.toThrow(BadRequestException);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Account, {
        where: { id: 'account123' },
      });
    });

    it('should credit the account successfully', async () => {
      const account = { id: 'account123', balance: 200 };
      const updatedAccount = { ...account, balance: 300 };

      mockEntityManager.findOne.mockResolvedValue(account);
      mockEntityManager.save.mockResolvedValue(updatedAccount);

      const result = await service.creditAccount(
        'account123',
        100,
        entityManager,
      );

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Account, {
        where: { id: 'account123' },
      });
      expect(result.balance).toEqual(300);
      expect(mockEntityManager.save).toHaveBeenCalledWith(updatedAccount);
    });
  });
});

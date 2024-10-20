import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from './transfer.service';
import { AccountService } from '../../../core/account/services/account.service';
import { UserService } from '../../../core/user/services/user.service';
import { Repository, DataSource, Between } from 'typeorm';
import { Transfer } from '../entities/transfer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import * as randomstring from 'randomstring';
import { User } from '../../../core/user/entities/user.entity';

describe('TransferService', () => {
  let service: TransferService;
  let accountService: AccountService;
  let userService: UserService;
  let transferRepo: Repository<Transfer>;
  let datasource: DataSource;

  const mockUser = {
    id: '1',
    username: 'john_doe',
    password: 'hashed_password',
    account: {},
  } as User;

  const mockAccountService = {
    debitAccount: jest.fn(),
    creditAccount: jest.fn(),
  };

  const mockUserService = {
    findByUserId: jest.fn(),
    findByUsername: jest.fn(),
  };

  const mockTransferRepo = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDatasource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: AccountService, useValue: mockAccountService },
        { provide: UserService, useValue: mockUserService },
        { provide: getRepositoryToken(Transfer), useValue: mockTransferRepo },
        { provide: DataSource, useValue: mockDatasource },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    accountService = module.get<AccountService>(AccountService);
    userService = module.get<UserService>(UserService);
    transferRepo = module.get<Repository<Transfer>>(getRepositoryToken(Transfer));
    datasource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateTransfer', () => {

    it('should successfully initiate transfer', async () => {
        const input = { sender: 'user123', amount: 100, receiver: 'receiver456' };
        const mockSender = { account: { id: 'account123', balance: 500 } };
        const mockReceiver = { account: { id: 'account456', balance: 200 } };
        
        mockUserService.findByUserId.mockResolvedValue(mockSender);
        mockUserService.findByUsername.mockResolvedValue(mockReceiver);
        mockAccountService.debitAccount.mockResolvedValue({ balance: 400 });
        mockAccountService.creditAccount.mockResolvedValue({ balance: 300 });
        mockTransferRepo.create.mockReturnValue({ id: 'transfer123', reference: 'random-ref' });
        mockDatasource.transaction.mockImplementation(async (transactionFn) => transactionFn({
          findOne: jest.fn(),
          save: jest.fn().mockResolvedValue({ id: 'transfer123' }),
        }));
      
        const result = await service.initiateTransfer(input);
      
        expect(result).toEqual({ id: 'transfer123' });
        expect(mockUserService.findByUserId).toHaveBeenCalledWith(input.sender);
        expect(mockUserService.findByUsername).toHaveBeenCalledWith(input.receiver);
        expect(mockAccountService.debitAccount).toHaveBeenCalledWith('account123', 100, expect.anything());
        expect(mockAccountService.creditAccount).toHaveBeenCalledWith('account456', 100, expect.anything());
        expect(mockTransferRepo.create).toHaveBeenCalledWith(expect.objectContaining({
          sender: mockSender,
          receiver: mockReceiver,
          amount: input.amount,
          reference: expect.any(String),
          balanceBefore: 500,
          balanceAfter: 400,
        }));
    });   
    
    describe('find', () => {
        it('should find transfers with filters and pagination', async () => {
          const options = {
            currentUser: mockUser,
            query: { startPeriodDatetime: '2024-01-01', endPeriodDatetime: '2024-12-31' },
            pagination: { skip: 0, take: 10 }
          };
      
          const mockTransferQueryBuilder = {
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'transfer123' }], 1])
          };
      
          mockTransferRepo.createQueryBuilder.mockReturnValue(mockTransferQueryBuilder);
      
          const result = await service.find(options);
      
          expect(result).toEqual({
            records: [{ id: 'transfer123' }],
            count: 1
          });
      
          expect(mockTransferRepo.createQueryBuilder).toHaveBeenCalled();
          expect(mockTransferQueryBuilder.skip).toHaveBeenCalledWith(0);
          expect(mockTransferQueryBuilder.take).toHaveBeenCalledWith(10);
          expect(mockTransferQueryBuilder.where).toHaveBeenCalledWith({
            createdAt: Between(options.query.startPeriodDatetime, options.query.endPeriodDatetime)
          });
          expect(mockTransferQueryBuilder.andWhere).toHaveBeenCalledWith(
            'transfer.senderId = :userId OR transfer.receiverId = :userId',
            { userId: options.currentUser.id }
          );
        });
    });
      
  });
});
import { BadRequestException } from "@nestjs/common";


export const MockAccountService = {
    create: jest.fn().mockResolvedValue({
        id: 'accountId',
        balance: 1000,
        user: {},
      }),
    
      debitAccount: jest.fn().mockImplementation((accountId, amount, manager) => {
        if (accountId !== 'accountId') {
          throw new BadRequestException('Account not found');
        }
    
        if (amount > 1000) {
          throw new BadRequestException('Insufficient balance');
        }
    
        return {
          id: accountId,
          balance: 1000 - amount,
          user: {},
        };
      }),
    
      creditAccount: jest.fn().mockImplementation((accountId, amount, manager) => {
        if (accountId !== 'accountId') {
          throw new BadRequestException('Account not found');
        }
    
        return {
          id: accountId,
          balance: 1000 + amount,
          user: {},
        };
      })
};
  
import { Test, TestingModule } from "@nestjs/testing";
import { TransferService } from "../services/transfer.service";
import { TransferController } from "./transfer.controller";
import { JWTHTTPAuthGuard } from "../../../shared/guards/auth.guard";
import { InitiateTransferDto } from "../dto/transfer.dto";

describe('TransferController', () => {
    let controller: TransferController;
    let service: TransferService;
  
    const mockTransferService = {
      initiateTransfer: jest.fn(),
      initiateTransferWithRetry: jest.fn(),
      find: jest.fn(),
    };
  
    const mockSuccessResponse = (message: string, data: any) => ({
      success: true,
      message,
      data,
    });
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [TransferController],
        providers: [
          {
            provide: TransferService,
            useValue: mockTransferService,
          },
        ],
      })
        .overrideGuard(JWTHTTPAuthGuard)
        .useValue({ canActivate: jest.fn(() => true) })
        .compile();
  
      controller = module.get<TransferController>(TransferController);
      service = module.get<TransferService>(TransferService);
    });
  
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  
    describe('initiate', () => {
      it('should initiate a transfer and return a success response', async () => {
        const mockReq = { currentUser: { id: 'tester' } };
        const mockBody: InitiateTransferDto = {
          receiver: 'semi',
          amount: 100,
        };
  
        const mockTransfer = {
          id: 'a5b5e23a-ee04-432e-a7e2-b5bcd89d9e8f',
          sender: 'tester',
          recipient: 'semi',
          amount: 100,
        };
  
        mockTransferService.initiateTransferWithRetry.mockResolvedValue(mockTransfer);
  
        const result = await controller.initiate(mockReq, mockBody);
  
        expect(mockTransferService.initiateTransferWithRetry).toHaveBeenCalledWith({
          sender: mockReq.currentUser.id,
          ...mockBody,
        });
        expect(result).toEqual(mockSuccessResponse('Transfer Successful', mockTransfer));
      });
    });
  
    describe('fetchTransfers', () => {
      it('should fetch transfers and return a success response', async () => {
        const mockReq = {
          currentUser: { id: 'tester' },
          query: { },
          pagination: { limit: 10, page: 1 },
        };
  
        const mockTransfers = [
          { id: 'transfer1', sender: 'tester', recipient: 'semi', amount: 50 },
          { id: 'transfer2', sender: 'semi', recipient: 'tester', amount: 100 },
        ];
  
        mockTransferService.find.mockResolvedValue(mockTransfers);
  
        const result = await controller.fetchTransfers(mockReq);
  
        expect(mockTransferService.find).toHaveBeenCalledWith({
          currentUser: mockReq.currentUser,
          query: mockReq.query,
          pagination: mockReq.pagination,
        });
        expect(result).toEqual(mockSuccessResponse('Query Successful', mockTransfers));
      });
    });
  });
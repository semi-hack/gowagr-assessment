import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../../core/user/services/user.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../core/user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    findByUsername: jest.fn(),
  };

  const mockUser: User = {
    id: 'user123',
    username: 'testuser',
    password: 'hashedpassword',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if the user is not found', async () => {
      mockUserService.findByUsername.mockResolvedValue(null); 
  
      const input = { username: 'nonexistent', password: 'password' };
  
      await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith(input.username);
    });

    it('should throw UnauthorizedException if the password is incorrect', async () => {
        mockUserService.findByUsername.mockResolvedValue(mockUser); 
      
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); 
      
        const input = { username: 'testuser', password: 'wrongpassword' };
      
        await expect(service.login(input)).rejects.toThrow(UnauthorizedException);
        expect(mockUserService.findByUsername).toHaveBeenCalledWith(input.username);
        expect(bcrypt.compare).toHaveBeenCalledWith(input.password, mockUser.password);
    });

    it('should return login data when credentials are valid', async () => {
        mockUserService.findByUsername.mockResolvedValue(mockUser); 
      
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); 
        jest.spyOn(jwt, 'sign').mockReturnValue('fake-jwt-token'); 
      
        const input = { username: 'testuser', password: 'password' };
        const result = await service.login(input);
      
        expect(result).toEqual({
          id: mockUser.id,
          username: mockUser.username,
          token: 'fake-jwt-token',
        });
        expect(mockUserService.findByUsername).toHaveBeenCalledWith(input.username);
        expect(bcrypt.compare).toHaveBeenCalledWith(input.password, mockUser.password);
        expect(jwt.sign).toHaveBeenCalledWith(
          { id: mockUser.id, date: expect.any(Number) },
          service.JWT_AUTH_SECRET,
          { expiresIn: '1h' },
        );
      });
  });
});
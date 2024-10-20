import { Test, TestingModule } from "@nestjs/testing";
import { UserContoller } from "./user.controller"
import { UserService } from "../services/user.service";
import * as randomstring from 'randomstring';
import { CreateUserAccountDto } from "../dto/user.dto";
import { SuccessResponse } from "../../../shared/utils/response.util";




describe('UserController', () => {
    let controller: UserContoller;

    const createUserDto: CreateUserAccountDto = {
        username: 'john',
        password: 'password',
    };

    const mockUserService = {

        register: jest.fn().mockImplementation((dto: CreateUserAccountDto) => {
            const { password, ...userWithoutPassword } = dto;

            return Promise.resolve({
              id: randomstring.generate(12),
              ...userWithoutPassword,
            });
        }),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserContoller],
            providers: [UserService]
        })
        .overrideProvider(UserService)
        .useValue(mockUserService)
        .compile();


        controller = module.get<UserContoller>(UserContoller)
    })

    it('it should be defined', () => {
        expect(controller).toBeDefined();
    })

    it('it should register a user', async () => {
        const result = await controller.register(createUserDto);

        expect(result).toEqual(
            SuccessResponse('User Created', {
              id: expect.any(String),
              username: 'john',
            }),
        );

        expect(mockUserService.register).toHaveBeenCalledWith(createUserDto)

    })
})
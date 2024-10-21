import { Body, Controller, forwardRef, Inject, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { LoginDto } from "../dto/auth.dto";
import { SuccessResponse } from "src/shared/utils/response.util";
import { ApiTags } from "@nestjs/swagger";

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

    /**
     * Logs in a user with the provided credentials
     * @param {LoginDto} body - The login credentials
     * @returns {Promise<object>} The response object containing login data
     * @throws {UnauthorizedException} If the credentials are invalid
     */
    @Post('login')
    @ApiTags('Auth')
    async login(@Body() body: LoginDto) {
      const loginData = await this.authService.login(body);
      return SuccessResponse('Logged In Successful', loginData)
    }
}
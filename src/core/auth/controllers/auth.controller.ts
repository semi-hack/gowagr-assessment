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
   * Attempts to log in a user
   */
    @Post('login')
    @ApiTags('Auth')
    async login(@Body() body: LoginDto) {
      const loginData = await this.authService.login(body);
      return SuccessResponse('Logged In Successful', loginData)
    }
}
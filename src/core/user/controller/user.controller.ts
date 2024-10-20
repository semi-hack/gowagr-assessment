import { Controller, Post, Get, Req, UseGuards, Body, Param } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { CreateUserAccountDto } from "../dto/user.dto";
import { JWTHTTPAuthGuard } from "../../../shared/guards/auth.guard";
import { SuccessResponse } from "../../../shared/utils/response.util";


@Controller('users')
export class UserContoller {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(@Body() body: CreateUserAccountDto) {
    const user = await this.userService.register(body);
    return SuccessResponse('User Created', user);
  }

  @UseGuards(JWTHTTPAuthGuard)
  @Get('id')
  async fetchUser(@Req() req: any) {
    const { currentUser } = req    
    const user = await this.userService.findOne(currentUser.id)
    return SuccessResponse('Query Successful', user)
  }

  @UseGuards(JWTHTTPAuthGuard)
  @Get(':username')
  async fetchUserByUsername(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username)
    return SuccessResponse('Query Successful', user)
  }

}

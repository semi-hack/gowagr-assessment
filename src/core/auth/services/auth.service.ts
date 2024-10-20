import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../../core/user/services/user.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { AuthJWTInput, LoggedInState, LoginInput } from '../interfaces/auth.interface';
import { User } from 'src/core/user/entities/user.entity';

@Injectable()
export class AuthService {
  JWT_AUTH_SECRET: string = process.env.JWT_AUTH_SECRET;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Generates JWT for a user
   * @param payload - An object containing the ID and email of a user
   * @returns { string } - JWT
   */
  private generateJWT(payload: AuthJWTInput): string {
    return jwt.sign({ ...payload, date: Date.now() }, this.JWT_AUTH_SECRET, {
      expiresIn: '1h',
    });
  }

  private composeLoginData(user: User, token: string): LoggedInState {
    const data = {
      id: user.id,
      username: user.username,
      token,
    };

    return data;
  }

  async login(input: LoginInput): Promise<object | LoggedInState> {
    const genericMessage = 'Invalid Credentials';
    const user = await this.userService.findByUsername(input.username);

    if (!user) {
      throw new UnauthorizedException(genericMessage);
    }

    const match = await bcrypt.compare(input.password, user.password);

    if (!match) {
      throw new UnauthorizedException(genericMessage);
    }
 
    const jwt = this.generateJWT({
      id: user.id,
    });

    return this.composeLoginData(user, jwt);
  }
}

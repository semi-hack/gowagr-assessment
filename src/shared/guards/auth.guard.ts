import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { UserService } from '../../core/user/services/user.service';
import { User } from 'src/core/user/entities/user.entity';
import { AuthenticationSuccessResult } from '../interfaces/authentication-result.interface';


@Injectable()
class HTTPAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authToken = this.resolveAuthToken(request);
      const result = (await this.validateBasedOnJWT(
        authToken,
      )) as AuthenticationSuccessResult;
      request['currentUser'] = result.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async resolveCurrentUser(userId: string): Promise<User> {
    let user: User;

    user = await this.userService.findByUserId(userId);

    if (!user) {
      throw new Error('Account not found');
    }

    return user;
  }

  async validateBasedOnJWT(
    authToken: string,
  ): Promise<AuthenticationSuccessResult> {
    const encodedData = jwt.verify(
      authToken,
      process.env.JWT_AUTH_SECRET,
    ) as Partial<User>;

    const user = await this.resolveCurrentUser(encodedData.id);

    return { user };
  }

  resolveAuthToken(request: Request): string {
    const errorMessage = 'No authorization header';
    const authorization = request.headers['authorization'] as string;
    if (!authorization) throw new Error(errorMessage);

    if (authorization.startsWith('Bearer')) {
      return this.resolveJWT(authorization);
    }
  }

  resolveJWT(requestAuthorizationHeader: string): string {
    const token = requestAuthorizationHeader.split(' ')[1];
    if (!token) throw new Error('Provide a Bearer token');
    return token;
  }
}

/** A HTTP Auth Guard for JWT authentication  */
export class JWTHTTPAuthGuard extends HTTPAuthGuard {
  async validate(authToken: string): Promise<AuthenticationSuccessResult> {
    return this.validateBasedOnJWT(authToken);
  }
}

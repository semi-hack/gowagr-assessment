import { User } from '../../core/user/entities/user.entity';

export interface AuthenticationSuccessResult {
  user: User;
}

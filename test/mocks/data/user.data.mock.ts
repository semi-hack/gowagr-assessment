import { User } from '../../../src/core/user/entities/user.entity';

export class MockUserData extends User {
  id = '1';
  username = 'john_doe';
  password = 'secret';
}

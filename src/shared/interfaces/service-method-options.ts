import { User } from '../../core/user/entities/user.entity';
import { Pagination } from './pagination.interface';

export interface ServiceMethodOptions {
  /** An instance of the User entity representing the user associated with the request */
  currentUser?: User;
  /** An instance of the `query` field on the Express.Request object */
  query?: any;
  /** A pagination object */
  pagination?: Pagination;
}

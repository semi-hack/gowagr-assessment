import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Pagination } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // parse values
    let page = Number.parseInt(req.query.page as string);
    let limit = Number.parseInt(req.query.limit as string);

    // check validity and set defaults where necessary
    page = page.toString() === Number.NaN.toString() ? 1 : page;
    limit = limit.toString() === Number.NaN.toString() ? 10 : limit;

    // set boundaries
    page = page <= 0 ? 1 : page;
    limit = limit > 100 ? 100 : limit;

    const pagination: Pagination = {
      skip: page * limit - limit,
      take: limit,
    };

    req['pagination'] = pagination;
    next();
  }
}
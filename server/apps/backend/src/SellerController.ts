import { Request, Response } from 'express-serve-static-core';
import { SellerService } from './services';

const OK = 200;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;

export const listSellers =
  (sellerService: SellerService) => (_: Request, response: Response) => {
    const sellerViews = sellerService.allSellers().map((seller) => ({
      cash: seller.cash,
      name: seller.name,
      online: seller.online,
    }));
    response.status(OK).send(sellerViews);
  };

export const sellersHistory =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    let chunk: number;
    if (request.query.chunk && typeof request.query.chunk === 'string') {
      chunk = parseInt(request.query.chunk, 10);
    } else {
      chunk = 10;
    }
    response.status(OK).send(sellerService.getCashHistory(chunk));
  };

export const registerSeller =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    const sellerName = request.body.name;
    const sellerUrl = request.body.url;
    const sellerPwd = request.body.password;

    if (!sellerName || !sellerUrl || !sellerPwd) {
      response
        .status(BAD_REQUEST)
        .send({ message: 'missing name, password or url' });
    } else if (sellerService.isAuthorized(sellerName, sellerPwd)) {
      sellerService.register(sellerUrl, sellerName, sellerPwd);
      response.status(OK).end();
    } else {
      response
        .status(UNAUTHORIZED)
        .send({ message: 'invalid name or password' });
    }
  };

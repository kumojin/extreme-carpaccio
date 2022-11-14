import { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { SellerService } from './services';
import { isValidUrl } from './utils';

export const listSellers =
  (sellerService: SellerService) => (_: Request, response: Response) => {
    const sellerViews = sellerService.allSellers().map((seller) => ({
      cash: seller.cash,
      name: seller.name,
      online: seller.online,
    }));
    response.status(StatusCodes.OK).send(sellerViews);
  };

export const sellersHistory =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    let chunk: number;
    if (request.query.chunk && typeof request.query.chunk === 'string') {
      chunk = parseInt(request.query.chunk, 10);
    } else {
      chunk = 10;
    }
    response.status(StatusCodes.OK).send(sellerService.getCashHistory(chunk));
  };

export const registerSeller =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    const {
      name: sellerName,
      url: sellerUrl,
      password: sellerPwd,
    } = request.body;

    if (!sellerName || !sellerUrl || !sellerPwd || !isValidUrl(sellerUrl)) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: 'missing name, password or url' });
    } else if (sellerService.isAuthorized(sellerName, sellerPwd)) {
      sellerService.register(sellerUrl, sellerName, sellerPwd);
      response.status(StatusCodes.OK).end();
    } else {
      response
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: 'invalid name or password' });
    }
  };

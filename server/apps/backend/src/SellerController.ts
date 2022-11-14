import { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
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

const sellersHistoryValidator = Joi.number().required();
export const sellersHistory =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    const { error, value } = sellersHistoryValidator.validate(
      request.query.chunk
    );
    const chunk = !error ? value : 10;
    response.status(StatusCodes.OK).send(sellerService.getCashHistory(chunk));
  };

type RegisterSellerRequest = {
  name: string;
  password: string;
  url: string;
};
const registerSellerValidator = Joi.object<RegisterSellerRequest>({
  name: Joi.string().required(),
  password: Joi.string().required(),
  url: Joi.custom((value) => {
    if (!isValidUrl(value)) {
      throw new Error('invalid URL');
    }
    return value;
  }).required(),
});
export const registerSeller =
  (sellerService: SellerService) => (request: Request, response: Response) => {
    const { error, value } = registerSellerValidator.validate(request.body);
    if (error) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: 'missing name, password or url' });
      return;
    }

    const { name: sellerName, url: sellerUrl, password: sellerPwd } = value;
    if (sellerService.isAuthorized(sellerName, sellerPwd)) {
      sellerService.register(sellerUrl, sellerName, sellerPwd);
      response.status(StatusCodes.OK).end();
    } else {
      response
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: 'invalid name or password' });
    }
  };

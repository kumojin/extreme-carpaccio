import { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { messageFromValidationError } from './error-utils';
import { SellerService } from './services';
import { isValidUrl } from './utils';

export const listSellers =
  (sellerService: SellerService) => async (_: Request, response: Response) => {
    const allSellers = await sellerService.allSellers();
    const sellerViews = allSellers.map((seller) => ({
      cash: seller.cash,
      name: seller.name,
      online: seller.online,
    }));
    response.status(StatusCodes.OK).send(sellerViews);
  };

const sellersHistoryValidator = Joi.number().required();
export const sellersHistory =
  (sellerService: SellerService) =>
  async (request: Request, response: Response) => {
    const { error, value } = sellersHistoryValidator.validate(
      request.query.chunk
    );
    const chunk = !error ? value : 10;
    const cashHistory = await sellerService.getCashHistory(chunk);
    response.status(StatusCodes.OK).send(cashHistory);
  };

export type MaybeRegisterSellerRequest = {
  name?: string;
  password?: string;
  url?: string;
};
export type RegisterSellerRequest = Required<MaybeRegisterSellerRequest>;
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
  (sellerService: SellerService) =>
  async (request: Request, response: Response) => {
    const { error, value } = registerSellerValidator.validate(request.body);
    if (error) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: messageFromValidationError(error) });
      return;
    }

    const { name: sellerName, url: sellerUrl, password: sellerPwd } = value;
    const isAuthorized = await sellerService.isAuthorized(
      sellerName,
      sellerPwd
    );
    if (!isAuthorized) {
      response
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: 'invalid name or password' });
      return;
    }

    await sellerService.register(sellerUrl, sellerName, sellerPwd);
    response.status(StatusCodes.OK).end();
  };

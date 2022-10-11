import express from 'express';
import { SellerService } from './services';

const routes = (sellerService: SellerService) => {
  const router = express.Router();
  const OK = 200;
  const BAD_REQUEST = 400;
  const UNAUTHORIZED = 401;

  router.get('/sellers', (_request, response) => {
    // seller view is returned, to prevent any confidential information leaks
    const sellerViews = sellerService.allSellers().map((seller) => ({
      cash: seller.cash,
      name: seller.name,
      online: seller.online,
    }));
    response.status(OK).send(sellerViews);
  });

  router.get('/sellers/history', (request, response) => {
    let chunk: number;
    if (request.query.chunk && typeof request.query.chunk === 'string') {
      chunk = parseInt(request.query.chunk, 10);
    } else {
      chunk = 10;
    }
    response.status(OK).send(sellerService.getCashHistory(chunk));
  });

  router.post('/seller', (request, response) => {
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
  });

  return router;
};
export default routes;

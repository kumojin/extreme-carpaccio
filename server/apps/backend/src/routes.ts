import express from 'express';
import {
  listSellers,
  registerSeller,
  sellersHistory,
} from './SellerController';
import { SellerService } from './services';

const routes = (sellerService: SellerService) => {
  const router = express.Router();

  router.get('/sellers', listSellers(sellerService));

  router.get('/sellers/history', sellersHistory(sellerService));

  router.post('/seller', registerSeller(sellerService));

  return router;
};
export default routes;

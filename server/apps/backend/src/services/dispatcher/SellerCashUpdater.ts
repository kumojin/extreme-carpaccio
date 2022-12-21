import { IncomingMessage } from 'node:http';
import colors from 'colors';
import { messageFromError } from '../../error-utils';
import logger from '../../logger';
import { Seller } from '../../repositories';
import utils from '../../utils';
import { Bill } from '../Bill';
import OrderService from '../OrderService';
import SellerService from '../SellerService';

class SellerCashUpdater {
  constructor(
    private readonly sellerService: SellerService,
    private readonly orderService: OrderService
  ) {}

  public doUpdate(
    seller: Seller,
    expectedBill: Bill,
    currentIteration: number
  ): (response: IncomingMessage) => Promise<void> {
    const self = this;
    return async (response: IncomingMessage) => {
      if (response.statusCode === 200) {
        await self.sellerService.setOnline(seller);

        response.on('error', (err) => {
          logger.error(err);
        });

        response.on('data', (sellerResponse) => {
          logger.info(
            colors.grey(`${seller.name} replied "${sellerResponse}"`)
          );

          try {
            const actualBill = utils.jsonify(sellerResponse);
            self.orderService.validateBill(actualBill);
            self.sellerService.updateCash(
              seller,
              expectedBill,
              actualBill,
              currentIteration
            );
          } catch (exception) {
            self.sellerService.notify(seller, {
              type: 'ERROR',
              content: messageFromError(exception),
            });
          }
        });
      } else if (response.statusCode === 404) {
        await self.sellerService.setOnline(seller);
        logger.info(
          colors.grey(`${seller.name} replied 404. Everything is fine.`)
        );
      } else {
        await self.sellerService.setOnline(seller);
        await self.sellerService.updateCash(
          seller,
          expectedBill,
          undefined,
          currentIteration
        );
      }
    };
  }
}
export default SellerCashUpdater;

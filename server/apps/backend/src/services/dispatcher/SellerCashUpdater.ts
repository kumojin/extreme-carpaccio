import type { IncomingMessage } from 'node:http';
import colors from 'colors';
import { messageFromError } from '../../error-utils';
import logger from '../../logger';
import type { Seller } from '../../repositories';
import utils from '../../utils';
import type { Bill } from '../Bill';
import type OrderService from '../OrderService';
import type SellerService from '../SellerService';

class SellerCashUpdater {
  constructor(
    private readonly sellerService: SellerService,
    private readonly orderService: OrderService,
  ) {}

  public doUpdate(
    seller: Seller,
    expectedBill: Bill,
    currentIteration: number,
  ): (response: IncomingMessage) => Promise<void> {
    return async (response: IncomingMessage) => {
      if (response.statusCode === 200) {
        await this.sellerService.setOnline(seller);

        response.on('error', (err) => {
          logger.error(err);
        });

        response.on('data', (sellerResponse) => {
          logger.info(colors.grey(`${seller.name} replied "${sellerResponse}"`));

          try {
            const actualBill = utils.jsonify(sellerResponse);
            this.orderService.validateBill(actualBill);
            this.sellerService.updateCash(seller, expectedBill, actualBill, currentIteration);
          } catch (exception) {
            this.sellerService.notify(seller, {
              type: 'ERROR',
              content: messageFromError(exception),
            });
          }
        });
      } else if (response.statusCode === 404) {
        await this.sellerService.setOnline(seller);
        logger.info(colors.grey(`${seller.name} replied 404. Everything is fine.`));
      } else {
        await this.sellerService.setOnline(seller);
        await this.sellerService.updateCash(seller, expectedBill, undefined, currentIteration);
      }
    };
  }
}
export default SellerCashUpdater;

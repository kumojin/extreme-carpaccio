import { IncomingMessage } from 'node:http';
import colors from 'colors';
import _ from 'lodash';
import Configuration, { BadRequestMode } from '../../config';
import logger from '../../logger';
import { Seller } from '../../repositories';
import { Bill } from '../Bill';
import { Order } from '../Order';
import SellerService from '../SellerService';

class BadRequest {
  constructor(private readonly configuration: Configuration) {}

  public shouldSendBadRequest(iteration: number) {
    const badRequestConfig = this.getConfiguration();
    return (
      !badRequestConfig ||
      (badRequestConfig.active &&
        badRequestConfig.period &&
        iteration % badRequestConfig.period === 0)
    );
  }

  public corruptOrder(order: Order) {
    const mode = _.sample(this.getConfiguration()?.modes);

    logger.info(colors.blue(`corrupt mode ${mode}`));
    let copy: Order;
    switch (mode) {
      case BadRequestMode.EMPTY_OBJECT:
        copy = {} as any;
        break;
      case BadRequestMode.ARRAY_BOOLEANS:
        copy = _.range(17).map((i) => i % 2 === 0) as any;
        break;
      case BadRequestMode.ERROR_QUANTITIES:
        copy = {
          ...order,
          quantities: { error: 'datacenter unreachable' },
        } as any;
        break;
      case BadRequestMode.MISSING_QUANTITIES:
        copy = {
          ...order,
          quantities: order.quantities.slice(1),
        };
        break;
      case BadRequestMode.MISSING_PRICES:
        copy = {
          ...order,
          prices: order.prices.slice(1),
        };
        break;
      case BadRequestMode.INVALID_COUNTRY:
        copy = {
          ...order,
          country: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
        };
        break;
      case BadRequestMode.NO_COUNTRY: {
        const { country, ...orderWithoutCountry } = order;
        copy = {
          ...orderWithoutCountry,
        } as any;
        break;
      }
      case BadRequestMode.NO_PRICES: {
        const { prices, ...orderWithoutPrices } = order;
        copy = {
          ...orderWithoutPrices,
        } as any;
        break;
      }
      case BadRequestMode.NO_QUANTITIES: {
        const { quantities, ...orderWithoutQuantities } = order;
        copy = {
          ...orderWithoutQuantities,
        } as any;
        break;
      }
      case BadRequestMode.NO_REDUCTION: {
        const { reduction, ...orderWithoutReduction } = order;
        copy = {
          ...orderWithoutReduction,
        } as any;
        break;
      }
      case BadRequestMode.NULL:
        copy = null as any;
        break;
      default:
        copy = {} as any;
        break;
    }

    return copy;
  }

  public updateSellersCash(
    sellerService: SellerService,
    seller: Seller,
    expectedBill: Bill,
    currentIteration: number
  ): (response: IncomingMessage) => Promise<void> {
    return async (response: IncomingMessage) => {
      const amount = expectedBill.total;
      let message;

      if (response.statusCode !== 400) {
        const loss = amount * 0.5;
        message = `Hey, ${seller.name} lose ${loss} because he/she does not know how to handle correctly a bad request`;
        await sellerService.deductCash(seller, loss, currentIteration);
        sellerService.notify(seller, { type: 'ERROR', content: message });
      } else {
        message = `Hey, ${seller.name} earned ${amount}`;
        await sellerService.addCash(seller, amount, currentIteration);
        sellerService.notify(seller, { type: 'INFO', content: message });
      }
    };
  }

  private getConfiguration() {
    return this.configuration.all().badRequest;
  }
}
export default BadRequest;

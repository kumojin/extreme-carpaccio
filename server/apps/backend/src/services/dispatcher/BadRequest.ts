import type { IncomingMessage } from 'node:http';
import Big from 'big.js';
import colors from 'colors';
import _ from 'lodash';
import type Configuration from '../../config';
import { BadRequestMode } from '../../config';
import logger from '../../logger';
import type { Seller } from '../../repositories';
import type { Bill } from '../Bill';
import type { Order } from '../Order';
import type SellerService from '../SellerService';

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

  public corruptOrder(order: Order): unknown {
    const mode = _.sample(this.getConfiguration()?.modes);

    logger.info(colors.blue(`corrupt mode ${mode}`));
    let copy: unknown;
    switch (mode) {
      case BadRequestMode.EMPTY_OBJECT:
        copy = {};
        break;
      case BadRequestMode.ARRAY_BOOLEANS:
        copy = _.range(17).map((i) => i % 2 === 0);
        break;
      case BadRequestMode.ERROR_QUANTITIES:
        copy = {
          ...order,
          quantities: { error: 'datacenter unreachable' },
        };
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
        };
        break;
      }
      case BadRequestMode.NO_PRICES: {
        const { prices, ...orderWithoutPrices } = order;
        copy = {
          ...orderWithoutPrices,
        };
        break;
      }
      case BadRequestMode.NO_QUANTITIES: {
        const { quantities, ...orderWithoutQuantities } = order;
        copy = {
          ...orderWithoutQuantities,
        };
        break;
      }
      case BadRequestMode.NO_REDUCTION: {
        const { reduction, ...orderWithoutReduction } = order;
        copy = {
          ...orderWithoutReduction,
        };
        break;
      }
      case BadRequestMode.NULL:
        copy = null;
        break;
      default:
        copy = {};
        break;
    }

    return copy;
  }

  public updateSellersCash(
    sellerService: SellerService,
    seller: Seller,
    expectedBill: Bill,
    currentIteration: number,
  ): (response: IncomingMessage) => Promise<void> {
    return async (response: IncomingMessage) => {
      const amount = expectedBill.total;
      let message: string;

      if (response.statusCode !== 400) {
        const loss = new Big(amount).times(0.5);
        message = `Hey, ${seller.name} lose ${loss} because he/she does not know how to handle correctly a bad request`;
        await sellerService.deductCash(seller, loss, currentIteration);
        sellerService.notify(seller, { type: 'ERROR', content: message });
      } else {
        message = `Hey, ${seller.name} earned ${amount}`;
        await sellerService.addCash(seller, new Big(amount), currentIteration);
        sellerService.notify(seller, { type: 'INFO', content: message });
      }
    };
  }

  private getConfiguration() {
    return this.configuration.all().badRequest;
  }
}
export default BadRequest;

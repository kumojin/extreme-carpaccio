import { IncomingMessage } from 'node:http';
import colors from 'colors';
import _ from 'lodash';
import Configuration from '../config';
import logger from '../logger';
import { Countries, Seller } from '../repositories';
import utils from '../utils';
import { isBill } from './Bill';
import { Order } from './Order';
import { Reduction } from './reduction';

export default class OrderService {
  private readonly countries: Countries;

  constructor(configuration: Configuration) {
    this.countries = new Countries(configuration);
  }

  public sendOrder(
    seller: Seller,
    order: Order,
    cashUpdater: (response: IncomingMessage) => Promise<void>,
    onError: () => void
  ) {
    logger.info(
      colors.grey(
        `Sending order ${utils.stringify(order)} to seller ${utils.stringify(
          seller
        )}`
      )
    );
    utils.post(seller.url, '/order', order, cashUpdater, onError);
  }

  public createOrder(reduction: Reduction): Order {
    const items = _.random(1, 10);
    const prices = new Array(items);
    const quantities = new Array(items);
    const country = this.countries.randomOne();

    for (let item = 0; item < items; item++) {
      const price = _.random(1, 100, true);
      prices[item] = utils.fixPrecision(price, 2);
      quantities[item] = _.random(1, 10);
    }

    return {
      prices,
      quantities,
      country,
      reduction: reduction.name,
    };
  }

  public bill(order: Order, reduction: Reduction) {
    const { prices, quantities } = order;
    let sum = quantities
      .map((quantity, i) => quantity * prices[i])
      .reduce((total, current) => total + current, 0);

    const taxRule = this.countries.taxRule(order.country);
    sum = taxRule.applyTax(sum);
    sum = reduction.apply(sum);
    return { total: utils.fixPrecision(sum, 2) };
  }

  public validateBill(bill: unknown) {
    if (!isBill(bill)) {
      throw new Error('The field "total" in the response is missing.');
    }

    if (!_.isNumber(bill.total)) {
      throw new Error('"Total" is not a number.');
    }
  }
}

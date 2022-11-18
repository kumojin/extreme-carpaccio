import { URL } from 'node:url';
import _ from 'lodash';
import Configuration from '../config';
import { Countries } from '../repositories';
import { buildWithDefaults } from '../repositories/Seller';
import utils from '../utils';
import OrderService from './OrderService';
import Reductions from './reduction';

describe('Order Service', () => {
  let orderService: OrderService;
  let configuration: Configuration;
  let countries: Countries;

  beforeEach(() => {
    configuration = new Configuration();
    orderService = new OrderService(configuration);
    countries = new Countries(configuration);
  });

  it('should send order to seller', () => {
    jest.spyOn(utils, 'post').mockImplementation(jest.fn());
    const order = {
      quantities: [1, 2, 3],
      prices: [12.1, 10, 11],
      country: 'CA',
      reduction: 'STANDARD',
    };
    const cashUpdater = () => {};
    const onError = () => {};

    const url = new URL('https://localhost:3000/test');
    orderService.sendOrder(
      buildWithDefaults({ url }),
      order,
      cashUpdater,
      onError
    );

    expect(utils.post).toHaveBeenCalledWith(
      url,
      '/order',
      order,
      cashUpdater,
      onError
    );
  });

  it('should create an order with maximum 10 items', () => {
    const order = orderService.createOrder(Reductions.STANDARD);

    expect(order.prices.length).toBeGreaterThan(0);
    expect(order.prices.length).not.toBeGreaterThan(10);
    expect(_.every(order.prices, Number)).toBeTruthy();
    expect(order.quantities.length).toBeGreaterThan(0);
    expect(order.quantities.length).not.toBeGreaterThan(10);
    expect(_.every(order.quantities, Number)).toBeTruthy();
  });

  it('should create orders with countries of Europe', () => {
    const order = orderService.createOrder(Reductions.STANDARD);

    expect(countries.fromEurope).toContain(order.country);
  });

  it('should create orders using specific reduction type', () => {
    expect(orderService.createOrder(Reductions.STANDARD).reduction).toContain(
      Reductions.STANDARD.name
    );
    expect(
      orderService.createOrder(Reductions.PAY_THE_PRICE).reduction
    ).toContain(Reductions.PAY_THE_PRICE.name);
    expect(orderService.createOrder(Reductions.HALF_PRICE).reduction).toContain(
      Reductions.HALF_PRICE.name
    );
  });

  it('should calculate the sum of the order using PAY_THE_PRICE reduction', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const order = {
      prices: [1000, 50],
      quantities: [1, 2],
      country: 'IT',
      reduction: 'PAY THE PRICE',
    };

    const bill = orderService.bill(order, Reductions.PAY_THE_PRICE);

    expect(bill).toEqual({
      total: countries.taxRule('IT').applyTax(1000 + 2 * 50),
    });
  });

  it('should calculate the sum of the order using STANDARD reduction', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const order = {
      prices: [1000, 50],
      quantities: [1, 2],
      country: 'IT',
      reduction: 'STANDARD',
    };

    const bill = orderService.bill(order, Reductions.STANDARD);

    expect(bill).toEqual({
      total: countries.taxRule('IT').applyTax(1000 + 2 * 50) * (1 - 0.03),
    });
  });

  it('should calculate the sum of the order using HALF_PRICE reduction', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const order = {
      prices: [1000, 50],
      quantities: [1, 2],
      country: 'IT',
      reduction: 'HALF PRICE',
    };

    const bill = orderService.bill(order, Reductions.HALF_PRICE);

    expect(bill).toEqual({
      total: countries.taxRule('IT').applyTax(1000 + 2 * 50) / 2,
    });
  });

  it('should not validate bill when total field is missing', () => {
    expect(() => {
      orderService.validateBill({});
    }).toThrow('The field "total" in the response is missing.');
  });

  it('should not validate bill when total is not a number', () => {
    expect(() => {
      orderService.validateBill({ total: 'NaN' });
    }).toThrow('"Total" is not a number.');
  });
});

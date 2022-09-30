import { IncomingMessage } from 'node:http';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Configuration from '../../config';
import { Sellers } from '../../repositories';
import OrderService from '../OrderService';
import SellerService from '../SellerService';
import SellerCashUpdater from './SellerCashUpdater';

describe("Seller's cash updater", () => {
  let sellerCashUpdater: SellerCashUpdater;
  let configuration: Configuration;
  let sellerService: SellerService;
  let orderService: OrderService;

  beforeEach(() => {
    configuration = new Configuration();
    sellerService = new SellerService(new Sellers(), configuration);
    orderService = new OrderService(configuration);
    sellerCashUpdater = new SellerCashUpdater(sellerService, orderService);
  });

  it("should deduct a penalty when the sellers's response is neither 200 nor 404", () => {
    const bob = {
      name: 'bob',
      hostname: 'seller',
      port: '8081',
      path: '/',
      cash: 0,
    };
    jest.spyOn(sellerService, 'setOnline').mockImplementation(jest.fn());
    jest.spyOn(sellerService, 'updateCash').mockImplementation(jest.fn());

    sellerCashUpdater.doUpdate(
      bob,
      { total: 100 },
      -1
    )({ statusCode: 400 } as IncomingMessage);

    expect(sellerService.updateCash).toHaveBeenCalledWith(
      bob,
      { total: 100 },
      undefined,
      -1
    );
  });

  it("should NOT deduct a penalty when the sellers's response is 404", () => {
    const bob = {
      name: 'bob',
      hostname: 'seller',
      port: '8081',
      path: '/',
      cash: 0,
    };
    jest.spyOn(sellerService, 'setOnline').mockImplementation(jest.fn());
    jest.spyOn(sellerService, 'updateCash').mockImplementation(jest.fn());

    sellerCashUpdater.doUpdate(
      bob,
      { total: 100 },
      -1
    )({ statusCode: 404 } as IncomingMessage);

    expect(sellerService.updateCash).not.toHaveBeenCalled();
  });
});

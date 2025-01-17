import type { IncomingMessage } from 'node:http';
import Configuration from '../../config';
import { buildWithDefaults } from '../../fixtures';
import { Sellers } from '../../repositories';
import OrderService from '../OrderService';
import SellerService from '../SellerService';
import SellerCashUpdater from './SellerCashUpdater';

describe("Seller's cash updater", () => {
  let sellerCashUpdater: SellerCashUpdater;
  let configuration: Configuration;
  let sellerService: SellerService;
  let orderService: OrderService;

  beforeEach(async () => {
    configuration = new Configuration();
    const sellers = await Sellers.create(true);
    sellerService = new SellerService(sellers, configuration);
    orderService = new OrderService(configuration);
    sellerCashUpdater = new SellerCashUpdater(sellerService, orderService);
  });

  it("should deduct a penalty when the sellers's response is neither 200 nor 404", async () => {
    const bob = buildWithDefaults({
      name: 'bob',
    });
    vi.spyOn(sellerService, 'setOnline').mockImplementation(vi.fn());
    vi.spyOn(sellerService, 'updateCash').mockImplementation(vi.fn());

    await sellerCashUpdater.doUpdate(
      bob,
      { total: 100 },
      -1,
    )({ statusCode: 400 } as IncomingMessage);

    expect(sellerService.updateCash).toHaveBeenCalledWith(
      bob,
      { total: 100 },
      undefined,
      -1,
    );
  });

  it("should NOT deduct a penalty when the sellers's response is 404", () => {
    const bob = buildWithDefaults({
      name: 'bob',
    });
    vi.spyOn(sellerService, 'setOnline').mockImplementation(vi.fn());
    vi.spyOn(sellerService, 'updateCash').mockImplementation(vi.fn());

    sellerCashUpdater.doUpdate(
      bob,
      { total: 100 },
      -1,
    )({ statusCode: 404 } as IncomingMessage);

    expect(sellerService.updateCash).not.toHaveBeenCalled();
  });
});

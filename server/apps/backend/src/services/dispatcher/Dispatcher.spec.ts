import Configuration from '../../config';
import { buildWithDefaults } from '../../fixtures';
import { Sellers } from '../../repositories';
import OrderService from '../OrderService';
import Reductions from '../reduction';
import SellerService from '../SellerService';
import Dispatcher from './Dispatcher';

vi.useFakeTimers();

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;
  let orderService: OrderService;
  let sellerService: SellerService;
  let configuration: Configuration;

  beforeEach(async () => {
    configuration = new Configuration();
    const sellers = await Sellers.create(true);
    sellerService = new SellerService(sellers, configuration);
    orderService = new OrderService(configuration);
    dispatcher = new Dispatcher(sellerService, orderService, configuration);
  });

  it('should not send request to sellers when active config is set to false', async () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      reduction: 'STANDARD',
      badRequest: {
        active: true,
        period: 2,
      },
      active: false,
    });
    vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

    const nextIteration = await dispatcher.startBuying(1);
    expect(nextIteration).toEqual(1);
    expect(dispatcher.sendOrderToSellers).not.toHaveBeenCalled();
  });

  describe('when loading configuration for reductions', () => {
    it('should send the specified reduction when it is a string', () => {
      vi.spyOn(configuration, 'all').mockReturnValue({
        reduction: 'HALF PRICE',
        badRequest: {
          active: false,
        },
        active: true,
      });
      vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

      dispatcher.startBuying(1);

      expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
        Reductions.HALF_PRICE,
        1,
        false,
      );
    });
    it('should send one of the reduction strategies when using an array', () => {
      vi.spyOn(configuration, 'all').mockReturnValue({
        reduction: ['PAY THE PRICE'],
        badRequest: {
          active: false,
        },
        active: true,
      });
      vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

      dispatcher.startBuying(1);

      expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
        Reductions.PAY_THE_PRICE,
        1,
        false,
      );
    });
    it('should create a weighted array of reduction strategies when using a weight', () => {
      const reductionStrategy = [
        { reduction: 'PAY THE PRICE', weight: 0.03 },
        { reduction: 'STANDARD', weight: 0.01 },
      ];
      const weightedArray = [
        'PAY THE PRICE',
        'PAY THE PRICE',
        'PAY THE PRICE',
        'STANDARD',
      ];
      const returnedArray = dispatcher.getWeightedReduction(reductionStrategy);

      expect(returnedArray).toEqual(weightedArray);
    });
    it('should send one of the reduction strategies when using a weight', () => {
      vi.spyOn(configuration, 'all').mockReturnValue({
        reduction: [{ reduction: 'PAY THE PRICE', weight: 0.1 }],
        badRequest: {
          active: false,
        },
        active: true,
      });
      vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

      dispatcher.startBuying(1);

      expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
        Reductions.PAY_THE_PRICE,
        1,
        false,
      );
    });
    it('should send the STANDARD strategy when it does not recognize the strategy passed in config', () => {
      vi.spyOn(configuration, 'all').mockReturnValue({
        reduction: 'UNKNOWN STRATEGY',
        badRequest: {
          active: false,
        },
        active: true,
      });
      vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

      dispatcher.startBuying(1);

      expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
        Reductions.STANDARD,
        1,
        false,
      );
    });
    it('should send the STANDARD strategy when the provided strategy is undefined', () => {
      vi.spyOn(configuration, 'all').mockReturnValue({
        reduction: undefined,
        badRequest: {
          active: false,
        },
        active: true,
      });
      vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

      dispatcher.startBuying(1);

      expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
        Reductions.STANDARD,
        1,
        false,
      );
    });
  });

  it('should broadcast a bad request', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      reduction: 'HALF PRICE',
      badRequest: {
        active: true,
        period: 2,
      },
      active: true,
    });
    vi.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(vi.fn());

    dispatcher.startBuying(2);

    expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
      Reductions.HALF_PRICE,
      2,
      true,
    );
  });

  it('should send the same order to each seller using reduction', async () => {
    vi.spyOn(configuration, 'all').mockReturnValue({});
    const alice = buildWithDefaults({
      name: 'alice',
    });
    const bob = buildWithDefaults({
      name: 'bob',
    });
    vi.spyOn(sellerService, 'addCash').mockImplementation(vi.fn());
    vi.spyOn(sellerService, 'allSellers').mockResolvedValue([alice, bob]);
    const order = {
      prices: [100, 50],
      quantities: [1, 2],
      country: 'IT',
      reduction: 'STANDARD',
    };
    vi.spyOn(orderService, 'createOrder').mockReturnValue(order);
    vi.spyOn(orderService, 'sendOrder').mockImplementation(vi.fn());

    await dispatcher.sendOrderToSellers(Reductions.STANDARD, 0, false);

    expect(orderService.createOrder).toHaveBeenCalledWith(Reductions.STANDARD);
    expect(orderService.sendOrder).toHaveBeenCalledWith(
      alice,
      order,
      expect.any(Function),
      expect.any(Function),
    );
    expect(orderService.sendOrder).toHaveBeenCalledWith(
      bob,
      order,
      expect.any(Function),
      expect.any(Function),
    );
  });
});

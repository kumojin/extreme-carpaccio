import Configuration from '../../config';
import { Sellers } from '../../repositories';
import OrderService from '../OrderService';
import Reductions from '../reduction';
import SellerService from '../SellerService';
import Dispatcher from './Dispatcher';

jest.useFakeTimers();

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;
  let orderService: OrderService;
  let sellerService: SellerService;
  let configuration: Configuration;

  beforeEach(() => {
    configuration = new Configuration();
    sellerService = new SellerService(new Sellers(), configuration);
    orderService = new OrderService(configuration);
    dispatcher = new Dispatcher(sellerService, orderService, configuration);
  });

  it('should not send request to sellers when active config is set to false', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      reduction: 'STANDARD',
      badRequest: {
        active: true,
        period: 2,
      },
      active: false,
    });
    jest.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(jest.fn());

    expect(dispatcher.startBuying(1)).toEqual(1);
    expect(dispatcher.sendOrderToSellers).not.toHaveBeenCalled();
  });

  it('should load configuration for reductions', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      reduction: 'HALF PRICE',
      badRequest: {
        active: false,
      },
      active: true,
    });
    jest.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(jest.fn());

    dispatcher.startBuying(1);

    expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
      Reductions.HALF_PRICE,
      1,
      false
    );
  });

  it('should broadcast a bad request', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      reduction: 'HALF PRICE',
      badRequest: {
        active: true,
        period: 2,
      },
      active: true,
    });
    jest.spyOn(dispatcher, 'sendOrderToSellers').mockImplementation(jest.fn());

    dispatcher.startBuying(2);

    expect(dispatcher.sendOrderToSellers).toHaveBeenCalledWith(
      Reductions.HALF_PRICE,
      2,
      true
    );
  });

  it('should send the same order to each seller using reduction', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const alice = {
      name: 'alice',
      hostname: 'seller',
      port: '8080',
      path: '/',
      cash: 0,
    };
    const bob = {
      name: 'bob',
      hostname: 'seller',
      port: '8081',
      path: '/',
      cash: 0,
    };
    jest.spyOn(sellerService, 'addCash').mockImplementation(jest.fn());
    jest.spyOn(sellerService, 'allSellers').mockReturnValue([alice, bob]);
    const order = {
      prices: [100, 50],
      quantities: [1, 2],
      country: 'IT',
      reduction: 'STANDARD',
    };
    jest.spyOn(orderService, 'createOrder').mockReturnValue(order);
    jest.spyOn(orderService, 'sendOrder').mockImplementation(jest.fn());

    dispatcher.sendOrderToSellers(Reductions.STANDARD, 0, false);

    expect(orderService.createOrder).toHaveBeenCalledWith(Reductions.STANDARD);
    expect(orderService.sendOrder).toHaveBeenCalledWith(
      alice,
      order,
      expect.any(Function),
      expect.any(Function)
    );
    expect(orderService.sendOrder).toHaveBeenCalledWith(
      bob,
      order,
      expect.any(Function),
      expect.any(Function)
    );
  });
});

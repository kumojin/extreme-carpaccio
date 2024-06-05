import type { IncomingMessage } from 'node:http';
import Big from 'big.js';
import Configuration, { BadRequestMode } from '../../config';
import { buildWithDefaults } from '../../fixtures';
import { Sellers } from '../../repositories';
import SellerService from '../SellerService';
import BadRequest from './BadRequest';

describe('BadRequest', () => {
  let badRequest: BadRequest;
  let sellerService: SellerService;
  let sellers: Sellers;
  let configuration: Configuration;

  beforeEach(async () => {
    configuration = new Configuration();
    sellers = await Sellers.create(true);
    sellerService = new SellerService(sellers, configuration);
    badRequest = new BadRequest(configuration);
  });

  it('should suggest bad request periodically', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      badRequest: {
        active: true,
        period: 3,
        modes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
    });

    expect(badRequest.shouldSendBadRequest(1)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(2)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(3)).toEqual(true);
    expect(badRequest.shouldSendBadRequest(4)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(6)).toEqual(true);
    expect(badRequest.shouldSendBadRequest(7)).toEqual(false);
  });

  it('should not suggest bad request if not activated', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      badRequest: {
        active: false,
        period: 3,
        modes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
    });

    expect(badRequest.shouldSendBadRequest(1)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(2)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(3)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(4)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(6)).toEqual(false);
    expect(badRequest.shouldSendBadRequest(7)).toEqual(false);
  });

  it.each([
    BadRequestMode.EMPTY_OBJECT,
    BadRequestMode.ARRAY_BOOLEANS,
    BadRequestMode.ERROR_QUANTITIES,
    BadRequestMode.MISSING_QUANTITIES,
    BadRequestMode.MISSING_PRICES,
    BadRequestMode.INVALID_COUNTRY,
    BadRequestMode.NO_COUNTRY,
    BadRequestMode.NO_PRICES,
    BadRequestMode.NO_QUANTITIES,
    BadRequestMode.NO_REDUCTION,
    BadRequestMode.NULL,
  ])('should corrupt order using mode %s', (mode) => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      badRequest: {
        modes: [mode],
      },
    });

    const order = {
      prices: [64.73, 29.48, 73.49, 58.88, 46.61, 65.4, 16.23],
      quantities: [8, 3, 10, 6, 5, 9, 5],
      country: 'FR',
      reduction: 'STANDARD',
    };

    const corrupted = badRequest.corruptOrder(order);

    expect(corrupted).not.toEqual(order);
  });

  it('should deduct cash if response status is not "bad request"', () => {
    const seller = buildWithDefaults({ name: 'alice', cash: 200 });
    const expectedBill = { total: 47 };
    const currentIteration = 17;
    jest.spyOn(sellerService, 'deductCash').mockImplementation(jest.fn());
    jest.spyOn(sellerService, 'notify').mockImplementation(jest.fn());

    const fun = badRequest.updateSellersCash(
      sellerService,
      seller,
      expectedBill,
      currentIteration,
    );

    fun({ statusCode: 200 } as IncomingMessage);

    expect(sellerService.deductCash).toHaveBeenCalledWith(
      seller,
      new Big(23.5),
      currentIteration,
    );
  });

  it('should add cash if response status is "bad request"', () => {
    const seller = buildWithDefaults({ name: 'alice', cash: 200 });
    const expectedBill = { total: 47 };
    const currentIteration = 17;
    jest.spyOn(sellerService, 'addCash').mockImplementation(jest.fn());
    jest.spyOn(sellerService, 'notify').mockImplementation(jest.fn());

    const fun = badRequest.updateSellersCash(
      sellerService,
      seller,
      expectedBill,
      currentIteration,
    );

    fun({ statusCode: 400 } as IncomingMessage);

    expect(sellerService.addCash).toHaveBeenCalledWith(
      seller,
      new Big(47),
      currentIteration,
    );
  });
});

import { URL } from 'node:url';
import argon2 from 'argon2';
import Configuration, { type Settings } from '../config';
import { buildWithDefaults } from '../fixtures';
import { Sellers } from '../repositories';
import utils from '../utils';
import SellerService from './SellerService';

describe('Seller Service', () => {
  let sellersRepository: Sellers;
  let sellerService: SellerService;
  let configurationData: Settings;

  beforeEach(async () => {
    jest.spyOn(utils, 'post').mockImplementation(jest.fn());
    sellersRepository = await Sellers.create(true);

    configurationData = { cashFreeze: false } as Settings;
    const configuration = new Configuration();
    jest.spyOn(configuration, 'all').mockReturnValue(configurationData);

    sellerService = new SellerService(sellersRepository, configuration);
  });

  it('should register new seller', async () => {
    await sellerService.register(
      'http://localhost:3000/path',
      'bob',
      'password',
    );
    const sellers = await sellerService.allSellers();
    expect(sellers.length).toBe(1);
    const actual = sellers.shift();
    expect(actual?.name).toBe('bob');
    expect(actual?.cash).toBe(0);
    expect(actual?.online).toBe(false);
    expect(actual?.url.toString()).toBe('http://localhost:3000/path');
  });

  it("should compute seller's cash based on the order's amount", async () => {
    const alice = buildWithDefaults({ name: 'alice', cash: 0 });
    await sellersRepository.save(alice);

    await sellerService.updateCash(alice, { total: 100 }, { total: 100 }, 0);

    const allSellers = await sellerService.allSellers();
    expect(allSellers).toContainEqual(
      expect.objectContaining({
        name: 'alice',
        cash: 100,
      }),
    );
  });

  it("should deduct 50% of the bill amount from seller's cash when the seller's bill is missing", async () => {
    const alice = buildWithDefaults({ name: 'alice', cash: 0 });
    await sellersRepository.save(alice);

    await sellerService.updateCash(alice, { total: 100 }, undefined, 0);

    const allSellers = await sellerService.allSellers();
    expect(allSellers).toContainEqual(
      expect.objectContaining({
        name: 'alice',
        cash: -50,
      }),
    );
  });

  it("should deduct 50% of the bill amount from seller's cash when the seller's bill does not correspond with the expected one", async () => {
    const alice = buildWithDefaults({ name: 'alice', cash: 0 });
    await sellersRepository.save(alice);

    await sellerService.updateCash(alice, { total: 100 }, { total: 50 }, 0);

    const allSellers = await sellerService.allSellers();
    expect(allSellers).toContainEqual(
      expect.objectContaining({
        name: 'alice',
        cash: -50,
      }),
    );
  });

  it('should not update cash if the cash update is frozen', () => {
    configurationData.cashFreeze = true;
    const alice = buildWithDefaults({ name: 'alice', cash: 0 });
    sellersRepository.save(alice);

    sellerService.updateCash(alice, { total: 100 }, { total: 100 }, 0);

    expect(sellerService.allSellers()).not.toContainEqual({
      name: 'alice',
      cash: 100,
    });
  });

  it('should deduct a penalty when a seller is offline', async () => {
    const alice = buildWithDefaults({ name: 'alice', cash: 200, online: true });
    const offlinePenalty = 100;
    await sellersRepository.save(alice);

    await sellerService.setOffline(alice, offlinePenalty, 0);

    const allSellers = await sellerService.allSellers();
    expect(allSellers).toContainEqual(
      expect.objectContaining({
        name: 'alice',
        cash: 100,
        online: false,
      }),
    );
  });

  it("should compare seller's response with expected one using precision 2", async () => {
    const alice = buildWithDefaults({ name: 'alice', cash: 0 });
    await sellersRepository.save(alice);

    await sellerService.updateCash(
      alice,
      { total: 100.12345 },
      { total: 100.12 },
      0,
    );

    const allSellers = await sellerService.allSellers();
    expect(allSellers).toContainEqual(
      expect.objectContaining({
        name: 'alice',
        cash: 100.12,
      }),
    );
  });

  it('should send notification to seller', () => {
    const message = { type: 'INFO' as const, content: 'test' };

    const url = new URL('https://localhost:3000/path');
    const bob = buildWithDefaults({
      name: 'bob',
      url,
      cash: 0,
      online: false,
    });
    sellerService.notify(bob, message);

    expect(utils.post).toHaveBeenCalledWith(url, '/feedback', message);
  });

  it("should get seller's cash history reduced in chunks of N iterations", async () => {
    jest
      .spyOn(sellersRepository, 'getCashHistory')
      .mockResolvedValue({ bob: [0, 0, 10, 10, 10] });

    const cashHistory = await sellerService.getCashHistory(5);

    expect(cashHistory).toEqual({ history: { bob: [10] }, lastIteration: 5 });
  });

  it("should get seller's cash history reduced in chunks of N iterations and add remaining iterations when last chunk is not completed", async () => {
    jest
      .spyOn(sellersRepository, 'getCashHistory')
      .mockResolvedValue({ bob: [0, 0, 10, 10, 10, 10, 10] });

    const cashHistory = await sellerService.getCashHistory(3);

    expect(cashHistory).toEqual({
      history: { bob: [10, 10, 10] },
      lastIteration: 7,
    });
  });

  it('should authorized unknown seller', async () => {
    const isAuthorized = await sellerService.isAuthorized('carmen', 'mccallum');
    expect(isAuthorized).toEqual(true);
  });

  it('should authorized seller if the same username and password are provided', async () => {
    const travis = buildWithDefaults({
      name: 'travis',
      password: await argon2.hash('pacman'),
      cash: 0,
    });
    await sellersRepository.save(travis);

    const isAuthorizedWhenValidPassword = await sellerService.isAuthorized(
      'travis',
      'pacman',
    );
    expect(isAuthorizedWhenValidPassword).toEqual(true);

    const isAuthorizedWhenInvalidPassword = await sellerService.isAuthorized(
      'travis',
      'vlad',
    );
    expect(isAuthorizedWhenInvalidPassword).toEqual(false);
  });
});

import { URL } from 'node:url';
import Big from 'big.js';
import { buildWithDefaults } from '../fixtures';
import Sellers from './Sellers';

describe('Sellers', () => {
  let sellers: Sellers;

  beforeEach(async () => {
    sellers = await Sellers.create(true);
  });

  it('should return all sellers sorted by cash in decreasing order', async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    await sellers.save(bob);
    const alice = buildWithDefaults({
      name: 'alice',
      cash: 10.0,
    });
    await sellers.save(alice);
    const carol = buildWithDefaults({
      name: 'carol',
      cash: 5.0,
    });
    await sellers.save(carol);

    const allSellers = await sellers.all();
    expect(allSellers[0]).toEqual(alice);
    expect(allSellers[1]).toEqual(carol);
    expect(allSellers[2]).toEqual(bob);
  });

  it('should add sellers', async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    await sellers.save(bob);

    const allSellers = await sellers.all();
    expect(allSellers).toContainEqual(bob);
  });

  it('should update sellers data and preserve cash & cash history', async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
      url: new URL('http://192.168.0.1:8080'),
    });
    await sellers.save(bob);
    await sellers.updateCash(bob.name, new Big(42), 1);

    const newBob = buildWithDefaults({
      name: bob.name,
      url: new URL('https://192.168.0.1:3000'),
    });
    await sellers.save(newBob);

    const allSellers = await sellers.all();
    expect(allSellers.length).toBe(1);
    const updatedBob = await sellers.get(bob.name);
    expect(updatedBob?.url.toString()).toEqual('https://192.168.0.1:3000/');
    expect(updatedBob?.cash).toBe(42);

    const cashHistory = await sellers.getCashHistory();
    expect(cashHistory).toEqual({ bob: [0, 42] });
  });

  it("should update seller's cash", async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.1,
    });
    await sellers.save(bob);

    await sellers.updateCash('bob', new Big(0.2), 0);

    const newBob = await sellers.get('bob');
    expect(newBob?.cash).toBe(0.3);
  });

  it('should track cash evolution on cash update by iteration', async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    await sellers.save(bob);

    await sellers.updateCash('bob', new Big(100), 0);

    const cashHistory = await sellers.getCashHistory();
    expect(cashHistory).toEqual({ bob: [100] });
  });

  it('should track cash evolution on cash update by iteration and fill missing iterations with last value', async () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    await sellers.save(bob);

    await sellers.updateCash('bob', new Big(100), 3);
    await sellers.updateCash('bob', new Big(100), 4);

    const cashHistory = await sellers.getCashHistory();
    expect(cashHistory).toEqual({ bob: [0, 0, 0, 100, 200] });
  });
});

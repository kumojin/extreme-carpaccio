import { URL } from "node:url";
import { buildWithDefaults } from './Seller';
import Sellers from './Sellers';

describe('Sellers', () => {
  let sellers: Sellers;

  beforeEach(() => {
    sellers = new Sellers();
  });

  it('should return all sellers sorted by cash in decreasing order', () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);
    const alice = buildWithDefaults({
      name: 'alice',
      cash: 10.0,
    });
    sellers.save(alice);
    const carol = buildWithDefaults({
      name: 'carol',
      cash: 5.0,
    });
    sellers.save(carol);

    expect(sellers.all()[0]).toEqual(alice);
    expect(sellers.all()[1]).toEqual(carol);
    expect(sellers.all()[2]).toEqual(bob);
  });

  it('should add sellers', () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    expect(sellers.all()).toContain(bob);
  });

  it('should update sellers data and preserve cash & cash history', () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
      url: new URL('http://192.168.0.1:8080'),
    });
    sellers.save(bob);
    sellers.updateCash(bob.name, 42, 1);

    const newBob = buildWithDefaults({
      name: bob.name,
      url: new URL('https://192.168.0.1:3000'),
    });
    sellers.save(newBob);

    expect(sellers.all().length).toBe(1);
    const updatedBob = sellers.get(bob.name);
    expect(updatedBob.url.toString()).toEqual('https://192.168.0.1:3000/');
    expect(updatedBob.cash).toBe(42);
    expect(sellers.cashHistory).toEqual({ bob: [0, 42] });
  });

  it('should count sellers', () => {
    expect(sellers.count()).toBe(0);

    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    expect(sellers.count()).toBe(1);
  });

  it('should say when there are sellers or not', () => {
    expect(sellers.isEmpty()).toBeTruthy();

    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    expect(sellers.isEmpty()).toBeFalsy();
  });

  it("should update seller's cash", () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    sellers.updateCash('bob', 100, 0);

    expect(sellers.get('bob').cash).toBe(100);
  });

  it('should track cash evolution on cash update by iteration', () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    sellers.updateCash('bob', 100, 0);

    expect(sellers.cashHistory).toEqual({ bob: [100] });
  });

  it('should track cash evolution on cash update by iteration and fill missing iterations with last value', () => {
    const bob = buildWithDefaults({
      name: 'bob',
      cash: 0.0,
    });
    sellers.save(bob);

    sellers.updateCash('bob', 100, 3);
    sellers.updateCash('bob', 100, 4);

    expect(sellers.cashHistory).toEqual({ bob: [0, 0, 0, 100, 200] });
  });
});

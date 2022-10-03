import { Seller, buildWithDefaults } from './Seller';
import Sellers from './Sellers';

describe('Sellers', () => {
  let bob: Seller;
  let sellers: Sellers;

  beforeEach(() => {
    bob = {
      name: 'bob',
      hostname: 'hostname',
      port: '3000',
      path: '/path',
      cash: 0.0,
    };
    sellers = new Sellers();
  });

  it('should return all sellers sorted by cash in decreasing order', () => {
    sellers.save(bob);
    const alice = {
      name: 'alice',
      hostname: 'hostname',
      port: '3001',
      path: '/path',
      cash: 10.0,
    };
    sellers.save(alice);
    const carol = {
      name: 'carol',
      hostname: 'hostname',
      port: '3002',
      path: '/path',
      cash: 5.0,
    };
    sellers.save(carol);

    expect(sellers.all()[0]).toEqual(alice);
    expect(sellers.all()[1]).toEqual(carol);
    expect(sellers.all()[2]).toEqual(bob);
  });

  it('should add sellers', () => {
    sellers.save(bob);

    expect(sellers.all()).toContain(bob);
  });

  it('should update sellers data and preserve cash & cash history', () => {
    sellers.save(bob);
    sellers.updateCash(bob.name, 42, 1);

    const newBob = buildWithDefaults({
      name: bob.name,
      hostname: 'new hostname',
    });
    sellers.save(newBob);

    expect(sellers.all().length).toBe(1);
    const updatedBob = sellers.get(bob.name);
    expect(updatedBob.hostname).toEqual('new hostname');
    expect(updatedBob.cash).toBe(42);
    expect(sellers.cashHistory).toEqual({ bob: [0, 42] });
  });

  it('should count sellers', () => {
    expect(sellers.count()).toBe(0);

    sellers.save(bob);

    expect(sellers.count()).toBe(1);
  });

  it('should say when there are sellers or not', () => {
    expect(sellers.isEmpty()).toBeTruthy();

    sellers.save(bob);

    expect(sellers.isEmpty()).toBeFalsy();
  });

  it("should update seller's cash", () => {
    sellers.save(bob);

    sellers.updateCash('bob', 100, 0);

    expect(sellers.get('bob').cash).toBe(100);
  });

  it('should track cash evolution on cash update by iteration', () => {
    sellers.save(bob);

    sellers.updateCash('bob', 100, 0);

    expect(sellers.cashHistory).toEqual({ bob: [100] });
  });

  it('should track cash evolution on cash update by iteration and fill missing iterations with last value', () => {
    sellers.save(bob);

    sellers.updateCash('bob', 100, 3);
    sellers.updateCash('bob', 100, 4);

    expect(sellers.cashHistory).toEqual({ bob: [0, 0, 0, 100, 200] });
  });
});

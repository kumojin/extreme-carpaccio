import Big from 'big.js';
import _ from 'lodash';
import Configuration from '../config';
import Countries from './Countries';

describe('Countries', () => {
  let countries: Countries;
  let configuration: Configuration;

  beforeEach(() => {
    configuration = new Configuration();
    countries = new Countries(configuration);
  });

  it('should get the corresponding tax for a given country', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({});
    expect(countries.taxRule('DE').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('UK').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('FR').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('IT').applyTax(new Big(1))).toStrictEqual(new Big(1.25));
    expect(countries.taxRule('ES').applyTax(new Big(1))).toStrictEqual(new Big(1.19));
    expect(countries.taxRule('PL').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('RO').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('NL').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('BE').applyTax(new Big(1))).toStrictEqual(new Big(1.24));
    expect(countries.taxRule('EL').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('CZ').applyTax(new Big(1))).toStrictEqual(new Big(1.19));
    expect(countries.taxRule('PT').applyTax(new Big(1))).toStrictEqual(new Big(1.23));
    expect(countries.taxRule('HU').applyTax(new Big(1))).toStrictEqual(new Big(1.27));
    expect(countries.taxRule('SE').applyTax(new Big(1))).toStrictEqual(new Big(1.23));
    expect(countries.taxRule('AT').applyTax(new Big(1))).toStrictEqual(new Big(1.22));
    expect(countries.taxRule('BG').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('DK').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('FI').applyTax(new Big(1))).toStrictEqual(new Big(1.17));
    expect(countries.taxRule('SK').applyTax(new Big(1))).toStrictEqual(new Big(1.18));
    expect(countries.taxRule('IE').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('HR').applyTax(new Big(1))).toStrictEqual(new Big(1.23));
    expect(countries.taxRule('LT').applyTax(new Big(1))).toStrictEqual(new Big(1.23));
    expect(countries.taxRule('SI').applyTax(new Big(1))).toStrictEqual(new Big(1.24));
    expect(countries.taxRule('LV').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
    expect(countries.taxRule('EE').applyTax(new Big(1))).toStrictEqual(new Big(1.22));
    expect(countries.taxRule('CY').applyTax(new Big(1))).toStrictEqual(new Big(1.21));
    expect(countries.taxRule('LU').applyTax(new Big(1))).toStrictEqual(new Big(1.25));
    expect(countries.taxRule('MT').applyTax(new Big(1))).toStrictEqual(new Big(1.2));
  });

  it('should get the updated tax for a given country', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({});
    const newTaxRule = (total: number) => {
      if (total > 100) return total * 1.2;
      return total * 1.2 + 100;
    };
    countries.updateTax('FR', newTaxRule);

    const newTax = countries.taxRule('FR');

    expect(newTax.applyTax(new Big(100))).toStrictEqual(new Big(100).times(1.2).add(100));
    expect(newTax.applyTax(new Big(150))).toStrictEqual(new Big(150).times(1.2));
  });

  it('should return random country according to its frequency', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({});
    const mostImportantPopulation = 200000;
    const samples = _.times(mostImportantPopulation * 10, countries.randomOne);

    const occurrences = _.groupBy(samples);

    expect(occurrences.FR.length).toBeGreaterThan(151381);
    expect(occurrences.UK.length).toBeGreaterThan(152741);
    expect(occurrences.LT.length).toBeLessThan(6844 * 10);
    expect(occurrences.NL.length).toBeLessThan(39842 * 10);
  });

  it('should return tax modified from configuration - percentage case', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        LU: 3.44,
      },
    });

    const newTax = countries.taxRule('LU');

    expect(newTax.applyTax(new Big(100))).toStrictEqual(new Big(100).times(3.44));
  });

  it('should return tax modified from configuration - function case', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        CY: 'function(price) { return 1234; }',
      },
    });

    const newTax = countries.taxRule('CY');

    expect(newTax.applyTax(new Big(421))).toStrictEqual(new Big(1234));
  });

  it('should keep tax unchanged when it fails to read it from configuration - invalid function case', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        EE: 'funn(price) {return unprobableVariable*7;}',
        LV: 'function(price) return 4',
        SI: '45',
      },
    });

    expect(countries.taxRule('EE').applyTax(new Big(231))).toStrictEqual(new Big(231).times(1.22));
    expect(countries.taxRule('LV').applyTax(new Big(232))).toStrictEqual(new Big(232).times(1.2));
    expect(countries.taxRule('SI').applyTax(new Big(233))).toStrictEqual(new Big(233).times(1.24));
  });

  it('should keep tax unchanged when it fails to execute evaluation from configuration', () => {
    vi.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        EE: "function(price) {throw {error:'oops'};}",
      },
    });

    expect(countries.taxRule('EE').applyTax(new Big(231))).toStrictEqual(new Big(231).times(1.22));
  });
});

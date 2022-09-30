import { beforeEach, describe, expect, it, jest } from '@jest/globals';
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
    jest.spyOn(configuration, 'all').mockReturnValue({});
    expect(countries.taxRule('DE').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('UK').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('FR').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('IT').applyTax(1)).toBe(1.25);
    expect(countries.taxRule('ES').applyTax(1)).toBe(1.19);
    expect(countries.taxRule('PL').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('RO').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('NL').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('BE').applyTax(1)).toBe(1.24);
    expect(countries.taxRule('EL').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('CZ').applyTax(1)).toBe(1.19);
    expect(countries.taxRule('PT').applyTax(1)).toBe(1.23);
    expect(countries.taxRule('HU').applyTax(1)).toBe(1.27);
    expect(countries.taxRule('SE').applyTax(1)).toBe(1.23);
    expect(countries.taxRule('AT').applyTax(1)).toBe(1.22);
    expect(countries.taxRule('BG').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('DK').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('FI').applyTax(1)).toBe(1.17);
    expect(countries.taxRule('SK').applyTax(1)).toBe(1.18);
    expect(countries.taxRule('IE').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('HR').applyTax(1)).toBe(1.23);
    expect(countries.taxRule('LT').applyTax(1)).toBe(1.23);
    expect(countries.taxRule('SI').applyTax(1)).toBe(1.24);
    expect(countries.taxRule('LV').applyTax(1)).toBe(1.2);
    expect(countries.taxRule('EE').applyTax(1)).toBe(1.22);
    expect(countries.taxRule('CY').applyTax(1)).toBe(1.21);
    expect(countries.taxRule('LU').applyTax(1)).toBe(1.25);
    expect(countries.taxRule('MT').applyTax(1)).toBe(1.2);
  });

  it('should get the updated tax for a given country', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const newTaxRule = (total: number) => {
      if (total > 100) return total * 1.2;
      return total * 1.2 + 100;
    };
    countries.updateTax('FR', newTaxRule);

    const newTax = countries.taxRule('FR');

    expect(newTax.applyTax(100)).toBe(100 * 1.2 + 100);
    expect(newTax.applyTax(150)).toBe(150 * 1.2);
  });

  it('should return random country according to its frequency', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({});
    const mostImportantPopulation = 200000;
    const samples = _.times(mostImportantPopulation * 10, countries.randomOne);

    const occurrences = _.groupBy(samples);

    expect(occurrences.FR.length).toBeGreaterThan(151381);
    expect(occurrences.UK.length).toBeGreaterThan(152741);
    expect(occurrences.LT.length).toBeLessThan(6844 * 10);
    expect(occurrences.NL.length).toBeLessThan(39842 * 10);
  });

  it('should return tax modified from configuration - percentage case', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        LU: 3.44,
      },
    });

    const newTax = countries.taxRule('LU');

    expect(newTax.applyTax(100)).toBe(100 * 3.44);
  });

  it('should return tax modified from configuration - function case', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        CY: 'function(price) { return 1234; }',
      },
    });

    const newTax = countries.taxRule('CY');

    expect(newTax.applyTax(421)).toBe(1234);
  });

  it('should keep tax unchanged when it fails to read it from configuration - invalid function case', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        EE: 'funn(price) {return unprobableVariable*7;}',
        LV: 'function(price) return 4',
        SI: '45',
      },
    });

    expect(countries.taxRule('EE').applyTax(231)).toBe(231 * 1.22);
    expect(countries.taxRule('LV').applyTax(232)).toBe(232 * 1.2);
    expect(countries.taxRule('SI').applyTax(233)).toBe(233 * 1.24);
  });

  it('should keep tax unchanged when it fails to execute evaluation from configuration', () => {
    jest.spyOn(configuration, 'all').mockReturnValue({
      taxes: {
        EE: "function(price) {throw {error:'oops'};}",
      },
    });

    expect(countries.taxRule('EE').applyTax(231)).toBe(231 * 1.22);
  });
});

import _ from 'lodash';
import Configuration from '../config';
import { europeanCountries, scale } from './countries-utils';
import Country from './Country';

const countryDistributionByWeight = _.reduce(
  europeanCountries,
  (distrib: string[], infos, country) => {
    let i;
    for (i = 0; i < infos[1]; i++) {
      distrib.push(country);
    }
    return distrib;
  },
  []
);

const defaultTaxRule = (name: string) => scale(europeanCountries[name][0]);

const countryMap: Record<string, Country> = _.reduce(
  europeanCountries,
  (map: Record<string, Country>, _infos, country) => ({
    ...map,
    [country]: new Country(country, defaultTaxRule(country)),
  }),
  {}
);

export default class Countries {
  constructor(private readonly configuration: Configuration) {}

  get fromEurope() {
    return Object.keys(countryMap);
  }

  randomOne(): string {
    return _.sample(countryDistributionByWeight)!;
  }

  taxRule(countryName: string) {
    const country = countryMap[countryName];
    return country.withConfiguration(this.configuration);
  }

  updateTax(country: string, taxRule: (price: number) => number) {
    countryMap[country].taxRule = taxRule;
  }
}

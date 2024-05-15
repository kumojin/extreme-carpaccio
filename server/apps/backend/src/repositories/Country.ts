import Big from 'big.js';
import colors from 'colors';
import _ from 'lodash';
import Configuration from '../config';
import logger from '../logger';
import { scale } from './countries-utils';

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const customEval = (s: string) => new Function(`return ${s}`)();

const lookupForOverridenDefinition = (
  configuration: Configuration,
  country: string,
): ((price: number) => number) | null => {
  const conf = configuration.all();
  if (!conf.taxes || !conf.taxes[country]) {
    return null;
  }

  const def = conf.taxes[country];
  if (_.isNumber(def)) {
    logger.info(
      colors.blue(
        `Tax rule for country ${country} changed to scale factor ${def}`,
      ),
    );
    return scale(def);
  }

  if (_.isString(def)) {
    try {
      const taxRule = customEval(def);
      if (_.isFunction(taxRule)) {
        logger.info(
          colors.blue(
            `Tax rule for country ${country} changed to function ${def}`,
          ),
        );
        return taxRule;
      }
      logger.error(
        colors.red(
          `Failed to evaluate tax rule for country ${country} from ${def}, result is not a function`,
        ),
      );
      return null;
    } catch (e) {
      logger.error(
        colors.red(
          `Failed to evaluate tax rule for country ${country} from ${def}, got: ${e}`,
        ),
      );
      return null;
    }
  }

  return null;
};

export default class Country {
  set taxRule(value: (price: number) => number) {
    this._taxRule = value;
  }

  private configuration: Configuration | undefined;

  private _taxRule: (price: number) => number;

  constructor(
    private readonly name: string,
    taxRule: (price: number) => number,
  ) {
    this._taxRule = taxRule;
  }

  public withConfiguration(configuration: Configuration) {
    this.configuration = configuration;
    return this;
  }

  applyTax(sum: Big): Big {
    let newRule: ((price: number) => number) | null = null;

    if (this.configuration) {
      newRule = lookupForOverridenDefinition(this.configuration, this.name);
    }

    if (newRule == null) {
      return new Big(this._taxRule(sum.toNumber()));
    }

    try {
      return new Big(newRule(sum.toNumber()));
    } catch (e) {
      logger.error(
        colors.red(
          `Failed to evaluate tax rule for country ${this.name} falling back to original value, got:${e}`,
        ),
      );
      return new Big(this._taxRule(sum.toNumber()));
    }
  }
}

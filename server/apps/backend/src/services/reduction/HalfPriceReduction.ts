import type Big from 'big.js';
import type { Reduction } from './Reduction';

class HalfPriceReduction implements Reduction {
  get name(): string {
    return this._name;
  }

  private readonly _name: string;

  constructor() {
    this._name = 'HALF PRICE';
  }

  public apply(amount: Big): Big {
    return amount.div(2);
  }
}
export default new HalfPriceReduction();

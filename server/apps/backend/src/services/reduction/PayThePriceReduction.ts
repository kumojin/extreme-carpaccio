import Big from 'big.js';
import { Reduction } from './Reduction';

class PayThePriceReduction implements Reduction {
  get name(): string {
    return this._name;
  }

  private readonly _name: string;

  constructor() {
    this._name = 'PAY THE PRICE';
  }

  public apply(amount: Big): Big {
    return amount;
  }
}
export default new PayThePriceReduction();

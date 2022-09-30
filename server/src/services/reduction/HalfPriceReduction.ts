import { Reduction } from './Reduction';

class HalfPriceReduction implements Reduction {
  get name(): string {
    return this._name;
  }

  private readonly _name: string;

  constructor() {
    this._name = 'HALF PRICE';
  }

  public apply(amount: number): number {
    return amount / 2;
  }
}
export default new HalfPriceReduction();

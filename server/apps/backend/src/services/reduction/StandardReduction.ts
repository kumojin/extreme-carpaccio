import Big from 'big.js';
import type { Reduction } from './Reduction';

type ReductionStep = {
  sum: number;
  reduction: number;
};
class StandardReduction implements Reduction {
  get name(): string {
    return this._name;
  }

  private readonly _name: string;

  private readonly reductions: ReductionStep[];

  constructor() {
    this._name = 'STANDARD';
    this.reductions = [
      { sum: 50000, reduction: 0.15 },
      { sum: 10000, reduction: 0.1 },
      { sum: 7000, reduction: 0.07 },
      { sum: 5000, reduction: 0.05 },
      { sum: 1000, reduction: 0.03 },
    ];
  }

  public apply(amount: Big): Big {
    return amount.times(new Big(1).minus(this.reductionFor(amount)));
  }

  public reductionFor(total: Big) {
    const reduction = this.reductions.find((it) => total.gte(it.sum));
    return !reduction ? new Big(0) : new Big(reduction.reduction);
  }
}

export default new StandardReduction();

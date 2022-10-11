import { Reduction } from './Reduction';

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

  public apply(amount: number): number {
    return amount * (1 - this.reductionFor(amount));
  }

  public reductionFor(total: number) {
    const reduction = this.reductions.find((it) => it.sum <= total);
    return !reduction ? 0 : reduction.reduction;
  }
}

export default new StandardReduction();

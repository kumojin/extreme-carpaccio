import { beforeEach, describe, expect, it } from '@jest/globals';
import StandardReduction from './StandardReduction';

describe('Standard Reduction', () => {
  let standardReduction: typeof StandardReduction;

  beforeEach(() => {
    standardReduction = StandardReduction;
  });

  it('should de reduced by 15% when total is bigger than 50,000', () => {
    expect(standardReduction.reductionFor(50001)).toBe(0.15);
  });

  it('should de reduced by 10% when total is between [10,000, 50,000)', () => {
    expect(standardReduction.reductionFor(10000)).toBe(0.1);
    expect(standardReduction.reductionFor(10500)).toBe(0.1);
  });

  it('should de reduced by 7% when total is between [7,000, 10,000)', () => {
    expect(standardReduction.reductionFor(7000)).toBe(0.07);
    expect(standardReduction.reductionFor(7500)).toBe(0.07);
  });

  it('should be reduced by 5% when total is between [5,000, 7,000)', () => {
    expect(standardReduction.reductionFor(5000)).toBe(0.05);
    expect(standardReduction.reductionFor(5500)).toBe(0.05);
  });

  it('should be reduced by 3% when total is between [1,000, 5,000)', () => {
    expect(standardReduction.reductionFor(1000)).toBe(0.03);
    expect(standardReduction.reductionFor(1100)).toBe(0.03);
  });

  it('should not be reduced when when the total between [0, 1,000)', () => {
    expect(standardReduction.reductionFor(500)).toBe(0.0);
  });
});

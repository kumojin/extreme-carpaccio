import HalfPriceReduction from './HalfPriceReduction';
import PayThePriceReduction from './PayThePriceReduction';
import StandardReduction from './StandardReduction';

export type { Reduction } from './Reduction';
export default {
  STANDARD: StandardReduction,
  PAY_THE_PRICE: PayThePriceReduction,
  HALF_PRICE: HalfPriceReduction,
};

import Big from 'big.js';

export interface Reduction {
  name: string;
  apply: (amount: Big) => Big;
}

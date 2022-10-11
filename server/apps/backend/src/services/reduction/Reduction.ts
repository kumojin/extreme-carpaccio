export interface Reduction {
  name: string;
  apply: (amount: number) => number;
}

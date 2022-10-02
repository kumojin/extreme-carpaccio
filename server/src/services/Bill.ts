import _ from 'lodash';

export type Bill = {
  total: number;
};
export const isBill = (bill: unknown): bill is Bill => _.has(bill, 'total');

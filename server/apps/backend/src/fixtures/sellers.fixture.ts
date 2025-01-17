import { URL } from 'node:url';
import type { Seller } from '../repositories';
import type { CashHistory } from '../services/SellerService';

export const seller1: Seller = {
  name: 'John',
  cash: 1000,
  online: true,
  url: new URL('http://192.168.0.1:8080'),
  password: '12345',
};

export const seller2: Seller = {
  name: 'Alex',
  cash: 1500,
  online: false,
  url: new URL('http://192.168.0.2:8080'),
  password: '12345',
};

export const sellers = [seller1, seller2];

export const cashHistory: CashHistory = {
  history: {
    John: [0, 0, 500, 1000],
    Alex: [0, 500, 1000, 1500],
  },
  lastIteration: 4,
};

export const buildWithDefaults = (values: Partial<Seller>): Seller => ({
  name: 'John',
  password: '123456',
  url: new URL('https://192.168.0.1:3000'),
  cash: 0,
  online: true,
  ...values,
});

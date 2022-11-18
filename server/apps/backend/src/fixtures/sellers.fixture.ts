import { Seller } from '../repositories';
import { CashHistory } from '../services/SellerService';

export const seller1: Seller = {
  name: 'John',
  cash: 1000,
  online: true,
  hostname: 'http://192.168.0.1',
  path: '',
  password: '12345',
  port: '8080',
};

export const seller2: Seller = {
  name: 'Alex',
  cash: 1500,
  online: false,
  hostname: 'https://192.168.0.2',
  path: '',
  password: '12345',
  port: '8080',
};

export const sellers = [seller1, seller2];

export const cashHistory: CashHistory = {
  history: {
    John: [0, 0, 500, 1000],
    Alex: [0, 500, 1000, 1500],
  },
  lastIteration: 4,
};

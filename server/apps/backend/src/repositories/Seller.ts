import { URL } from 'node:url';

export type Seller = {
  name: string;
  password?: string;
  url: URL;
  cash: number;
  online?: boolean;
};

export const buildWithDefaults = (values: Partial<Seller>): Seller => ({
  name: 'John',
  password: '123456',
  url: new URL('https://192.168.0.1:3000'),
  cash: 0,
  online: true,
  ...values,
});

import { URL } from 'node:url';

export type Seller = {
  name: string;
  password: string;
  url: URL;
  cash: number;
  online: boolean;
};

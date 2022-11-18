export type Seller = {
  name: string;
  password?: string;
  hostname: string;
  port: string;
  path?: string;
  cash: number;
  online?: boolean;
};

export const buildWithDefaults = (values: Partial<Seller>) => ({
  name: 'John',
  password: '123456',
  hostname: '192.168.0.1',
  port: '3000',
  path: '/',
  cash: 0,
  online: true,
  ...values,
});

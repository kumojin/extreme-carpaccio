import {
  MaybeRegisterSellerRequest,
  RegisterSellerRequest,
} from '../SellerController';

export const validSellerRequest: RegisterSellerRequest = {
  name: 'John',
  password: '12345',
  url: 'http://192.168.0.1',
};

export const validSellerRequestWithUrl = (
  url: string,
): MaybeRegisterSellerRequest => ({
  name: 'John',
  password: '12345',
  url,
});

export const missingNameSellerRequest: MaybeRegisterSellerRequest = {
  ...validSellerRequest,
  name: undefined,
};

export const missingPasswordSellerRequest: MaybeRegisterSellerRequest = {
  ...validSellerRequest,
  password: undefined,
};

export const missingUrlSellerRequest: MaybeRegisterSellerRequest = {
  ...validSellerRequest,
  url: undefined,
};

import { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { when } from 'jest-when';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import Configuration from './config';
import {
  cashHistory,
  missingNameSellerRequest,
  missingPasswordSellerRequest,
  missingUrlSellerRequest,
  sellers,
  validSellerRequestWithUrl,
} from './fixtures';
import { Sellers } from './repositories';
import {
  MaybeRegisterSellerRequest,
  listSellers,
  registerSeller,
  sellersHistory,
} from './SellerController';
import { SellerService } from './services';

describe('Seller Controller', () => {
  let sellerService: SellerService;

  beforeEach(() => {
    sellerService = new SellerService(new Sellers(), new Configuration());
  });

  describe('listSellers', () => {
    it('should return only seller name, cash and online status', () => {
      const request = httpMocks.createRequest({});
      const response = httpMocks.createResponse();

      jest.spyOn(sellerService, 'allSellers').mockReturnValue(sellers);

      listSellers(sellerService)(request, response);

      expect(response._getData()).toEqual([
        {
          name: 'John',
          cash: 1000,
          online: true,
        },
        {
          name: 'Alex',
          cash: 1500,
          online: false,
        },
      ]);
    });
  });

  describe('sellersHistory', () => {
    describe('when chunk is present in query and is a string', () => {
      it('should call getCashHistory with specified chunk', () => {
        const request = httpMocks.createRequest({
          query: {
            chunk: '42',
          },
        });
        const response = httpMocks.createResponse();
        when(jest.spyOn(sellerService, 'getCashHistory'))
          .calledWith(42)
          .mockReturnValue(cashHistory);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });

    describe('when chunk is present in query but is not a number', () => {
      it('should call getCashHistory with default chunk', () => {
        const request = httpMocks.createRequest({
          query: {
            chunk: 'xxx',
          },
        });
        const response = httpMocks.createResponse();
        when(jest.spyOn(sellerService, 'getCashHistory'))
          .calledWith(10)
          .mockReturnValue(cashHistory);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });

    describe('when chunk is not present in query', () => {
      it('should call getCashHistory with default chunk', () => {
        const request = httpMocks.createRequest({
          query: {},
        });
        const response = httpMocks.createResponse();
        when(jest.spyOn(sellerService, 'getCashHistory'))
          .calledWith(10)
          .mockReturnValue(cashHistory);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });
  });

  describe('registerSeller', () => {
    let body: MaybeRegisterSellerRequest;
    let request: MockRequest<Request>;
    let response: MockResponse<Response>;
    const registerMock = jest.fn();

    beforeEach(() => {
      response = httpMocks.createResponse();
      jest.spyOn(sellerService, 'register').mockImplementation(registerMock);
    });

    describe('when invalid input body', () => {
      describe('when body has no name', () => {
        beforeEach(() => {
          body = missingNameSellerRequest;
        });

        it('should return a bad request', () => {
          request = httpMocks.createRequest({
            body,
          });

          registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });

      describe('when body has no password', () => {
        beforeEach(() => {
          body = missingPasswordSellerRequest;
        });

        it('should return a bad request', () => {
          request = httpMocks.createRequest({
            body,
          });

          registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });

      describe('when body has no url', () => {
        beforeEach(() => {
          body = missingUrlSellerRequest;
        });

        it('should return a bad request', () => {
          request = httpMocks.createRequest({
            body,
          });

          registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });

      describe.each([
        ['missing protocol', 'localhost'],
        ['invalid protocol', 'foo://localhost'],
      ])('when body has all required fields but invalid url (%s)', (_, url) => {
        beforeEach(() => {
          body = validSellerRequestWithUrl(url);
        });

        it('should return a bad request', () => {
          request = httpMocks.createRequest({
            body,
          });

          registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });
    });

    describe.each([
      ['http', 'http://localhost'],
      ['https', 'https://localhost'],
    ])('when body has all required fields and valid url (%s)', (_, url) => {
      beforeEach(() => {
        body = validSellerRequestWithUrl(url);
        request = httpMocks.createRequest({
          body,
        });
      });

      describe('when seller is not authorized', () => {
        beforeEach(() => {
          when(jest.spyOn(sellerService, 'isAuthorized'))
            .calledWith(body.name!, body.password!)
            .mockReturnValue(false);
        });

        it('should return a unauthorized', () => {
          registerSeller(sellerService)(request, response);

          expect(registerMock).not.toHaveBeenCalled();
          expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });
      });

      describe('when seller is authorized', () => {
        beforeEach(() => {
          when(jest.spyOn(sellerService, 'isAuthorized'))
            .calledWith(body.name!, body.password!)
            .mockReturnValue(true);
        });

        it('should return a success', () => {
          registerSeller(sellerService)(request, response);

          expect(registerMock).toHaveBeenCalledWith(
            body.url,
            body.name,
            body.password
          );
          expect(response.statusCode).toBe(StatusCodes.OK);
        });
      });
    });
  });
});

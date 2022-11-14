import { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { when } from 'jest-when';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import Configuration from './config';
import { Sellers } from './repositories';
import {
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

      jest.spyOn(sellerService, 'allSellers').mockReturnValue([
        {
          name: 'John',
          cash: 123,
          online: true,
          hostname: 'http://localhost',
          path: '',
          password: 'password',
          port: '8080',
        },
      ]);

      listSellers(sellerService)(request, response);

      expect(response._getData()).toEqual([
        {
          name: 'John',
          cash: 123,
          online: true,
        },
      ]);
    });
  });

  describe('sellersHistory', () => {
    const CASH_HISTORY = {
      history: {
        John: [1, 2, 3],
      },
      lastIteration: 3,
    };

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
          .mockReturnValue(CASH_HISTORY);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(CASH_HISTORY);
      });
    });

    describe('when chunk is present in query but is not a string', () => {
      it('should call getCashHistory with default chunk', () => {
        const request = httpMocks.createRequest({
          query: {
            chunk: { foo: 'bar' },
          },
        });
        const response = httpMocks.createResponse();
        when(jest.spyOn(sellerService, 'getCashHistory'))
          .calledWith(10)
          .mockReturnValue(CASH_HISTORY);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(CASH_HISTORY);
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
          .mockReturnValue(CASH_HISTORY);

        sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(CASH_HISTORY);
      });
    });
  });

  describe('registerSeller', () => {
    let request: MockRequest<Request>;
    let response: MockResponse<Response>;
    const SELLER = {
      name: 'John',
      password: 'password',
      url: 'http://localhost:3000',
    };
    const registerMock = jest.fn();

    beforeEach(() => {
      response = httpMocks.createResponse();
      jest.spyOn(sellerService, 'register').mockImplementation(registerMock);
    });

    describe('when body has no name', () => {
      it('should return a bad request', () => {
        const { name, ...bodyWithoutName } = SELLER;
        request = httpMocks.createRequest({
          body: bodyWithoutName,
        });

        registerSeller(sellerService)(request, response);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(registerMock).not.toHaveBeenCalled();
      });
    });

    describe('when body has no password', () => {
      it('should return a bad request', () => {
        const { password, ...bodyWithoutPassword } = SELLER;
        request = httpMocks.createRequest({
          body: bodyWithoutPassword,
        });

        registerSeller(sellerService)(request, response);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(registerMock).not.toHaveBeenCalled();
      });
    });

    describe('when body has no url', () => {
      it('should return a bad request', () => {
        const { url, ...bodyWithoutUrl } = SELLER;
        request = httpMocks.createRequest({
          body: bodyWithoutUrl,
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
      it('should return a bad request', () => {
        request = httpMocks.createRequest({
          body: {
            ...SELLER,
            url,
          },
        });

        registerSeller(sellerService)(request, response);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(registerMock).not.toHaveBeenCalled();
      });
    });

    describe.each([
      ['http', 'http://localhost'],
      ['https', 'https://localhost'],
    ])('when body has all required fields but and valid url (%s)', (_, url) => {
      beforeEach(() => {
        request = httpMocks.createRequest({
          body: {
            ...SELLER,
            url,
          },
        });
      });

      describe('when seller is not authorized', () => {
        beforeEach(() => {
          when(jest.spyOn(sellerService, 'isAuthorized'))
            .calledWith(SELLER.name, SELLER.password)
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
            .calledWith(SELLER.name, SELLER.password)
            .mockReturnValue(true);
        });

        it('should return a success', () => {
          registerSeller(sellerService)(request, response);

          expect(registerMock).toHaveBeenCalledWith(
            url,
            SELLER.name,
            SELLER.password
          );
          expect(response.statusCode).toBe(StatusCodes.OK);
        });
      });
    });
  });
});

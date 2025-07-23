import type { Request, Response } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import httpMocks, { type MockRequest, type MockResponse } from 'node-mocks-http';
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
import { listSellers, type MaybeRegisterSellerRequest, registerSeller, sellersHistory } from './SellerController';
import { SellerService } from './services';

describe('Seller Controller', () => {
  let sellerService: SellerService;

  beforeEach(async () => {
    const sellersRepository = await Sellers.create(true);
    sellerService = new SellerService(sellersRepository, new Configuration());
  });

  describe('listSellers', () => {
    it('should return only seller name, cash and online status', async () => {
      const request = httpMocks.createRequest({});
      const response = httpMocks.createResponse();

      vi.spyOn(sellerService, 'allSellers').mockResolvedValue(sellers);

      await listSellers(sellerService)(request, response);

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
      it('should call getCashHistory with specified chunk', async () => {
        const request = httpMocks.createRequest({
          query: {
            chunk: '42',
          },
        });
        const response = httpMocks.createResponse();
        vi.spyOn(sellerService, 'getCashHistory').mockResolvedValue(cashHistory);

        await sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });

    describe('when chunk is present in query but is not a number', () => {
      it('should call getCashHistory with default chunk', async () => {
        const request = httpMocks.createRequest({
          query: {
            chunk: 'xxx',
          },
        });
        const response = httpMocks.createResponse();
        vi.spyOn(sellerService, 'getCashHistory').mockResolvedValue(cashHistory);

        await sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });

    describe('when chunk is not present in query', () => {
      it('should call getCashHistory with default chunk', async () => {
        const request = httpMocks.createRequest({
          query: {},
        });
        const response = httpMocks.createResponse();
        vi.spyOn(sellerService, 'getCashHistory').mockResolvedValue(cashHistory);

        await sellersHistory(sellerService)(request, response);

        expect(response._getData()).toEqual(cashHistory);
      });
    });
  });

  describe('registerSeller', () => {
    let body: MaybeRegisterSellerRequest;
    let request: MockRequest<Request>;
    let response: MockResponse<Response>;
    const registerMock = vi.fn();

    beforeEach(() => {
      response = httpMocks.createResponse();
      vi.spyOn(sellerService, 'register').mockImplementation(registerMock);
    });

    describe('when invalid input body', () => {
      describe('when body has no name', () => {
        beforeEach(() => {
          body = missingNameSellerRequest;
        });

        it('should return a bad request', async () => {
          request = httpMocks.createRequest({
            body,
          });

          await registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });

      describe('when body has no password', () => {
        beforeEach(() => {
          body = missingPasswordSellerRequest;
        });

        it('should return a bad request', async () => {
          request = httpMocks.createRequest({
            body,
          });

          await registerSeller(sellerService)(request, response);

          expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(registerMock).not.toHaveBeenCalled();
        });
      });

      describe('when body has no url', () => {
        beforeEach(() => {
          body = missingUrlSellerRequest;
        });

        it('should return a bad request', async () => {
          request = httpMocks.createRequest({
            body,
          });

          await registerSeller(sellerService)(request, response);

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

        it('should return a bad request', async () => {
          request = httpMocks.createRequest({
            body,
          });

          await registerSeller(sellerService)(request, response);

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
          vi.spyOn(sellerService, 'isAuthorized').mockResolvedValue(false);
        });

        it('should return a unauthorized', async () => {
          await registerSeller(sellerService)(request, response);

          expect(registerMock).not.toHaveBeenCalled();
          expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });
      });

      describe('when seller is authorized', () => {
        beforeEach(() => {
          vi.spyOn(sellerService, 'isAuthorized').mockResolvedValue(true);
        });

        it('should return a success', async () => {
          await registerSeller(sellerService)(request, response);

          expect(registerMock).toHaveBeenCalledWith(body.url, body.name, body.password);
          expect(response.statusCode).toBe(StatusCodes.OK);
        });
      });
    });
  });
});

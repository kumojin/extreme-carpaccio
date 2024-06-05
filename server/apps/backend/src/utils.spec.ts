import http, { type ClientRequest } from 'node:http';
import https from 'node:https';
import utils, { isValidUrl } from './utils';

describe('Utils', () => {
  it('should fix precision for numbers', () => {
    expect(utils.fixPrecision(1, 2)).toBe(1.0);
    expect(utils.fixPrecision(1.234, 2)).toBe(1.23);
  });

  it('should parse a string into a json object', () => {
    expect(utils.jsonify('{"name": "Bob"}')).toEqual({ name: 'Bob' });
  });

  it('should not parse a string but return an empty object when input is not a valid json object', () => {
    expect(() => utils.jsonify('not valid json object')).toThrow();
    expect(() => utils.jsonify('')).toThrow();
    expect(() => utils.jsonify(undefined)).toThrow();
    expect(() => utils.jsonify(null)).toThrow();
  });

  describe.each([
    ['https', new URL('https://localhost:3000'), https],
    ['http', new URL('http://localhost:3000'), http],
  ])('post when url is %s', (_, url, networkModule) => {
    it('should send post request to someone else', () => {
      const fakeRequest = {
        write() {},
        on() {},
        end() {},
      } as unknown as ClientRequest;
      jest.spyOn(networkModule, 'request').mockReturnValue(fakeRequest);
      jest.spyOn(fakeRequest, 'write');
      jest.spyOn(fakeRequest, 'end');
      const body = { content: 'some content' };
      const callback = () => Promise.resolve();

      utils.post(url, '/path', body, callback);

      const bodyStringified = utils.stringify(body);
      expect(networkModule.request).toHaveBeenCalledWith(
        url,
        {
          path: '/path',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Content-Length': bodyStringified.length,
          },
        },
        callback,
      );
      expect(fakeRequest.write).toHaveBeenCalledWith(bodyStringified);
      expect(fakeRequest.end).toHaveBeenCalled();
    });
  });

  describe('isValidUrl', () => {
    describe.each([
      ['missing protocol', 'localhost'],
      ['invalid protocol', 'foo://localhost'],
    ])('when url is %s', (_, url) => {
      it('should return false', () => {
        expect(isValidUrl(url)).toBe(false);
      });
    });

    describe.each([
      ['http protocol', 'http://localhost'],
      ['https protocol', 'https://localhost'],
      ['url with port', 'https://localhost:3000'],
      ['url with path', 'https://localhost/path'],
      ['url with port and path', 'https://localhost:3000/path'],
      ['IP with port and path', 'https://192.168.0.0:3000/path'],
    ])('when url is %s', (_, url) => {
      it('should return true', () => {
        expect(isValidUrl(url)).toBe(true);
      });
    });
  });
});

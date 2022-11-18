import http, { ClientRequest } from 'node:http';
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

  it('should send post request to someone else', () => {
    const fakeRequest = {
      write() {},
      on() {},
      end() {},
    } as unknown as ClientRequest;
    jest.spyOn(http, 'request').mockReturnValue(fakeRequest);
    jest.spyOn(fakeRequest, 'write');
    jest.spyOn(fakeRequest, 'end');
    const body = { content: 'some content' };
    const callback = () => {};

    utils.post('localhost', '3000', '/path', body, callback);

    const bodyStringified = utils.stringify(body);
    expect(http.request).toHaveBeenCalledWith(
      {
        hostname: 'localhost',
        port: '3000',
        path: '/path',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': bodyStringified.length,
        },
      },
      callback
    );
    expect(fakeRequest.write).toHaveBeenCalledWith(bodyStringified);
    expect(fakeRequest.end).toHaveBeenCalled();
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

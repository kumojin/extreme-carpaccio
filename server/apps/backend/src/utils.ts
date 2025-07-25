import http, { type IncomingMessage, type RequestOptions } from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import Big from 'big.js';

const isHttps = (url: URL): boolean => url.protocol === 'https:';
const isHttp = (url: URL): boolean => url.protocol === 'http:';
export const isValidUrl = (value: string): boolean => {
  try {
    const validUrl = new URL(value);
    return isHttp(validUrl) || isHttps(validUrl);
  } catch {
    return false;
  }
};

class Utils {
  public stringify(value: unknown) {
    return JSON.stringify(value);
  }

  public jsonify(value?: string | null) {
    if (!value) {
      throw new Error(`The object "${value}" is not a valid json object`);
    }

    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`The object "${value}" is not a valid json object`);
    }
  }

  public fixPrecision(value: number, precision: number) {
    return new Big(value).round(precision).toNumber();
  }

  public post(
    url: URL,
    path: string,
    body: unknown,
    onSuccess?: (res: IncomingMessage) => Promise<void>,
    onError?: (err: Error) => void,
  ) {
    const bodyStringified = this.stringify(body);
    const options: RequestOptions = {
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': bodyStringified.length,
      },
    };

    const { request } = isHttps(url) ? https : http;
    const clientRequest = request(url, options, onSuccess);
    clientRequest.on('error', onError || (() => {}));
    clientRequest.write(bodyStringified);
    clientRequest.end();
  }
}

export default new Utils();

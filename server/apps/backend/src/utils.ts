import http, { IncomingMessage } from 'node:http';
import url from 'node:url';

class Utils {
  public stringify(value: any) {
    return JSON.stringify(value);
  }

  public jsonify(value?: string | null) {
    if (!value) {
      throw new Error(`The object "${value}" is not a valid json object`);
    }

    try {
      return JSON.parse(value);
    } catch (exception) {
      throw new Error(`The object "${value}" is not a valid json object`);
    }
  }

  public fixPrecision(value: number, precision: number) {
    return parseFloat(value.toFixed(precision));
  }

  public post(
    hostname: string,
    port: string,
    path: string,
    body: any,
    onSuccess?: (res: IncomingMessage) => void,
    onError?: (err: Error) => void
  ) {
    const bodyStringified = this.stringify(body);
    const options = {
      hostname,
      port,
      path: (path || '').replace('//', '/'),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Content-Length': bodyStringified.length,
      },
    };
    const request = http.request(options, onSuccess);
    request.on('error', onError || (() => {}));
    request.write(bodyStringified);
    request.end();
  }
}

export const isValidUrl = (value: string): boolean => {
  try {
    const validUrl = new url.URL(value);
    return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export default new Utils();

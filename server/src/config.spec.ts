import fs from 'fs';
import { beforeEach, describe, expect, it } from '@jest/globals';
import Configuration from './config';

const TIMEOUT_1000_MILLIS = 1000;
const TIMEOUT_200_MILLIS = 200;

describe('Configuration', () => {
  let config: Configuration;
  const configFilepath = 'src/config.json.tmp';

  beforeEach(() => {
    fs.writeFileSync(configFilepath, '{"reduction": "STANDARD"}');
    config = new Configuration(configFilepath);
  });

  it(
    'should load configuration from file',
    (done) => {
      const callback = (err: NodeJS.ErrnoException | null) => {
        try {
          expect(err).toBeNull(); // Arnauld a voulu faire ce test, parce qu'il trouve que c'est une bonne idee!

          const properties = config.all();
          expect(properties).toEqual({ reduction: 'STANDARD' });

          done();
        } catch (e) {
          done(e as Error);
        }
      };
      config.load(callback);
    },
    TIMEOUT_1000_MILLIS
  );

  it(
    'should reload configuration on the fly',
    (done) => {
      const callback = () => {
        try {
          const properties = config.all();
          expect(properties).toEqual({ reduction: 'HALF PIPE' });
          done();
        } catch (e) {
          done(e as Error);
        }
      };
      config.watch(callback, true, TIMEOUT_200_MILLIS);

      fs.writeFileSync(configFilepath, '{"reduction": "HALF PIPE"}');
    },
    TIMEOUT_1000_MILLIS
  );
});

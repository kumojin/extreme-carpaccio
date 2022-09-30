import fs from 'node:fs';
import colors from 'colors';
import logger from './logger';
import utils from './utils';

export enum BadRequestMode {
  EMPTY_OBJECT = 0,
  ARRAY_BOOLEANS = 1,
  ERROR_QUANTITIES = 2,
  MISSING_QUANTITIES = 3,
  MISSING_PRICES = 4,
  INVALID_COUNTRY = 5,
  NO_COUNTRY = 6,
  NO_PRICES = 7,
  NO_QUANTITIES = 8,
  NO_REDUCTION = 9,
  NULL = 10,
}
export type Settings = {
  active?: boolean;
  cashFreeze?: boolean;
  reduction?: string;
  offlinePenalty?: number;
  badRequest?: {
    active?: boolean;
    period?: number;
    modes?: BadRequestMode[];
  };
  taxes?: Record<string, string | number>;
};
type Callback = (error: NodeJS.ErrnoException | null) => void;
class Configuration {
  private props: Settings | undefined;

  constructor(private readonly filepath?: string) {}

  public load(callback: Callback) {
    return this.loadFile(callback);
  }

  public all(): Settings {
    if (!this.props) {
      this.props = this.readContent();
    }

    return this.props!;
  }

  public watch(callback: Callback, watchOnce: boolean, interval: number) {
    if (!this.filepath) {
      return;
    }

    fs.watchFile(this.filepath, { persistent: !watchOnce, interval }, () => {
      this.load(callback);
    });
  }

  private loadFile(callback: Callback) {
    if (!this.filepath) {
      return;
    }

    logger.info(colors.red(`Reloading ${this.filepath}`));

    fs.readFile(this.filepath, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        logger.error(err);
        callback(err);
      } else {
        try {
          this.props = utils.jsonify(data);

          if (callback) {
            callback(null);
          }
        } catch (exception) {
          logger.error(`Oops something wrong happened: ${exception}`);
        }
      }
    });
  }

  private readContent() {
    if (!this.filepath) {
      return null;
    }

    logger.info(`Reading ${this.filepath}.`);
    const fileContent = fs.readFileSync(this.filepath, { encoding: 'utf-8' });
    return utils.jsonify(fileContent);
  }
}

export default Configuration;

import url from 'node:url';
import _ from 'lodash';
import Configuration from '../config';
import { messageFromError } from '../error-utils';
import logger from '../logger';
import { Seller, Sellers } from '../repositories';
import utils from '../utils';
import { Bill } from './Bill';

export type CashHistory = {
  history: Record<string, number[]>;
  lastIteration: number;
}
type Message = {
  type: 'ERROR' | 'INFO';
  content: string;
};
export default class SellerService {
  constructor(
    private readonly sellers: Sellers,
    private readonly configuration: Configuration
  ) {}

  public addCash(seller: Seller, amount: number, currentIteration: number): void {
    this.sellers.updateCash(seller.name, amount, currentIteration);
  }

  public deductCash(seller: Seller, amount: number, currentIteration: number): void {
    this.sellers.updateCash(seller.name, -amount, currentIteration);
  }

  public getCashHistory(chunk: number): CashHistory {
    const { cashHistory } = this.sellers;
    const cashHistoryReduced: Record<string, number[]> = {};
    let lastIteration: number = 0;

    Object.keys(cashHistory).forEach((seller) => {
      cashHistoryReduced[seller] = [];

      let i = 0;
      for (; i < cashHistory[seller].length; i++) {
        if ((i + 1) % chunk === 0) {
          cashHistoryReduced[seller].push(cashHistory[seller][i]);
        }
      }

      if (i % chunk !== 0) {
        cashHistoryReduced[seller].push(cashHistory[seller][i - 1]);
      }

      lastIteration = i;
    });

    return { history: cashHistoryReduced, lastIteration };
  }

  public isAuthorized(name: string, password: string): boolean {
    const seller = this.sellers.get(name);
    if (seller) {
      const samePwd = seller.password === password;
      logger.info(`Attempt to re-register ${name}, same password ${password}`);
      return samePwd;
    }
    return true;
  }

  public register(sellerUrl: string, name: string, password?: string): void {
    const parsedUrl = new url.URL(sellerUrl);
    const seller: Seller = {
      name,
      password,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      cash: 0.0,
      online: false,
    };
    this.sellers.save(seller);
    logger.info(`New seller registered: ${utils.stringify(seller)}`);
  }

  public allSellers(): Seller[] {
    return this.sellers.all();
  }

  public updateCash(
    seller: Seller,
    expectedBill: Bill,
    actualBill: Bill | undefined,
    currentIteration: number
  ): void {
    if (this.configuration.all().cashFreeze) {
      logger.info(
        'Cash was not updated because cashFreeze config parameter is true'
      );
      return;
    }
    try {
      const totalExpectedBill = utils.fixPrecision(expectedBill.total, 2);
      let message;
      let loss;

      if (_.isEmpty(actualBill)) {
        loss = utils.fixPrecision(totalExpectedBill * 0.5, 2);
        this.deductCash(seller, loss, currentIteration);
        message = `Goddamn, ${seller.name} has neither sent us a valid bill nor responded 404. ${loss} will be charged.`;
        this.notify(seller, { type: 'ERROR', content: message });
      } else {
        const totalActualBill = utils.fixPrecision(actualBill.total, 2);

        if (actualBill && totalExpectedBill === totalActualBill) {
          this.addCash(seller, totalExpectedBill, currentIteration);
          this.notify(seller, {
            type: 'INFO',
            content: `Hey, ${seller.name} earned ${totalExpectedBill}`,
          });
        } else {
          loss = utils.fixPrecision(totalExpectedBill * 0.5, 2);
          this.deductCash(seller, loss, currentIteration);
          message = `Goddamn, ${seller.name} replied ${totalActualBill} but right answer was ${totalExpectedBill}. ${loss} will be charged.`;
          this.notify(seller, { type: 'ERROR', content: message });
        }
      }
    } catch (exception) {
      this.notify(seller, {
        type: 'ERROR',
        content: messageFromError(exception),
      });
    }
  }

  public notify(seller: Seller, message: Message): void {
    utils.post(
      seller.hostname,
      seller.port,
      `${seller.path}/feedback`,
      message
    );

    if (message.type === 'ERROR') {
      logger.error(`Notifying ${seller.name}: ${message.content}`);
    } else {
      logger.info(`Notifying ${seller.name}: ${message.content}`);
    }
  }

  public setOffline(
    seller: Seller,
    offlinePenalty: number,
    currentIteration: number
  ): void {
    this.sellers.setOffline(seller.name);

    if (offlinePenalty !== 0) {
      logger.info(
        `Seller ${seller.name} is offline: a penalty of ${offlinePenalty} is applied.`
      );
      this.deductCash(seller, offlinePenalty, currentIteration);
    }
  }

  public setOnline(seller: Seller): void {
    this.sellers.setOnline(seller.name);
  }
}

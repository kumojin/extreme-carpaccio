import { URL } from 'node:url';
import argon2 from 'argon2';
import Big from 'big.js';
import _ from 'lodash';
import Configuration from '../config';
import { messageFromError } from '../error-utils';
import logger from '../logger';
import { Seller, Sellers } from '../repositories';
import utils from '../utils';
import { Bill } from './Bill';

export type CashHistory = {
  history: Record<Seller['name'], Seller['cash'][]>;
  lastIteration: number;
};
type Message = {
  type: 'ERROR' | 'INFO';
  content: string;
};
export default class SellerService {
  constructor(
    private readonly sellers: Sellers,
    private readonly configuration: Configuration
  ) {}

  public async addCash(
    seller: Seller,
    amount: Big,
    currentIteration: number
  ): Promise<void> {
    await this.sellers.updateCash(seller.name, amount, currentIteration);
  }

  public async deductCash(
    seller: Seller,
    amount: Big,
    currentIteration: number
  ): Promise<void> {
    await this.sellers.updateCash(
      seller.name,
      amount.times(-1),
      currentIteration
    );
  }

  public async getCashHistory(chunk: number): Promise<CashHistory> {
    const cashHistory = await this.sellers.getCashHistory();
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

  public async isAuthorized(name: string, password: string): Promise<boolean> {
    const seller = await this.sellers.get(name);
    if (seller) {
      return argon2.verify(seller.password, password);
    }
    return true;
  }

  public async register(
    sellerUrl: string,
    name: string,
    password: string
  ): Promise<void> {
    const parsedUrl = new URL(sellerUrl);
    const hash = await argon2.hash(password);

    const seller: Seller = {
      name,
      password: hash,
      url: parsedUrl,
      cash: 0.0,
      online: false,
    };
    await this.sellers.save(seller);
    logger.info(`New seller registered: ${utils.stringify(seller)}`);
  }

  public async allSellers(): Promise<Seller[]> {
    return this.sellers.all();
  }

  public async updateCash(
    seller: Seller,
    expectedBill: Bill,
    actualBill: Bill | undefined,
    currentIteration: number
  ): Promise<void> {
    if (this.configuration.all().cashFreeze) {
      logger.info(
        'Cash was not updated because cashFreeze config parameter is true'
      );
      return;
    }
    try {
      const totalExpectedBill = utils.fixPrecision(expectedBill.total, 2);
      let message;
      let loss: Big;

      if (_.isEmpty(actualBill)) {
        loss = new Big(totalExpectedBill).times(0.5);
        await this.deductCash(seller, loss, currentIteration);
        message = `Goddamn, ${seller.name} has neither sent us a valid bill nor responded 404. ${loss} will be charged.`;
        this.notify(seller, { type: 'ERROR', content: message });
      } else {
        const totalActualBill = utils.fixPrecision(actualBill.total, 2);

        if (actualBill && totalExpectedBill === totalActualBill) {
          await this.addCash(
            seller,
            new Big(totalExpectedBill),
            currentIteration
          );
          this.notify(seller, {
            type: 'INFO',
            content: `Hey, ${seller.name} earned ${totalExpectedBill}`,
          });
        } else {
          loss = new Big(totalExpectedBill).times(0.5);
          await this.deductCash(seller, loss, currentIteration);
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
    utils.post(seller.url, '/feedback', message);

    if (message.type === 'ERROR') {
      logger.error(`Notifying ${seller.name}: ${message.content}`);
    } else {
      logger.info(`Notifying ${seller.name}: ${message.content}`);
    }
  }

  public async setOffline(
    seller: Seller,
    offlinePenalty: number,
    currentIteration: number
  ): Promise<void> {
    await this.sellers.setOffline(seller.name);

    if (offlinePenalty !== 0) {
      logger.info(
        `Seller ${seller.name} is offline: a penalty of ${offlinePenalty} is applied.`
      );
      await this.deductCash(seller, new Big(offlinePenalty), currentIteration);
    }
  }

  public async setOnline(seller: Seller): Promise<void> {
    await this.sellers.setOnline(seller.name);
  }
}

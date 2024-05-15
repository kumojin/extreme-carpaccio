import path from 'node:path';
import Big from 'big.js';
import _ from 'lodash';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Seller } from './Seller';

type SellerRow = {
  name: string;
  password: string;
  url: string;
  cash: number;
  online: number;
  cash_history: string;
};

export default class Sellers {
  private constructor(private readonly db: Database) {}

  public static async create(inMemory: boolean = false) {
    const db = await open({
      filename: inMemory ? ':memory:' : path.join(__dirname, '..', 'backup.db'),
      driver: sqlite3.cached.Database,
    });
    await db.migrate({
      migrationsPath: path.join(process.cwd(), 'migrations'),
    });

    return new Sellers(db);
  }

  public async getCashHistory(): Promise<Record<string, number[]>> {
    const rows = await this.db.all<SellerRow[]>(
      'SELECT * FROM Seller ORDER BY cash DESC',
    );

    return (rows || []).reduce(
      (acc, currentValue) => ({
        ...acc,
        [currentValue.name]: JSON.parse(currentValue.cash_history),
      }),
      {},
    );
  }

  public async all(): Promise<Seller[]> {
    const rows = await this.db.all<SellerRow[]>(
      'SELECT * FROM Seller ORDER BY cash DESC',
    );

    return (rows || []).map((row) => this.mapSellerRowToSeller(row));
  }

  public async save(seller: Seller) {
    const maybeSeller = await this.get(seller.name);
    if (!maybeSeller) {
      await this.add(seller);
    } else {
      await this.update(seller);
    }
  }

  public async get(sellerName: string): Promise<Seller | undefined> {
    const row = await this.db.get<SellerRow>(
      'SELECT * FROM Seller WHERE name = ?',
      sellerName,
    );
    return this.mapSellerRowToSeller(row);
  }

  public async updateCash(
    sellerName: string,
    amount: Big,
    currentIteration: number,
  ) {
    const seller = await this.get(sellerName);

    if (!seller) {
      return;
    }

    seller.cash = new Big(seller.cash).add(amount).round(2).toNumber();
    await this.db.run(
      'UPDATE Seller SET cash = ? WHERE name = ?',
      seller.cash,
      sellerName,
    );

    await this.updateCashHistory(seller, currentIteration);
  }

  public async setOffline(sellerName: string) {
    return this.db.run(
      'UPDATE Seller SET online = ? WHERE name = ?',
      false,
      sellerName,
    );
  }

  public async setOnline(sellerName: string) {
    return this.db.run(
      'UPDATE Seller SET online = ? WHERE name = ?',
      true,
      sellerName,
    );
  }

  private async add(seller: Seller) {
    return this.db.run(
      'INSERT INTO Seller (name, password, url, cash, online, cash_history) VALUES (?, ?, ?, ?, ?, ?)',
      seller.name,
      seller.password,
      seller.url.toString(),
      seller.cash,
      seller.online,
      JSON.stringify([]),
    );
  }

  private async update(seller: Seller) {
    return this.db.run(
      'UPDATE Seller SET url = ? WHERE name = ?',
      seller.url.toString(),
      seller.name,
    );
  }

  private getLastRecordedCashAmount(
    currentSellersCashHistory: number[],
    lastRecordedIteration: number,
  ) {
    let lastRecordedValue =
      currentSellersCashHistory[lastRecordedIteration - 1];

    if (lastRecordedValue === undefined) {
      lastRecordedValue = 0;
    }

    return lastRecordedValue;
  }

  private enlargeHistory(newSize: number, oldHistory: number[]) {
    const newHistory = new Array<number>(newSize);
    return [...oldHistory, ...newHistory];
  }

  private fillMissingIterations(
    currentIteration: number,
    currentSellersCashHistory: number[],
  ) {
    const lastRecordedIteration = currentSellersCashHistory.length;

    if (lastRecordedIteration >= currentIteration) {
      return currentSellersCashHistory;
    }

    const newSellersCashHistory = this.enlargeHistory(
      currentIteration,
      currentSellersCashHistory,
    );
    const lastRecordedValue = this.getLastRecordedCashAmount(
      currentSellersCashHistory,
      lastRecordedIteration,
    );
    return _.fill(
      newSellersCashHistory,
      lastRecordedValue,
      lastRecordedIteration,
      currentIteration,
    );
  }

  private async updateCashHistory(seller: Seller, currentIteration: number) {
    const currentSellersCashHistory = await this.getSellerCashHistory(seller);
    const newSellersCashHistory = this.fillMissingIterations(
      currentIteration,
      currentSellersCashHistory,
    );
    newSellersCashHistory[currentIteration] = seller.cash;

    await this.db.run(
      'UPDATE Seller SET cash_history = ? WHERE name = ?',
      JSON.stringify(newSellersCashHistory),
      seller.name,
    );
  }

  private async getSellerCashHistory(seller: Seller): Promise<number[]> {
    const row = await this.db.get<{ cash_history: string }>(
      'SELECT cash_history FROM Seller WHERE name = ?',
      seller.name,
    );
    return row ? JSON.parse(row.cash_history) : [];
  }

  private mapSellerRowToSeller(row: SellerRow): Seller;
  private mapSellerRowToSeller(row: SellerRow | undefined): Seller | undefined;
  private mapSellerRowToSeller(row: any) {
    if (!row) {
      return undefined;
    }

    const { cash_history: cashHistory, ...sellerWithoutCashHistory } = row;
    return {
      ...sellerWithoutCashHistory,
      url: new URL(row.url),
      online: !!row.online,
    };
  }
}

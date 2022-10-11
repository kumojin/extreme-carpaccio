import _ from 'lodash';
import { Seller } from './Seller';

export default class Sellers {
  set cashHistory(value: Record<string, number[]>) {
    this._cashHistory = value;
  }

  get cashHistory() {
    return this._cashHistory;
  }

  private sellersMap: Record<string, Seller> = {};

  private _cashHistory: Record<string, number[]> = {};

  public all() {
    const sellers = _.map(this.sellersMap, (seller) => seller);
    return _.sortBy(sellers, (seller) => -seller.cash);
  }

  public save(seller: Seller) {
    if (this.sellersMap[seller.name] === undefined) {
      this.add(seller);
    } else {
      this.update(seller);
    }
  }

  public get(sellerName: string) {
    return this.sellersMap[sellerName];
  }

  public count() {
    return this.all().length;
  }

  public isEmpty() {
    return this.count() === 0;
  }

  public updateCash(
    sellerName: string,
    amount: number,
    currentIteration: number
  ) {
    const seller = this.get(sellerName);
    seller.cash += parseFloat(String(amount));
    this.updateCashHistory(seller, currentIteration);
  }

  setOffline(sellerName: string) {
    this.get(sellerName).online = false;
  }

  setOnline(sellerName: string) {
    this.get(sellerName).online = true;
  }

  private add(seller: Seller) {
    this.sellersMap[seller.name] = seller;
    this.cashHistory[seller.name] = [];
  }

  private update(seller: Seller) {
    const previousCash = this.sellersMap[seller.name].cash;
    this.sellersMap[seller.name] = seller;
    this.sellersMap[seller.name].cash = previousCash;
  }

  private getLastRecordedCashAmount(
    currentSellersCashHistory: number[],
    lastRecordedIteration: number
  ) {
    let lastRecordedValue =
      currentSellersCashHistory[lastRecordedIteration - 1];

    if (lastRecordedValue === undefined) {
      lastRecordedValue = 0;
    }

    return lastRecordedValue;
  }

  private enlargeHistory(newSize: number, oldHistory: number[]) {
    const newHistory = new Array(newSize);
    return [...oldHistory, ...newHistory];
  }

  private fillMissingIterations(
    currentIteration: number,
    currentSellersCashHistory: number[]
  ) {
    const lastRecordedIteration = currentSellersCashHistory.length;

    if (lastRecordedIteration >= currentIteration) {
      return currentSellersCashHistory;
    }

    const newSellersCashHistory = this.enlargeHistory(
      currentIteration,
      currentSellersCashHistory
    );
    const lastRecordedValue = this.getLastRecordedCashAmount(
      currentSellersCashHistory,
      lastRecordedIteration
    );
    return _.fill(
      newSellersCashHistory,
      lastRecordedValue,
      lastRecordedIteration,
      currentIteration
    );
  }

  private updateCashHistory(seller: Seller, currentIteration: number) {
    const currentSellersCashHistory = this.cashHistory[seller.name];
    const newSellersCashHistory = this.fillMissingIterations(
      currentIteration,
      currentSellersCashHistory
    );
    newSellersCashHistory[currentIteration] = seller.cash;
    this.cashHistory[seller.name] = newSellersCashHistory;
  }
}

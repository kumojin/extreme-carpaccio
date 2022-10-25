import colors from 'colors';
import _ from 'lodash';
import Configuration from '../../config';
import logger from '../../logger';
import { Seller } from '../../repositories';
import utils from '../../utils';
import OrderService from '../OrderService';
import Reductions, { Reduction } from '../reduction';
import SellerService from '../SellerService';
import BadRequest from './BadRequest';
import SellerCashUpdater from './SellerCashUpdater';

type Period = {
  reduction: Reduction;
  shoppingIntervalInMillis: number;
};

class Dispatcher {
  private readonly badRequest: BadRequest;

  private readonly sellerCashUpdater: SellerCashUpdater;

  private offlinePenalty: number;

  constructor(
    private readonly sellerService: SellerService,
    private readonly orderService: OrderService,
    private readonly configuration: Configuration
  ) {
    this.offlinePenalty = 0;
    this.badRequest = new BadRequest(configuration);
    this.sellerCashUpdater = new SellerCashUpdater(sellerService, orderService);
  }

  public sendOrderToSellers(
    reduction: Reduction,
    currentIteration: number,
    badRequest: boolean
  ) {
    const self = this;
    let order = self.orderService.createOrder(reduction);
    const expectedBill = self.orderService.bill(order, reduction);

    if (badRequest) {
      // Force any to be able to corrupt data
      order = self.badRequest.corruptOrder(order) as any;
    }

    self.sellerService.allSellers().forEach((seller) => {
      self.sellerService.addCash(seller, 0, currentIteration);
      let cashUpdater;

      if (badRequest) {
        cashUpdater = self.badRequest.updateSellersCash(
          self.sellerService,
          seller,
          expectedBill,
          currentIteration
        );
      } else {
        cashUpdater = self.sellerCashUpdater.doUpdate(
          seller,
          expectedBill,
          currentIteration
        );
      }

      const errorCallback = this.putSellerOffline(
        self,
        seller,
        currentIteration
      );
      self.orderService.sendOrder(seller, order, cashUpdater, errorCallback);
    });
  }

  public startBuying(iteration: number) {
    const reductionStrategy = this.getReductionStrategy();
    const period = this.getReductionPeriodFor(reductionStrategy);
    const badRequest = this.badRequest.shouldSendBadRequest(iteration);
    let message = `>>> Shopping iteration ${iteration}`;
    let nextIteration = iteration + 1;

    if (badRequest) {
      message += ' (bad request)';
    }

    if (this.shouldSendOrders(this)) {
      logger.info(colors.green(message));
      this.sendOrderToSellers(period.reduction, iteration, !!badRequest);
    } else {
      nextIteration = iteration;
      logger.info(colors.red('Order dispatching disabled'));
    }

    this.scheduleNextIteration(
      this,
      nextIteration,
      period.shoppingIntervalInMillis
    );
    return nextIteration;
  }

  private putSellerOffline(
    self: Dispatcher,
    seller: Seller,
    currentIteration: number
  ) {
    return () => {
      logger.error(
        colors.red(`Could not reach seller ${utils.stringify(seller)}`)
      );
      let { offlinePenalty } = self.getConfiguration(self);

      if (!_.isNumber(offlinePenalty)) {
        logger.warn(
          colors.yellow(
            'Offline penalty is missing or is not a number. Using 0.'
          )
        );
        offlinePenalty = 0;
      }

      self.sellerService.setOffline(seller, offlinePenalty, currentIteration);
    };
  }

  private getReductionStrategy(): string | undefined {
    const reductionStrategy = this.getConfiguration(this).reduction;
    if (Array.isArray(reductionStrategy)) {
      return reductionStrategy[
        Math.floor(Math.random() * reductionStrategy.length)
      ];
    }
    return reductionStrategy;
  }

  private getReductionPeriodFor(reductionStrategy?: string): Period {
    if (reductionStrategy === 'PAY THE PRICE') {
      return {
        reduction: Reductions.PAY_THE_PRICE,
        shoppingIntervalInMillis: 10000,
      };
    }

    if (reductionStrategy === 'HALF PRICE') {
      return {
        reduction: Reductions.HALF_PRICE,
        shoppingIntervalInMillis: 1000,
      };
    }

    if (reductionStrategy !== 'STANDARD') {
      logger.warn(
        colors.yellow(
          `Unknown reduction strategy ${reductionStrategy}. Using STANDARD.`
        )
      );
    }

    return { reduction: Reductions.STANDARD, shoppingIntervalInMillis: 5000 };
  }

  private scheduleNextIteration(
    self: Dispatcher,
    nextIteration: number,
    intervalInMillis: number
  ) {
    setTimeout(() => {
      self.startBuying(nextIteration);
    }, intervalInMillis);
  }

  private shouldSendOrders(self: Dispatcher) {
    const { active } = self.getConfiguration(self);
    return !!active;
  }

  private getConfiguration(self: Dispatcher) {
    return self.configuration.all();
  }
}
export default Dispatcher;

import { beforeEach, describe, it } from '@jest/globals';
import bodyParser from 'body-parser';
import express, { Express } from 'express';
import request from 'supertest';
import Configuration from './config';
import { Sellers } from './repositories';
import { buildWithDefaults } from './repositories/Seller';
import routes from './routes';
import { SellerService } from './services';

describe('Route', () => {
  let sellers: Sellers;
  let sellerService: SellerService;
  let configuration: Configuration;
  let app: Express;

  beforeEach(() => {
    configuration = new Configuration();
    sellers = new Sellers();
    sellerService = new SellerService(sellers, configuration);

    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use('/', routes(sellerService));
  });

  it('should register new seller', async () => {
    await request(app)
      .post('/seller')
      .set('Content-Type', 'application/json')
      .send({ name: 'john', password: 'doe', url: 'http://localhost:6000' })
      .expect(200);
  });

  it('should register existing seller with same password', async () => {
    const travis = buildWithDefaults({ name: 'john', password: 'doe' });
    sellers.save(travis);

    await request(app)
      .post('/seller')
      .send({ name: 'john', password: 'doe', url: 'http://localhost:6000' })
      .expect(200);
  });

  it('should not register existing seller with different password', async () => {
    const travis = buildWithDefaults({ name: 'john', password: 'doe' });
    sellers.save(travis);

    await request(app)
      .post('/seller')
      .send({ name: 'john', password: 'smith', url: 'http://localhost:6000' })
      .expect(401);
  });
});

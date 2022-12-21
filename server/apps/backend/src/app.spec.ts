import argon2 from 'argon2';
import bodyParser from 'body-parser';
import express, { Express } from 'express';
import request from 'supertest';
import Configuration from './config';
import { buildWithDefaults } from './fixtures';
import { Sellers } from './repositories';
import routes from './routes';
import { SellerService } from './services';

describe('Route', () => {
  let sellers: Sellers;
  let sellerService: SellerService;
  let configuration: Configuration;
  let app: Express;

  beforeEach(async () => {
    configuration = new Configuration();
    sellers = await Sellers.create(true);
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
    const travis = buildWithDefaults({
      name: 'john',
      password: await argon2.hash('doe'),
    });
    await sellers.save(travis);

    await request(app)
      .post('/seller')
      .send({ name: 'john', password: 'doe', url: 'http://localhost:6000' })
      .expect(200);
  });

  it('should not register existing seller with different password', async () => {
    const travis = buildWithDefaults({
      name: 'john',
      password: await argon2.hash('doe'),
    });
    await sellers.save(travis);

    await request(app)
      .post('/seller')
      .send({ name: 'john', password: 'smith', url: 'http://localhost:6000' })
      .expect(401);
  });
});

import path from 'node:path';
import bodyParser from 'body-parser';
import express from 'express';
import Configuration from './config';
import { Sellers } from './repositories';
import routes from './routes';
import { Dispatcher, OrderService, SellerService } from './services';

const CONFIGURATION_FILE = '../configuration.json';
const configuration = new Configuration(
  path.join(__dirname, CONFIGURATION_FILE)
);
const sellers = new Sellers();
const sellerService = new SellerService(sellers, configuration);
const orderService = new OrderService(configuration);
const dispatcher = new Dispatcher(sellerService, orderService, configuration);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', routes(sellerService));
app.use(express.static(path.join(__dirname, '../public')));

configuration.watch(() => {}, false, 500);
dispatcher.startBuying(1);

export default app;

import type { SalesHistory, Seller } from '../Seller.hook';
import { SellerView } from './SellerView';

type SellerViewContainerProps = {
  sellers: Seller[];
  salesHistory: SalesHistory;
};

const SellerViewContainer = ({
  sellers,
  salesHistory,
}: SellerViewContainerProps) => (
  <SellerView sellers={sellers} salesHistory={salesHistory} />
);

export default SellerViewContainer;

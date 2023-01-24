import { SalesHistory, Seller } from '../Seller.hook';

import { SellerView } from './SellerView';

interface SellerViewContainerProps {
  sellers: Seller[];
  salesHistory: SalesHistory;
}

const SellerViewContainer = ({
  sellers,
  salesHistory,
}: SellerViewContainerProps): JSX.Element => (
  <SellerView sellers={sellers} salesHistory={salesHistory} />
);

export default SellerViewContainer;

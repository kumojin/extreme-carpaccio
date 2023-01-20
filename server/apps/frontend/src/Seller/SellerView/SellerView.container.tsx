import React from 'react';
import { SellerView } from './SellerView';
import { SalesHistory, Seller } from '../Seller.hook';

type SellerViewContainerProps = {
  sellers: Seller[];
  salesHistory: SalesHistory;
};

const SellerViewContainer = ({
  sellers,
  salesHistory,
}: SellerViewContainerProps) => {
  return <SellerView sellers={sellers} salesHistory={salesHistory} />;
};

export default SellerViewContainer;

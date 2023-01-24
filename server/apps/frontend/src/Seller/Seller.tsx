import { useHistory, useSeller } from './Seller.hook';
import SellerForm from './SellerForm';
import SellerView from './SellerView';

export const Seller = (): JSX.Element => {
  const { sellers, addSeller } = useSeller();
  const { salesHistory } = useHistory();

  return (
    <div className="container">
      <SellerForm addSeller={addSeller} />
      <SellerView sellers={sellers} salesHistory={salesHistory} />
    </div>
  );
};

import SellerForm from './SellerForm';
import SellerView from './SellerView';
import { useHistory, useSeller } from './Seller.hook';

export const Seller = () => {
  const { sellers, addSeller} = useSeller();
  const { salesHistory } = useHistory();
  
  return (
    <div className="container">
      <SellerForm addSeller={addSeller} />
      <SellerView sellers={sellers} salesHistory={salesHistory}/>
    </div>
  );
};

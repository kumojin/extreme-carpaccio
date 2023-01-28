import { AddSellerType } from '../Seller.hook';
import { SellerForm } from './SellerForm';
import { useForm } from './SellerFrom.hook';

interface SellerFormContainerProps {
  addSeller: AddSellerType;
}

const SellerFormContainer = ({ addSeller }: SellerFormContainerProps) => {
  const { nameRef, passwordRef, urlRef, handleSubmit, errorForm } =
    useForm(addSeller);

  return (
    <SellerForm
      nameRef={nameRef}
      passwordRef={passwordRef}
      urlRef={urlRef}
      handleSubmit={handleSubmit}
      errorForm={errorForm}
    />
  );
};

export default SellerFormContainer;

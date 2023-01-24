import { AddSellerType } from '../Seller.hook';

import { SellerForm } from './SellerForm';
import { useForm } from './SellerFrom.hook';

interface SellerFormContainerProps {
  addSeller: AddSellerType;
}

const SellerFormContainer = ({
  addSeller,
}: SellerFormContainerProps): JSX.Element => {
  const { nameRef, passwordRef, urlRef, handleSubmit, isError } =
    useForm(addSeller);

  return (
    <SellerForm
      nameRef={nameRef}
      passwordRef={passwordRef}
      urlRef={urlRef}
      handleSubmit={handleSubmit}
      isError={isError}
    />
  );
};

export default SellerFormContainer;

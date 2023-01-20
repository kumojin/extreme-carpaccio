import React from 'react';
import { SellerForm } from './SellerForm';
import { useForm } from './SellerFrom.hook';
import { AddSellerType } from '../Seller.hook';

type SellerFormContainerProps = {
  addSeller: AddSellerType;
};

const SellerFormContainer = ({ addSeller }: SellerFormContainerProps) => {
  const { nameRef, passwordRef, urlRef, handleSubmit } = useForm(addSeller);

  return (
    <SellerForm
      nameRef={nameRef}
      passwordRef={passwordRef}
      urlRef={urlRef}
      handleSubmit={handleSubmit}
    />
  );
};

export default SellerFormContainer;

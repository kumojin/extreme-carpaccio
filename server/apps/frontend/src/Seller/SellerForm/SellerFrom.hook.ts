import React, { FormEvent, RefObject } from 'react';
import { useMutation } from 'react-query';

import { AddSellerType, SellerForm } from '../Seller.hook';

export const useForm = (
  addSeller: AddSellerType
): {
  nameRef: RefObject<HTMLInputElement>;
  passwordRef: RefObject<HTMLInputElement>;
  urlRef: RefObject<HTMLInputElement>;
  handleSubmit: (event: FormEvent) => void;
  isError: boolean;
} => {
  const nameRef: RefObject<HTMLInputElement> = React.useRef(null);
  const passwordRef: RefObject<HTMLInputElement> = React.useRef(null);
  const urlRef: RefObject<HTMLInputElement> = React.useRef(null);
  const [isError, setIsError] = React.useState<boolean>(false);

  const addSellerMutation = useMutation(async (newSeller: SellerForm) => {
    return fetch('/seller', {
      method: 'POST',
      body: new URLSearchParams(newSeller),
    });
  });

  const handleSubmit = (event: FormEvent): void => {
    const name = nameRef.current?.value;
    const password = passwordRef.current?.value;
    const url = urlRef.current?.value;
    setIsError(false);

    event.preventDefault();
    if (!name || !url || !password) {
      setIsError(true);
      return;
    }

    addSellerMutation.mutate(
      { name, password, url },
      {
        onSuccess: async (response) => {
          if (!response.ok) {
            setIsError(true);
            console.error('/seller', response.statusText);
          } else {
            addSeller({ name, cash: 0, online: true });
          }
        },
        onError: async (err) => {
          setIsError(true);
          console.error('/seller', err);
        },
      }
    );

    nameRef.current.value = '';
    urlRef.current.value = '';
    passwordRef.current.value = '';
  };

  return { nameRef, passwordRef, urlRef, handleSubmit, isError };
};

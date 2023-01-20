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
} => {
  const nameRef: RefObject<HTMLInputElement> = React.useRef(null);
  const passwordRef: RefObject<HTMLInputElement> = React.useRef(null);
  const urlRef: RefObject<HTMLInputElement> = React.useRef(null);

  const addSellerMutation = useMutation((newSeller: SellerForm) => {
    return fetch('/seller', {
      method: 'POST',
      body: new URLSearchParams(newSeller),
    });
  });

  const handleSubmit = (event: FormEvent) => {
    const name = nameRef.current?.value;
    const password = passwordRef.current?.value;
    const url = urlRef.current?.value;

    event.preventDefault();
    if (!name || !url) {
      return;
    }

    addSellerMutation.mutate(
      { name, password: password ?? '', url },
      {
        onSuccess: async (response) => {
          if (!response.ok) {
            console.error('/seller', response.statusText);
          }
          addSeller({ name: name, cash: 0, online: true });
        },
        //TODO to fix the any type
        onError: async (err: any) => {
          console.error('/seller', err.toString());
        },
      }
    );
    nameRef.current.value = '';
    urlRef.current.value = '';
    if (passwordRef.current) {
      passwordRef.current.value = '';
    }
  };

  return { nameRef, passwordRef, urlRef, handleSubmit };
};

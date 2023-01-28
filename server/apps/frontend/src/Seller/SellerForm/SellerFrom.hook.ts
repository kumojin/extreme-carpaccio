import React, { FormEvent, RefObject } from 'react';
import { useMutation } from 'react-query';
import { AddSellerType, SellerForm } from '../Seller.hook';

export type ErrorFormType = {
  hasError: boolean;
  message: string;
};
export const useForm = (
  addSeller: AddSellerType
): {
  nameRef: RefObject<HTMLInputElement>;
  passwordRef: RefObject<HTMLInputElement>;
  urlRef: RefObject<HTMLInputElement>;
  handleSubmit: (event: FormEvent) => void;
  errorForm: ErrorFormType;
} => {
  const nameRef: RefObject<HTMLInputElement> = React.useRef(null);
  const passwordRef: RefObject<HTMLInputElement> = React.useRef(null);
  const urlRef: RefObject<HTMLInputElement> = React.useRef(null);
  const initErrorFormState = {
    hasError: false,
    message: '',
  };
  const [errorForm, setErrorForm] =
    React.useState<ErrorFormType>(initErrorFormState);

  const addSellerMutation = useMutation(async (newSeller: SellerForm) =>
    fetch('/seller', {
      method: 'POST',
      body: new URLSearchParams(newSeller),
    })
  );

  const handleSubmit = (event: FormEvent): void => {
    const name = nameRef.current?.value;
    const password = passwordRef.current?.value;
    const url = urlRef.current?.value;
    setErrorForm(initErrorFormState);

    event.preventDefault();
    if (!name || !url || !password) {
      setErrorForm({
        hasError: true,
        message: 'There is at least one missing information',
      });
      return;
    }

    addSellerMutation.mutate(
      { name, password, url },
      {
        onSuccess: async (response) => {
          if (!response.ok) {
            setErrorForm({
              hasError: true,
              message: `The is a warning : ${response.statusText}`,
            });
            console.error('/seller', response.statusText);
          } else {
            addSeller({ name, cash: 0, online: true });
          }
        },
        onError: async (err) => {
          setErrorForm({
            hasError: true,
            message: `The is a an error : ${err}`,
          });
          console.error('/seller', err);
        },
      }
    );

    nameRef.current.value = '';
    urlRef.current.value = '';
    passwordRef.current.value = '';
  };

  return { nameRef, passwordRef, urlRef, handleSubmit, errorForm };
};

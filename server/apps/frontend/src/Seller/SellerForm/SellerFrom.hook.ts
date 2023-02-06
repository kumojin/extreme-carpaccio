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
    if (!name) {
      setErrorForm({
        hasError: true,
        message: 'name is required',
      });
      return;
    }
    if (!password) {
      setErrorForm({
        hasError: true,
        message: 'password is required',
      });
      return;
    }
    if (!url) {
      setErrorForm({
        hasError: true,
        message: 'url is required',
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
              message: 'An error occurred during registration',
            });
          } else {
            addSeller({ name, cash: 0, online: true });
          }
        },
        onError: async (err) => {
          setErrorForm({
            hasError: true,
            message: `An error occured during registration: ${err}`,
          });
        },
      }
    );

    nameRef.current.value = '';
    urlRef.current.value = '';
    passwordRef.current.value = '';
  };

  return { nameRef, passwordRef, urlRef, handleSubmit, errorForm };
};

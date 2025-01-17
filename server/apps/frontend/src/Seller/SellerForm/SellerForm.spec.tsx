import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ErrorFormType } from './SellerFrom.hook';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SellerForm } from './SellerForm';

const handleSubmitMock = vi.fn();
const nameRef = createRef<HTMLInputElement>();
const passwordRef = createRef<HTMLInputElement>();
const urlRef = createRef<HTMLInputElement>();

describe('SellerForm', () => {
  it('should render the form correctly', () => {
    render(
      <SellerForm
        handleSubmit={handleSubmitMock}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: false, message: '' }}
      />,
    );

    expect(screen.getByPlaceholderText('your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('http://192.168.1.1:3000'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /register/i }),
    ).toBeInTheDocument();
  });

  it('should call handleSubmit on form submission', async () => {
    render(
      <SellerForm
        handleSubmit={handleSubmitMock}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: false, message: '' }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('your name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('http://192.168.1.1:3000'), {
      target: { value: 'http://localhost:3000' },
    });

    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should display error message when errorForm hasError is true', () => {
    const errorForm: ErrorFormType = {
      hasError: true,
      message: 'Invalid form submission',
    };

    render(
      <SellerForm
        handleSubmit={handleSubmitMock}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={errorForm}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Invalid form submission',
    );
  });

  it('should pass correct values to refs when form is filled', () => {
    render(
      <SellerForm
        handleSubmit={handleSubmitMock}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: false, message: '' }}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('your name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('http://192.168.1.1:3000'), {
      target: { value: 'http://localhost:3000' },
    });

    expect(nameRef.current?.value).toBe('John');
    expect(passwordRef.current?.value).toBe('password123');
    expect(urlRef.current?.value).toBe('http://localhost:3000');
  });
});

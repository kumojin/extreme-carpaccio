import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, describe, test, expect, vi } from 'vitest';

import { SellerForm } from './SellerForm';
vi.mock('react', () => {
  const mUseRef = vi.fn();
  return {
    ...vi.importActual('react'),
    useRef: mUseRef,
  };
});

describe('SellerForm', () => {
  const handleSubmitFn = vi.fn((e) => e.preventDefault());
  const nameRef = useRef(null);
  const passwordRef = useRef(null);
  const urlRef = useRef(null);

  it('should render shellerForm without error', () => {
    // ARRANGE
    const { baseElement } = render(
      <SellerForm
        handleSubmit={handleSubmitFn}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: false, message: 'error' }}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('should render shellerForm with error', () => {
    // ARRANGE
    const { baseElement } = render(
      <SellerForm
        handleSubmit={handleSubmitFn}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: true, message: 'Warning: There is an error.' }}
      />
    );
    expect(baseElement).toMatchSnapshot();
    expect(screen.getByRole('alert').textContent).toBe(
      'Warning: There is an error.'
    );
  });

  test('should handleSubmit is called when I click on the button', async () => {
    render(
      <SellerForm
        handleSubmit={handleSubmitFn}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        errorForm={{ hasError: true, message: 'Warning: There is an error.' }}
      />
    );
    const user = userEvent.setup();
    await user.type(screen.getByText(/url/i), 'http://196.234.1.1:6000');
    await user.type(screen.getByText(/password/i), 'P4ssw0rd');
    await user.type(screen.getByText(/name/i), 'Jessica');
    await user.click(screen.getByText('Register'));
    expect(handleSubmitFn).toHaveBeenCalledOnce();
  });
});

import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';
import { SellerForm } from '../SellerForm';

jest.mock('react', () => {
  const originReact = jest.requireActual('react');
  const mUseRef = jest.fn();
  return {
    ...originReact,
    useRef: mUseRef,
  };
});

describe('SellerForm', () => {
  const handleSubmit = jest.fn();
  const nameRef = useRef(null);
  const passwordRef = useRef(null);
  const urlRef = useRef(null);

  test('should render shellerForm without error', () => {
    // ARRANGE
    const { baseElement } = render(
      <SellerForm
        handleSubmit={handleSubmit}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        isError={false}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('should render shellerForm with error', () => {
    // ARRANGE
    const { baseElement } = render(
      <SellerForm
        handleSubmit={handleSubmit}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        isError={true}
      />
    );
    expect(baseElement).toMatchSnapshot();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Warning: There is an error.'
    );
  });

  test('should handleSubmit is called when I click on the button', async () => {
    render(
      <SellerForm
        handleSubmit={handleSubmit}
        nameRef={nameRef}
        passwordRef={passwordRef}
        urlRef={urlRef}
        isError={true}
      />
    );

    await userEvent.click(screen.getByText('Register'));
    expect(handleSubmit).toBeCalled();
  });
});

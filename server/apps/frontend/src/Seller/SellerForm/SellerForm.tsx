import { FormEvent, RefObject } from 'react';

type SellerFormProps = {
  handleSubmit: (event: FormEvent) => void;
  nameRef: RefObject<HTMLInputElement>;
  passwordRef: RefObject<HTMLInputElement>;
  urlRef: RefObject<HTMLInputElement>;
  isError: boolean;
};

export const SellerForm = ({
  handleSubmit,
  nameRef,
  passwordRef,
  urlRef,
  isError,
}: SellerFormProps): JSX.Element => (
  <div className="App">
    <div className="container-fluid text-sm-center p-5 mb-5 bg-light">
      <h2 className="p-3">Hello, Seller!</h2>
      <form onSubmit={handleSubmit}>
        <div className="row d-flex align-items-end justify-content-center">
          <div className="col-auto text-sm-start">
            <label htmlFor="name" className="sr-only p-1">
              Name
            </label>
            <input
              type="text"
              placeholder="your name"
              className="form-control"
              ref={nameRef}
              data-toggle="tooltip"
              data-placement="bottom"
              title="Your username"
            />
          </div>
          <div className="col-auto text-sm-start">
            <label htmlFor="password" className="sr-only p-1">
              Password
            </label>
            <input
              type="password"
              placeholder="your password"
              className="form-control"
              ref={passwordRef}
              data-toggle="tooltip"
              data-placement="bottom"
              title="Password is used if you want to register yourself on a different url. You will need to provide the same username with the same password. Beware that there is nothing that can be done to retrieve it..."
            />
          </div>
          <div className="col-auto text-sm-start">
            <label htmlFor="url" className="sr-only p-1">
              URL
            </label>
            <input
              type="text"
              placeholder="http://192.168.1.1:3000"
              className="form-control"
              ref={urlRef}
              data-toggle="tooltip"
              data-placement="bottom"
              title="Base url of your own client"
            />
          </div>
          <div className="col-auto align-self-end">
            <button type="submit" className="btn btn-success">
              Register
            </button>
          </div>
        </div>
      </form>
    </div>
    {isError ? (
      <div className="alert alert-danger" role="alert">
        Warning: There is an error.
      </div>
    ) : (
      <></>
    )}
  </div>
);

import type { ValidationError } from 'joi';

const hasMessage = (error: unknown): error is Error => {
  if (typeof error === 'object' && error) {
    return 'message' in error;
  }
  return false;
};

export const messageFromError = (error: unknown): string =>
  hasMessage(error) ? error.message : 'Unknown error';

export const messageFromValidationError = (error: ValidationError): string =>
  error.details.map((it) => it.message).join(', ');

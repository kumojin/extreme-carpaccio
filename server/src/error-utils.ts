const hasMessage = (error: unknown): error is Error => {
  if (typeof error === 'object' && error) {
    return 'message' in error;
  }
  return false;
};

export const messageFromError = (error: unknown): string =>
  hasMessage(error) ? error.message : 'Unknown error';

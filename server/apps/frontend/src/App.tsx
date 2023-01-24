import { QueryClient, QueryClientProvider } from 'react-query';

import { Seller } from './Seller/Seller';

import './App.css';

const queryClient = new QueryClient();

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Seller />
    </QueryClientProvider>
  );
}

export default App;
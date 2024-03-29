import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Seller } from './Seller/Seller';
import './App.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Seller />
  </QueryClientProvider>
);

export default App;

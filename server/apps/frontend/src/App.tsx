import './App.css';
import { Seller } from './Seller/Seller';
import { QueryClientProvider, QueryClient } from 'react-query';
//Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Seller />;
    </QueryClientProvider>
  );
}

export default App;

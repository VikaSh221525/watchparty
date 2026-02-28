import { BrowserRouter } from 'react-router';
import { ClerkProvider } from '@clerk/clerk-react';
import MainRoutes from './routes/MainRoutes';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;

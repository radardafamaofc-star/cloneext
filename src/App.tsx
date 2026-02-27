import { Toaster } from 'sonner';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(0 0% 7%)',
            border: '1px solid hsl(0 0% 14%)',
            color: 'hsl(0 0% 93%)',
          },
        }}
      />
      <Dashboard />
    </>
  );
}

export default App;

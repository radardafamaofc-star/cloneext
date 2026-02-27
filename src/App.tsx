import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}

export default App;

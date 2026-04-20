import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Designer from "@/pages/Designer";
import { ThemeProvider } from "@/hooks/useTheme";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Designer />} />
            <Route path="*" element={<Designer />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    </ThemeProvider>
  );
}

export default App;

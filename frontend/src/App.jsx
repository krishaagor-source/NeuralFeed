import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import News from "./pages/News";
import CategoryPage from "./pages/CategoryPage";

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"                  element={<Home />} />
          <Route path="/news"              element={<News />} />
          <Route path="/category/:slug"    element={<CategoryPage />} />
          {/* Fallback */}
          <Route path="*"                  element={<Home />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
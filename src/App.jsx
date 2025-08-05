// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import RegisterForm from "./components/RegisterForm";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import Checkout from "./pages/Checkout";

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;

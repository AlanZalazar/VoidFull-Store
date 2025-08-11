// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";

import Login from "./pages/Login";
import RegisterForm from "./components/RegisterForm";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutFailure from "./pages/CheckoutFailure";
import CheckoutPending from "./pages/CheckoutPending";
import MisCompras from "./pages/MisCompras";
import Perfil from "./pages/Perfil";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import ProductForm from "./components/ProductForm";
import UserForm from "./components/UserForm";
import LoginFormAdmin from "./components/LoginFormAdmin";
import HomeEditorLayout from "./pages/admin/HomeEditorLayout";
import AdminCarruselEditor from "./pages/admin/AdminCarruselEditor";
import CarruselPage from "./pages/CarruselPage";

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<LoginFormAdmin />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />
        <Route path="/checkout-failure" element={<CheckoutFailure />} />
        <Route path="/checkout-pending" element={<CheckoutPending />} />
        <Route path="/mis-compras" element={<MisCompras />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/carrusel" element={<CarruselPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/edit/:id" element={<UserForm />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="carruselIzquierdo" element={<AdminCarruselEditor />} />

          <Route path="home" element={<HomeEditorLayout />}>
            <Route index element={<Home editable={true} />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;

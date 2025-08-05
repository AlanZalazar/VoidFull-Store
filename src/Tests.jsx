import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Tests() {
  const [user, setUser] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Login
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setMensaje(error.message);
    setUser(data.user);
    setMensaje("Logueado como: " + email);
  }

  // Ver productos
  async function verProductos() {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return setMensaje(error.message);
    setProductos(data);
  }

  // Crear pedido
  async function crearPedido() {
    const { data, error } = await supabase
      .from("orders")
      .insert([{ user_id: user.id, total: 100 }])
      .select();
    if (error) return setMensaje(error.message);
    setPedidos(data);
  }

  // Ver mis pedidos
  async function verPedidos() {
    const { data, error } = await supabase.from("orders").select("*");
    if (error) return setMensaje(error.message);
    setPedidos(data);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Panel de Test Supabase</h1>

      <div className="space-x-2">
        <button
          onClick={() => login("admin@test.com", "admin123")}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Login Admin
        </button>
        <button
          onClick={() => login("mod@test.com", "mod123")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login Mod
        </button>
        <button
          onClick={() => login("cliente@test.com", "12345678")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Login Cliente
        </button>
      </div>

      <div className="space-x-2">
        <button
          onClick={verProductos}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Ver Productos
        </button>
        <button
          onClick={crearPedido}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Crear Pedido
        </button>
        <button
          onClick={verPedidos}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Ver Mis Pedidos
        </button>
      </div>

      <p className="text-sm text-gray-700">{mensaje}</p>

      <div>
        <h2 className="text-xl font-semibold">Productos:</h2>
        <pre>{JSON.stringify(productos, null, 2)}</pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Pedidos:</h2>
        <pre>{JSON.stringify(pedidos, null, 2)}</pre>
      </div>
    </div>
  );
}

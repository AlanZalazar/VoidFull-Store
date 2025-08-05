import ProductForm from "../components/ProductForm";

function Admin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Panel de administrador</h1>
      <ProductForm />
    </div>
  );
}

export default Admin;

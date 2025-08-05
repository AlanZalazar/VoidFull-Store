import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function ProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        imageUrl,
        active: true,
        createdAt: new Date(),
      });

      alert("Producto agregado ✅");
      setName("");
      setPrice("");
      setImageUrl("");
    } catch (err) {
      console.error(err);
      alert("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded p-6 space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold">Agregar producto</h2>

      <input
        type="text"
        placeholder="Nombre del producto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <input
        type="url"
        placeholder="URL de la imagen"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}

export default ProductForm;

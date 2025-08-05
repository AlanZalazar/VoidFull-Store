import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-lg shadow p-4">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={() => {
          console.log("Agregando producto:", product);
          addToCart(product);
        }}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Agregar al carrito
      </button>
    </div>
  );
}

export default ProductCard;

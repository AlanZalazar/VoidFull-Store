export default function CheckoutSuccess() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold text-green-600">¡Pago exitoso!</h1>
        <p className="mt-2">Tu pedido fue procesado correctamente.</p>
      </div>
    </div>
  );
}

import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    console.log(
      "🔑 Access Token:",
      process.env.MP_ACCESS_TOKEN ? "Cargado ✅" : "No encontrado ❌"
    );
    console.log("📦 Body recibido:", req.body);

    // Inicializar el cliente
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new mercadopago.Preference(client);

    const { items } = req.body;

    const body = {
      items: items.map((item) => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: "ARS",
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/checkout-success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/checkout-failure`,
        pending: `${process.env.NEXT_PUBLIC_URL}/checkout-pending`,
      },
      auto_return: "approved",
    };

    console.log("📤 Enviando preferencia a MP:", body);

    const response = await preference.create({ body });

    console.log("✅ Preferencia creada:", response);

    return res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res
      .status(500)
      .json({ error: "Error creando preferencia", details: error.message });
  }
}

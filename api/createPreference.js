import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Inicializar cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const { items } = req.body;

    const body = {
      items: items.map((item) => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: "ARS",
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/checkout-success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/checkout-failure`,
        pending: `${process.env.NEXT_PUBLIC_URL}/checkout-pending`,
      },
      auto_return: "approved",
    };

    const response = await preference.create({ body });

    return res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

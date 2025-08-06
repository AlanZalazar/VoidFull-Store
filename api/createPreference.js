import mercadopago from "mercadopago";
import { dbAdmin } from "../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Carrito vacío" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Usuario no autenticado" });
    }

    // Configurar MercadoPago
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const preference = {
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
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/mpWebhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    // Guardar la orden en Firebase
    const orderRef = dbAdmin.collection("orders").doc();
    await orderRef.set({
      userId,
      items,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: "pending",
      paymentId: response.body.id,
      createdAt: new Date(),
    });

    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

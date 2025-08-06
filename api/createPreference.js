// api/createPreference.js
import mercadopago from "mercadopago";
import { dbAdmin } from "../lib/firebaseAdmin"; // 👈 importa la versión admin

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No se enviaron productos" });
    }
    if (!userId) {
      return res.status(400).json({ error: "Falta userId" });
    }

    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    // Crear preferencia
    const preference = await mercadopago.preferences.create({
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
    });

    // Guardar la orden en Firestore (estado pending)
    const orderRef = dbAdmin.collection("orders").doc();
    await orderRef.set({
      userId,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      preferenceId: preference.body.id,
      createdAt: new Date(),
    });

    return res.status(200).json({ init_point: preference.body.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

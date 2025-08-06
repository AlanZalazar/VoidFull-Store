import mercadopago from "mercadopago";
import { db } from "../firebaseAdmin.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new mercadopago.Preference(client);

    const { items, userId } = req.body;

    // Calcular el total de la compra
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

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

    // Crear preferencia en Mercado Pago
    const response = await preference.create({ body });

    // Guardar la orden en Firebase con estado inicial "pending"
    await addDoc(collection(db, "orders"), {
      userId: userId || "anonimo",
      items,
      total,
      status: "pending",
      paymentId: response.id,
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

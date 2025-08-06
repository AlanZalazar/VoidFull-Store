// /api/createPreference.js
import { MercadoPagoConfig, Preference } from "mercadopago";
import admin from "firebase-admin";

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { items, userId } = req.body;

    // creamos orden temporal en Firestore
    const orderRef = await db.collection("tempOrders").add({
      userId: userId || "guest",
      items,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

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
      external_reference: orderRef.id, // 👈 solo mandamos el ID, no todo el carrito
    };

    const response = await preference.create({ body });

    return res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

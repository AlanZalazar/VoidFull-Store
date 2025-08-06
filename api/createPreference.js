import { MercadoPagoConfig, Preference } from "mercadopago";
import { v4 as uuidv4 } from "uuid";
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
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const { items, userId } = req.body;

    const orderId = uuidv4(); // ID único para la orden

    // Guardamos la orden en Firestore con estado "pending"
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    await db
      .collection("orders")
      .doc(orderId)
      .set({
        userId: userId || "guest",
        items,
        total,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    const body = {
      items: items.map((item) => ({
        title: item.name,
        description: item.description || "Producto de Voidfull Store",
        unit_price: Math.max(1, Number(item.price)),
        quantity: Number(item.quantity),
        currency_id: "ARS",
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/checkout-success?orderId=${orderId}`,
        failure: `${process.env.NEXT_PUBLIC_URL}/checkout-failure?orderId=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_URL}/checkout-pending?orderId=${orderId}`,
      },
      auto_return: "approved",
      external_reference: orderId,
    };

    const response = await preference.create({ body });

    return res.status(200).json({ init_point: response.init_point });
  } catch (error) {
    console.error("❌ Error al crear preferencia:", error);
    return res.status(500).json({ error: "Error creando preferencia" });
  }
}

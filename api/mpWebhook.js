// /api/mpWebhook.js
import { MercadoPagoConfig, Payment } from "mercadopago";
import admin from "firebase-admin";

// Inicializar Firebase Admin (importante: credenciales con service account)
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
    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(400).json({ error: "Falta paymentId" });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const payment = new Payment(client);

    // obtener detalles del pago desde MP
    const paymentInfo = await payment.get({ id: paymentId });

    const { status, id, external_reference, transaction_amount, payer } =
      paymentInfo;

    // recuperar carrito y userId desde external_reference
    let userId = "guest";
    let items = [];
    try {
      const refData = JSON.parse(external_reference);
      userId = refData.userId || "guest";
      items = refData.cart || [];
    } catch (err) {
      console.error("Error parseando external_reference:", err);
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // guardar orden en Firestore
    await db
      .collection("orders")
      .doc(String(id))
      .set({
        userId,
        items,
        total,
        status,
        paymentId: id,
        payer: payer?.email || "desconocido",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

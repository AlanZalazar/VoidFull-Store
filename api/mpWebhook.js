// /api/mpWebhook.js
import { MercadoPagoConfig, Payment } from "mercadopago";
import admin from "firebase-admin";

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
    const paymentInfo = await payment.get({ id: paymentId });

    const { status, id, external_reference, payer } = paymentInfo;

    const orderRef = db.collection("tempOrders").doc(external_reference);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error("No se encontró la orden temporal");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const orderData = orderSnap.data();
    const total = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Guardamos en la colección final de orders
    await db
      .collection("orders")
      .doc(String(id))
      .set({
        ...orderData,
        total,
        status,
        paymentId: id,
        payer: payer?.email || "desconocido",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Eliminamos la temporal
    await orderRef.delete();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

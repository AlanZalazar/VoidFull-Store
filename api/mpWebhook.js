import mercadopago from "mercadopago";
import { dbAdmin } from "../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const payment = req.body;

    if (!payment || !payment.data || !payment.data.id) {
      return res.status(400).json({ error: "Notificación inválida" });
    }

    const paymentInfo = await mercadopago.payment.findById(payment.data.id);
    const { status, id } = paymentInfo.response;

    // Buscar la orden relacionada
    const ordersRef = dbAdmin.collection("orders");
    const snapshot = await ordersRef.where("paymentId", "==", id).get();

    if (!snapshot.empty) {
      const orderDoc = snapshot.docs[0].ref;
      await orderDoc.update({ status });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

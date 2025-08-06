import mercadopago from "mercadopago";
import { db } from "../lib/firebaseAdmin";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  console.log("📩 Webhook recibido:", req.body);

  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId) {
      console.log("❌ No llegó paymentId");
      return res.status(400).json({ error: "No se recibió paymentId" });
    }

    // SDK nueva
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const payment = new mercadopago.Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    const { status, id, transaction_amount, payer } = paymentInfo;

    const orderRef = doc(db, "orders", id.toString());
    const snap = await getDoc(orderRef);

    if (snap.exists()) {
      await updateDoc(orderRef, { status });
    } else {
      await setDoc(orderRef, {
        paymentId: id.toString(),
        status,
        total: transaction_amount,
        payerEmail: payer?.email,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

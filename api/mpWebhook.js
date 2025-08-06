import { db } from "../src/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId)
      return res.status(400).json({ error: "No se recibió paymentId" });

    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

    const paymentInfo = await mercadopago.payment.findById(paymentId);
    const { status, id, transaction_amount, external_reference } =
      paymentInfo.response;

    const orderRef = doc(db, "orders", id.toString());
    const snap = await getDoc(orderRef);

    if (snap.exists()) {
      await updateDoc(orderRef, { status });
    } else {
      await setDoc(orderRef, {
        paymentId: id.toString(),
        userId: external_reference,
        status,
        total: transaction_amount,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

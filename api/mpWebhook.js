import { db } from "../src/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      mercadopago.configure({
        access_token: process.env.MP_ACCESS_TOKEN,
      });

      const { type, data } = req.body;

      // Mercado Pago te avisa qué tipo de evento fue
      if (type === "payment") {
        // Buscar info del pago
        const payment = await mercadopago.payment.findById(data.id);
        const info = payment.response;

        // Guardar la orden en Firestore
        await addDoc(collection(db, "orders"), {
          paymentId: info.id,
          status: info.status,
          total: info.transaction_amount,
          payer: info.payer.email,
          items: info.additional_info?.items || [],
          createdAt: serverTimestamp(),
        });
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Error en webhook:", error);
      return res.status(500).json({ error: "Error procesando webhook" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}

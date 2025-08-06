import { db } from "../src/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: data.id });

      if (paymentDetails.status === "approved") {
        const { metadata } = paymentDetails;

        const orderData = {
          userId: metadata.userId,
          items: JSON.parse(metadata.cart),
          total: Number(metadata.total),
          paymentId: data.id,
          status: "completed",
          shippingDetails: null, // Puedes añadir esto después
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "orders"), orderData);
      }

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
}

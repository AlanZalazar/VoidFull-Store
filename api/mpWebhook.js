import { db } from "../src/firebase";
import { doc, updateDoc } from "firebase/firestore";
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Configurar credenciales
      mercadopago.configure({
        access_token: process.env.MP_ACCESS_TOKEN,
      });

      const payment = req.body;

      // Obtenemos información del pago
      const paymentInfo = await mercadopago.payment.findById(payment.data.id);

      const { status, id } = paymentInfo.response;

      // Buscamos la orden que tenga ese paymentId
      const orderRef = doc(db, "orders", id.toString()); // ojo acá, depende de cómo guardaste paymentId
      await updateDoc(orderRef, {
        status,
      });

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error en webhook:", error);
      return res.status(500).json({ error: "Error procesando webhook" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}

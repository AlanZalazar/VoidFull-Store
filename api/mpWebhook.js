import { db } from "../src/firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Configurar credenciales
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.status(400).json({ error: "No se recibió paymentId" });
    }

    // Buscar info del pago en Mercado Pago
    const paymentInfo = await mercadopago.payment.findById(paymentId);
    const { status, id, transaction_amount, additional_info } =
      paymentInfo.response;

    // Generar referencia al documento
    const orderRef = doc(db, "orders", id.toString());
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      // Si ya existe, solo actualizamos el estado
      await updateDoc(orderRef, { status });
    } else {
      // Si no existe, la creamos con todos los datos
      await setDoc(orderRef, {
        paymentId: id.toString(),
        status,
        total: transaction_amount,
        items: additional_info?.items || [],
        createdAt: new Date(),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ error: "Error procesando webhook" });
  }
}

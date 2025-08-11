import { useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aquí deberías implementar el envío real del formulario
      // Por ejemplo, usando Firebase Functions o un servicio de email
      console.log("Datos del formulario:", formData);

      // Simulamos un envío con retraso
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitMessage("¡Gracias por tu mensaje! Te responderé pronto.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setSubmitMessage(
        "Hubo un error al enviar tu mensaje. Por favor intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(""), 5000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sección de información */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Mi Empresa</h3>
            <p className="text-gray-400">
              Creando soluciones digitales innovadoras para hacer crecer tu
              negocio.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Servicios
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Portafolio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                <span className="text-gray-400">
                  123 Calle Principal, Ciudad, País
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-400">+1 234 567 890</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-400">contacto@miempresa.com</span>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Escríbeme</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Tu email"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tu mensaje"
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
              </button>
              {submitMessage && (
                <p
                  className={`text-sm ${
                    submitMessage.includes("Gracias")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Copyright y enlaces legales */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Mi Empresa. Todos los derechos
            reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Términos de Servicio
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

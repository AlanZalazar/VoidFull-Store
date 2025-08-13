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
  FaGithub,
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
      console.log("Datos del formulario:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitMessage("¡Gracias por tu mensaje! Te responderé pronto.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setSubmitMessage(
        "Hubo un error al enviar tu mensaje. Por favor intenta nuevamente."
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(""), 5000);
    }
  };

  return (
    <footer className="bg-[#1e1e1e] text-[#d4d4d4] pt-10 pb-6 px-4 sm:px-6 lg:px-8 border-t border-[#333]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sección de información */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#ffffff]">VOID FULL</h3>
            <p className="text-[#a0a0a0] text-sm">
              Productos personalizados con tus diseños favoritos de anime.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-[#4267B2] hover:text-[#5a7ec4] transition-colors"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="#"
                className="text-[#1DA1F2] hover:text-[#4ab4f5] transition-colors"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="text-[#E1306C] hover:text-[#e94b82] transition-colors"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className="text-[#0077b5] hover:text-[#0088cc] transition-colors"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="#"
                className="text-[#FF0000] hover:text-[#ff3333] transition-colors"
              >
                <FaYoutube size={18} />
              </a>
              <a
                href="#"
                className="text-[#333] hover:text-[#555] transition-colors"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#ffffff]">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-[#a0a0a0] hover:text-[#ffffff] text-sm transition-colors"
                >
                  Productos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a0a0a0] hover:text-[#ffffff] text-sm transition-colors"
                >
                  Diseños
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a0a0a0] hover:text-[#ffffff] text-sm transition-colors"
                >
                  Personalización
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a0a0a0] hover:text-[#ffffff] text-sm transition-colors"
                >
                  Envíos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a0a0a0] hover:text-[#ffffff] text-sm transition-colors"
                >
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#ffffff]">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <FaMapMarkerAlt className="text-[#569cd6] mt-0.5 flex-shrink-0" />
                <span className="text-[#a0a0a0] text-sm">
                  Berazategui, Buenos Aires. Argentina
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-[#569cd6] flex-shrink-0" />
                <span className="text-[#a0a0a0] text-sm">+54 1132173425</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-[#569cd6] flex-shrink-0" />
                <span className="text-[#a0a0a0] text-sm">
                  azlhan004@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de contacto COMPLETO y FUNCIONAL */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#ffffff]">
              Contáctanos
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-1.5 text-sm bg-[#252526] border border-[#3c3c3c] rounded focus:outline-none focus:ring-1 focus:ring-[#569cd6] text-[#d4d4d4]"
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
                  className="w-full px-3 py-1.5 text-sm bg-[#252526] border border-[#3c3c3c] rounded focus:outline-none focus:ring-1 focus:ring-[#569cd6] text-[#d4d4d4]"
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
                  className="w-full px-3 py-1.5 text-sm bg-[#252526] border border-[#3c3c3c] rounded focus:outline-none focus:ring-1 focus:ring-[#569cd6] text-[#d4d4d4]"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-sm bg-[#0e639c] hover:bg-[#1177bb] text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
              </button>
              {submitMessage && (
                <p
                  className={`text-xs mt-1 ${
                    submitMessage.includes("Gracias")
                      ? "text-[#4ec9b0]"
                      : "text-[#f48771]"
                  }`}
                >
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Divider con gradiente */}
        <div className="h-px my-6 bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

        {/* Copyright y enlaces legales */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-[#7a7a7a]">
            &copy; {new Date().getFullYear()} VoidFull-Store. Todos los derechos
            reservados.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <a
              href="#"
              className="text-[#7a7a7a] hover:text-[#d4d4d4] transition-colors"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-[#7a7a7a] hover:text-[#d4d4d4] transition-colors"
            >
              Privacidad
            </a>
            <a
              href="#"
              className="text-[#7a7a7a] hover:text-[#d4d4d4] transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

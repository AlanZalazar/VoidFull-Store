import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // Si el usuario no existe en Firestore pero está autenticado
          if (user.providerData[0]?.providerId === "google.com") {
            await setDoc(docRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ")[1] || "",
              role: "customer",
              createdAt: new Date(),
              phone: "",
              address: {
                street: "",
                city: "",
                province: "",
                postalCode: "",
              },
            });
            const newSnap = await getDoc(docRef);
            setUserData(newSnap.data());
          } else {
            setError("No se encontraron datos del usuario.");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // ✅ Maneja cambios en los inputs, incluyendo campos anidados como address.*
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setUserData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value,
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅ Guarda los datos actualizados en Firestore
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const docRef = doc(db, "users", userData.uid);
      await updateDoc(docRef, userData);
      setSuccess("Datos actualizados correctamente.");
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  // 💬 Loader
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  // 💬 No hay datos
  if (!userData)
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow dark:bg-gray-800">
        <p className="text-center text-red-500">
          No se encontraron datos del usuario.
        </p>
      </div>
    );

  // ✅ Render principal
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
        <div className="bg-blue-600 p-6 text-white dark:bg-blue-800">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-blue-100">Administra tu información personal</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                name="firstName"
                value={userData.firstName || ""}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <input
                name="lastName"
                value={userData.lastName || ""}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                value={userData.email || ""}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                value={userData.phone || ""}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Dirección
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Calle y número
                </label>
                <input
                  name="address.street"
                  value={userData.address?.street || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ciudad
                </label>
                <input
                  name="address.city"
                  value={userData.address?.city || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provincia
                </label>
                <input
                  name="address.province"
                  value={userData.address?.province || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código Postal
                </label>
                <input
                  name="address.postalCode"
                  value={userData.address?.postalCode || ""}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-200 dark:text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-200 dark:text-green-800">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {saving && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

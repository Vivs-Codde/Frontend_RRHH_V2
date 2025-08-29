import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../constants/api";
import { UserCircle } from "lucide-react";
import profileImage from "../assets/perfil.png";
interface UserProfile {
  id: number;
  idRRHH: string;
  celular: string;
  latitude: number;
  longitude: number;
  name: string;
  email: string;
  usuario: string;
  email_verified_at: string | null;
  accesoglobal: boolean;
  imagen: string | null;
  created_at: string;
  updated_at: string;
  estado: string;
  ip: string | null;
  tipo: string;
  deleted_at: string | null;
  role: { id: number; name: string };
  ips_activas: Array<{
    id: number;
    user_id: number;
    ip_address: string;
    descripcion: string;
  }>;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al cargar el perfil");
        const data = await res.json();
        setProfile(data);
      } catch (e: any) {
        setError(e.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="text-center py-10 text-[#cc3399] font-bold">{t("common.loading")}</div>;
  if (error) return <div className="text-center py-10 text-red-600 font-bold">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 border border-[#cc3399]">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        {profile.imagen ? (
          <img
            src={profile.imagen.startsWith("http") ? profile.imagen : `https://api-sales.eqrapp.com${profile.imagen}`}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-[#cc3399] object-cover shadow-md"
          />
        ) : (
          <img
            src={profileImage}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-[#cc3399] object-cover shadow-md bg-gray-100"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#cc3399] mb-1">{profile.name}</h2>
          <div className="text-gray-700 text-sm mb-1">{profile.email}</div>
          <div className="text-gray-500 text-xs">Rol: <span className="font-semibold text-[#cc3399]">{profile.role?.name}</span></div>
          <div className="text-gray-500 text-xs">Tipo: <span className="font-semibold">{profile.tipo}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <span className="block text-xs text-gray-500">Usuario</span>
          <span className="font-medium text-gray-800">{profile.usuario}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500">Celular</span>
          <span className="font-medium text-gray-800">{profile.celular || "-"}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500">Estado</span>
          <span className={`font-medium ${profile.estado === "A" ? "text-green-700" : "text-red-600"}`}>{profile.estado === "A" ? "Activo" : "Inactivo"}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500">Acceso Global</span>
          <span className="font-medium text-gray-800">{profile.accesoglobal ? "Sí" : "No"}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500">Fecha de creación</span>
          <span className="font-medium text-gray-800">{new Date(profile.created_at).toLocaleString()}</span>
        </div>
        <div>
          <span className="block text-xs text-gray-500">Última actualización</span>
          <span className="font-medium text-gray-800">{new Date(profile.updated_at).toLocaleString()}</span>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#cc3399] mb-2">IPs activas</h3>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          {profile.ips_activas && profile.ips_activas.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {profile.ips_activas.map((ip) => (
                <li key={ip.id} className="mb-1">
                  <span className="font-mono text-[#cc3399]">{ip.ip_address}</span> <span className="text-xs text-gray-500">({ip.descripcion})</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm">No hay IPs activas</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link, useNavigate } from "react-router-dom";

import { API_ENDPOINTS } from "../constants/api";
// @ts-ignore
import eqrLogo from "../assets/eqr.png";
// @ts-ignore
import eqrBg from "../assets/eqr1.webp";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const token = query.get("token") || "";
  const email = query.get("email") || ""; // <-- extraer email de la query
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || !confirmPassword) {
      setError(t("reset.errors.required"));
      return;
    }
    if (!passwordRegex.test(password)) {
      setError(t("reset.errors.weak"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("reset.errors.nomatch"));
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email, // <-- enviar email
          password,
          password_confirmation: confirmPassword, // <-- enviar confirmación
        }),
      });

      // Log completo de la respuesta para depuración en producción
     
      let debugBody: any = null;
      try {
        debugBody = await response.clone().json();
      } catch (e) {
        debugBody = await response.clone().text();
      }
     

      if (!response.ok) {
        let errorMsg = t("reset.error");
        if (debugBody && typeof debugBody === 'object' && 'message' in debugBody) {
          errorMsg = debugBody.message;
        } else if (typeof debugBody === 'string') {
          errorMsg = debugBody;
        }
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      // Redirigir al login después de éxito
      setTimeout(() => {
        navigate("/login");
      }, 1500); // Espera 1.5 segundos para mostrar el mensaje de éxito
    } catch (err) {
      console.error("[ResetPassword] CATCH error:", err);
      setError(t("reset.error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Detectar si el error es de token inválido o expirado
  const isTokenError = error && (
    error.toLowerCase().includes("token") ||
    error.toLowerCase().includes("expirad") ||
    error.toLowerCase().includes("inválido")
  );

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${eqrBg})` }}
    >
      <div className="w-full max-w-md px-4 sm:px-6">
        <div
          className="bg-transparent backdrop-blur-sm rounded-lg shadow-lg p-6 sm:p-8 w-full border shadow-pink-100 mx-auto"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderColor: "#FADCE6",
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          <div className="text-center mb-4 sm:mb-6">
            <div className="my-2 sm:my-4 flex justify-center">
              <img src={eqrLogo} alt="EQR Logo" className="h-24 sm:h-32" />
            </div>
            <h3 className="text-xl sm:text-2xl font-medium text-pink-600">
              {t("reset.title")}
            </h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {t("reset.instructions")}
            </p>
          </div>
          {success ? (
            <div className="text-green-600 text-center font-medium py-6">
              {t("reset.success")}
            </div>
          ) : isTokenError ? (
            <div className="text-red-500 text-center font-medium py-6">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" value={token} />
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("reset.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-3xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 pr-10 password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    padding: "4px",
                  }}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("reset.confirm")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-3xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300 pr-10 password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-pink-500"
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    padding: "4px",
                  }}
                  aria-label={
                    showConfirmPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium">{error}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 border-0 rounded-3xl text-sm font-medium text-white bg-[#e83e8c] hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#e83e8c" }}
                  disabled={isLoading}
                >
                  {isLoading ? t("reset.sending") : t("reset.send")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

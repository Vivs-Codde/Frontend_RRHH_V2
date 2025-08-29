import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// @ts-ignore
import eqrLogo from "../assets/eqr.png";
// @ts-ignore
import eqrBg from "../assets/eqr1.webp";
import { API_ENDPOINTS } from "../constants/api";

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!loginIdentifier) {
      setError(t("login.errors.required"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginIdentifier }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || t("forgot.error"));
        setIsLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError(t("forgot.error"));
    } finally {
      setIsLoading(false);
    }
  };

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
              {t("forgot.title")}
            </h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              {t("forgot.description") || "Ingresa tu correo electrónico o nombre de usuario para restablecer tu contraseña."}
            </p>
          </div>
          {sent ? (
            <div className="text-green-600 text-center font-medium py-6">
              {t("forgot.sent")}
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-pink-600 hover:underline font-semibold"
                >
                  {t("forgot.back")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="loginIdentifier"
                  type="text"
                  placeholder={t("forgot.loginIdentifierPlaceholder") || "Email o nombre de usuario"}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full border border-gray-200 rounded-3xl py-3 px-4 text-gray-700 bg-[#f9e7eb] focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-300"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm font-medium">{error}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 border-0 rounded-3xl text-sm font-medium text-white bg-[#e83e8c] hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#e83e8c" }}
                  disabled={!loginIdentifier || isLoading}
                >
                  {isLoading ? t("forgot.sending") : t("forgot.send")}
                </button>
              </div>
              <div className="text-center mt-2">
                <Link
                  to="/login"
                  className="text-pink-600 hover:underline font-semibold"
                >
                  {t("forgot.back")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services";
import { useTranslation } from "react-i18next";
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!authService.getUserData(); // O revisa el token
  const location = useLocation();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: t("notAuthenticated") }} // Mensaje de error
      />
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;

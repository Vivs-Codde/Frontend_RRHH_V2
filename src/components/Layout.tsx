import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header arriba, ocupa todo el ancho */}
      <Header
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={sidebarCollapsed}
      />
      {/* Contenido principal: sidebar a la izquierda, contenido a la derecha */}
      <div className="flex flex-1 min-h-0">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

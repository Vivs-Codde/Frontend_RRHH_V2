import React, { createContext, useContext, useState } from "react";

export const PermissionsContext = createContext<any[]>([]);
export const SetPermissionsContext = createContext<(perms: any[]) => void>(() => {});

export const usePermissions = () => useContext(PermissionsContext);
export const useSetPermissions = () => useContext(SetPermissionsContext);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<any[]>([]);
  return (
    <PermissionsContext.Provider value={permissions}>
      <SetPermissionsContext.Provider value={setPermissions}>
        {children}
      </SetPermissionsContext.Provider>
    </PermissionsContext.Provider>
  );
};

// src/context/PermissionsContext.tsx
import { createContext, useContext } from 'react';

const PermissionsContext = createContext<string[]>([]);

export const PermissionsProvider = ({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: string[];
}) => {
  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);

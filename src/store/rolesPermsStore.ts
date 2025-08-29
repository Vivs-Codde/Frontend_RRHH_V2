import { create } from 'zustand';
import { getAllRoles } from '../services/rolesService';
import { getAllPermissions } from '../services/rolePermissionsService';

interface Role {
  id: string | number;
  name: string;
}
interface Permission {
  id: number;
  name: string;
  action: string;
  module: string;
}

interface RolesPermsState {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  error: any;
  fetchRolesAndPermissions: () => Promise<void>;
  setRoles: (roles: Role[]) => void;
  setPermissions: (permissions: Permission[]) => void;
}

export const useRolesPermsStore = create<RolesPermsState>((set, get) => ({
  roles: [],
  permissions: [],
  loading: false,
  error: null,
  async fetchRolesAndPermissions() {
    set({ loading: true, error: null });
    try {
      // Llama ambas APIs en paralelo
      const [roles, permissions] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
      ]);
      set({ roles, permissions, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  setRoles(roles) {
    set({ roles });
  },
  setPermissions(permissions) {
    set({ permissions });
  }
}));

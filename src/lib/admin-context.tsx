import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { pb } from './pb';

interface AdminRole {
  id: string;
  role: 'Global' | 'Country' | 'Region';
  country?: string;
  region?: string;
  expand?: {
    country?: { name: string };
    region?: { name: string };
  };
}

interface AdminContextType {
  adminRoles: AdminRole[];
  isGlobalAdmin: boolean;
  isCountryAdmin: boolean;
  isRegionAdmin: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminRoles = async () => {
      if (pb.authStore.isValid) {
        setIsLoading(true);
        try {
          // Disable auto-cancellation for this initial/global fetch
          const list = await pb.collection('admin_roles').getFullList<AdminRole>({
            expand: 'country,region',
            requestKey: 'initial_admin_roles_fetch'
          });
          setAdminRoles(list);
        } catch (error: any) {
          if (error.isAbort) return;
          console.error('Failed to fetch admin roles:', error);
          setAdminRoles([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAdminRoles([]);
        setIsLoading(false);
      }
    };

    fetchAdminRoles();

    return pb.authStore.onChange(() => {
      fetchAdminRoles();
    });
  }, []);

  const isGlobalAdmin = adminRoles.some(r => r.role === 'Global');
  const isCountryAdmin = adminRoles.some(r => r.role === 'Country');
  const isRegionAdmin = adminRoles.some(r => r.role === 'Region');
  const isAdmin = adminRoles.length > 0;

  return (
    <AdminContext.Provider value={{ 
      adminRoles, 
      isGlobalAdmin, 
      isCountryAdmin, 
      isRegionAdmin, 
      isAdmin, 
      isLoading 
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}

import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminViewContextType {
  isAdminView: boolean;
  toggleAdminView: () => void;
}

const AdminViewContext = createContext<AdminViewContextType>({ isAdminView: true, toggleAdminView: () => {} });

export function AdminViewProvider({ children }: { children: ReactNode }) {
  const [isAdminView, setIsAdminView] = useState(() => {
    try { return localStorage.getItem('admin-view-mode') !== 'visitor'; }
    catch { return true; }
  });

  const toggleAdminView = () => {
    setIsAdminView(prev => {
      const next = !prev;
      localStorage.setItem('admin-view-mode', next ? 'admin' : 'visitor');
      return next;
    });
  };

  return (
    <AdminViewContext.Provider value={{ isAdminView, toggleAdminView }}>
      {children}
    </AdminViewContext.Provider>
  );
}

export const useAdminView = () => useContext(AdminViewContext);

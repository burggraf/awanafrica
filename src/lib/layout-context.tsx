import { createContext, useContext, useState, type ReactNode, useCallback } from "react";

interface LayoutContextType {
  showFooter: boolean;
  setShowFooter: (show: boolean) => void;
  
  // Header controls
  headerTitle: ReactNode;
  setHeaderTitle: (content: ReactNode) => void;
  headerRight: ReactNode;
  setHeaderRight: (content: ReactNode) => void;
  headerLeft: ReactNode;
  setHeaderLeft: (content: ReactNode) => void;

  // Footer controls
  footerLeft: ReactNode;
  setFooterLeft: (content: ReactNode) => void;
  footerCenter: ReactNode;
  setFooterCenter: (content: ReactNode) => void;
  footerRight: ReactNode;
  setFooterRight: (content: ReactNode) => void;

  resetLayout: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [showFooter, setShowFooter] = useState(false);
  const [headerTitle, setHeaderTitle] = useState<ReactNode>(null);
  const [headerRight, setHeaderRight] = useState<ReactNode>(null);
  const [headerLeft, setHeaderLeft] = useState<ReactNode>(null);
  const [footerLeft, setFooterLeft] = useState<ReactNode>(null);
  const [footerCenter, setFooterCenter] = useState<ReactNode>(null);
  const [footerRight, setFooterRight] = useState<ReactNode>(null);

  const resetLayout = useCallback(() => {
    setShowFooter(false);
    setHeaderTitle(null);
    setHeaderRight(null);
    setHeaderLeft(null);
    setFooterLeft(null);
    setFooterCenter(null);
    setFooterRight(null);
  }, []);

  return (
    <LayoutContext.Provider value={{ 
      showFooter, setShowFooter,
      headerTitle, setHeaderTitle,
      headerRight, setHeaderRight,
      headerLeft, setHeaderLeft,
      footerLeft, setFooterLeft,
      footerCenter, setFooterCenter,
      footerRight, setFooterRight,
      resetLayout
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StoreContextType {
  activeStoreId: number | null;
  setActiveStoreId: (id: number) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activeStoreId, setActiveStoreId] = useState<number | null>(null);

  return (
    <StoreContext.Provider value={{ activeStoreId, setActiveStoreId }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

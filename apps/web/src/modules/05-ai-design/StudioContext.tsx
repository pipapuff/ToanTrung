'use client';

import React, { createContext, useContext } from 'react';
import { useAiDesignStudio, type StudioController } from './hooks/useAiDesignStudio';

const StudioContext = createContext<StudioController | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const studio = useAiDesignStudio();
  return <StudioContext.Provider value={studio}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioController {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio phải được dùng bên trong <StudioProvider>.');
  return ctx;
}

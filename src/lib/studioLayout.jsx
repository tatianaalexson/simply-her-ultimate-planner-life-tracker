import React, { createContext, useContext, useState, useCallback } from 'react';

// Opt-in wider Studio/page layout mechanism.
// A page calls `useStudioWidth().setWide(true)` on mount to ask the global
// Layout for a wider responsive canvas (e.g. max-w-5xl) without changing the
// default max-w-2xl used across the rest of Simply Her.
const Ctx = createContext({ wide: false, setWide: () => {} });

export function StudioWidthProvider({ children }) {
  const [wide, setWideState] = useState(false);
  const setWide = useCallback((v) => setWideState(v), []);
  return <Ctx.Provider value={{ wide, setWide }}>{children}</Ctx.Provider>;
}

export const useStudioWidth = () => useContext(Ctx);
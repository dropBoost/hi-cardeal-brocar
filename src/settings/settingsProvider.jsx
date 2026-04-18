"use client";

import { createContext, useContext, useMemo } from "react";

const SettingsContext = createContext({});

export function SettingsProvider({ initialSettings, children }) {
  const value = useMemo(() => initialSettings || {}, [initialSettings]);
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ThemeVariant = 'professional' | 'modern' | 'minimal' | 'high-contrast';

interface ThemeContextType {
  mode: ThemeMode;
  variant: ThemeVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [variant, setVariant] = useState<ThemeVariant>('professional');

  useEffect(() => {
    // Load saved preferences
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedVariant = localStorage.getItem('theme-variant') as ThemeVariant;
    
    if (savedMode) setMode(savedMode);
    if (savedVariant) setVariant(savedVariant);
  }, []);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');
    
    // Apply mode
    root.classList.add(mode);
    
    // Apply variant (except professional which is default)
    if (variant !== 'professional') {
      root.setAttribute('data-theme', variant);
    }
    
    // Save preferences
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('theme-variant', variant);
  }, [mode, variant]);

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, variant, setMode, setVariant, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

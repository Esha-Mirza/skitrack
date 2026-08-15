import { useContext } from 'react';
import { ThemeContext } from '../context/theme-context';

export function useDarkMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }
  return context;
}
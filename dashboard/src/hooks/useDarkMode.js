import { useTheme } from '../context/ThemeContext';

export function useDarkMode() {
  const { isDark, toggleTheme } = useTheme();
  return { isDark, toggleTheme };
}
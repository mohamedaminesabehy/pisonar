import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialiser à partir du localStorage ou par défaut 'light'
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // Sauvegarde dans localStorage et sur le <body> à chaque changement
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme; // applique <body class="light"> ou <body class="dark">
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

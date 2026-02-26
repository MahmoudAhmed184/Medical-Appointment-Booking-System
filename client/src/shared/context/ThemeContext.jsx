import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

const getInitialMode = () => {
    try {
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) return stored === 'true';
    } catch { /* ignore */ }
    // Default to light mode
    return false;
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(getInitialMode);

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('darkMode', String(darkMode));
        } catch { /* ignore */ }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState("light");

  const applyTheme = (t) => {
    const root = document.documentElement; // <html>
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  };

  const persistLocal = (t) => {
    try {
      localStorage.setItem("theme", t);
    } catch {}
  };

  const loadTheme = async () => {
    // Try server first (if authenticated cookie exists)
    try {
      const res = await axios.get(`${USER_API_END_POINT}/theme`, {
        withCredentials: true,
      });
      const t = res?.data?.theme === "dark" ? "dark" : "light";
      setThemeState(t);
      applyTheme(t);
      persistLocal(t);
      return;
    } catch {}
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem("theme");
      const t = stored === "dark" ? "dark" : "light";
      setThemeState(t);
      applyTheme(t);
    } catch {
      setThemeState("light");
      applyTheme("light");
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const updateServer = async (t) => {
    try {
      await axios.post(
        `${USER_API_END_POINT}/theme/update`,
        { theme: t },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
      // Ignore if not authenticated
    }
  };

  const setTheme = (t) => {
    setThemeState(t);
    applyTheme(t);
    persistLocal(t);
    updateServer(t);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
import React, {createContext, useContext} from "react";

type Theme = "dark";

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({children}: {children: React.ReactNode}) {
  return (
    <ThemeContext.Provider value={{theme: "dark"}}>
      {children}
    </ThemeContext.Provider>
  );
}

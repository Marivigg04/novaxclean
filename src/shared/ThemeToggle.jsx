import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";

export function ThemeToggle() {
  // Ahora usamos el contexto global en lugar de useState local
  const { theme, setTheme } = useTheme();

  return (
    <button 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-base-surface border border-brand/20 text-base-text hover:border-brand transition-colors cursor-pointer flex items-center justify-center"
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-brand" /> 
      ) : (
        <Moon className="w-5 h-5 text-brand" />
      )}
    </button>
  );
}
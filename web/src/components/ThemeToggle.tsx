"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "light" ? <Sun size={15} /> :
    theme === "dark"  ? <Moon size={15} /> :
                        <Monitor size={15} />;

  const label =
    theme === "light" ? "Switch to dark mode" :
    theme === "dark"  ? "Switch to system theme" :
                        "Switch to light mode";

  return (
    <Tooltip content={label} side="right">
      <Button size="icon" variant="ghost" onClick={cycle} aria-label={label}>
        {icon}
      </Button>
    </Tooltip>
  );
}

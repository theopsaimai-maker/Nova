import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
          "disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none",
          // Variants
          variant === "primary" &&
            "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
          variant === "ghost" &&
            "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]",
          variant === "outline" &&
            "border border-[var(--border)] bg-transparent hover:bg-[var(--surface-hover)]",
          variant === "danger" &&
            "text-red-500 hover:bg-red-50 dark:hover:bg-red-950",
          // Sizes
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-9 px-4 text-sm",
          size === "icon" && "h-8 w-8 p-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };

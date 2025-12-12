import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

function Button({ ref, className, variant = "default", size = "default", asChild = false, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  const Comp = asChild ? Slot : "button";

  const baseStyles = `
      inline-flex items-center justify-center gap-2
      whitespace-nowrap rounded-xl
      text-sm font-semibold
      ring-offset-background
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50
      cursor-pointer
      active:scale-[0.97]
    `;

  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20",
    outline: "border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes: Record<string, string> = {
    default: "h-11 px-6 py-2.5",
    sm: "h-9 rounded-xl px-4 text-xs",
    lg: "h-12 rounded-xl px-8 text-base",
    icon: "h-11 w-11",
  };

  return (
    <Comp
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
}
Button.displayName = "Button";

export { Button };

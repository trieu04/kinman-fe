import * as React from "react";
import { cn } from "../../lib/utils";

function Badge({ ref, className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
} & { ref?: React.RefObject<HTMLDivElement | null> }) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/20",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-destructive/10 text-destructive",
    outline: "text-foreground border-border",
    success: "border-transparent bg-success/10 text-success",
    warning: "border-transparent bg-warning/10 text-warning",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
Badge.displayName = "Badge";

export { Badge };

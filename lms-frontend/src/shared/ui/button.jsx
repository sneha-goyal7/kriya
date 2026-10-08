import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : motion.button;

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",

    outline: "border border-border bg-transparent hover:bg-muted text-foreground",

    ghost: "hover:bg-muted text-foreground",

    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",

    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  const sizes = {
    default: "h-10 px-4 py-2",

    sm: "h-9 px-3",

    lg: "h-12 px-6",

    icon: "h-10 w-10",
  };

  return (
    <Comp
      className={cn(
        `
          inline-flex items-center
          justify-center
          rounded-none
          text-sm font-medium
          transition-all
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          disabled:pointer-events-none
          disabled:opacity-50
        `,

        variants[variant],

        sizes[size],

        className,
      )}
      {...(!asChild ? {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 25 }
      } : {})}
      {...props}
    />
  );
}

export { Button };

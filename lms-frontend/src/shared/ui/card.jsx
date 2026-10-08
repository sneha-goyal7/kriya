import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function Card({ className, enableTilt = false, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current || !enableTilt) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const spotlightX = useSpring(mouseX, { stiffness: 500, damping: 50 });
  const spotlightY = useSpring(mouseY, { stiffness: 500, damping: 50 });

  const spotlightBackground = useTransform(
    [spotlightX, spotlightY],
    ([sx, sy]) => `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(255,255,255,0.06), transparent 40%)`
  );

  const Comp = enableTilt ? motion.div : "div";

  return (
    <Comp
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={enableTilt ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      } : {}}
      className={cn(
        `
          relative overflow-hidden
          rounded-none
          border border-border/50
          bg-card
          text-card-foreground
          shadow-card
          transition-colors duration-300
        `,
        className,
      )}
      {...props}
    >
      {enableTilt && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: spotlightBackground,
            zIndex: 10
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">{props.children}</div>
    </Comp>
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-xl font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

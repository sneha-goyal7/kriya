import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        `
          animate-pulse
          rounded-none
          bg-muted
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

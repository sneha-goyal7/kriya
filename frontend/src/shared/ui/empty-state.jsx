import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

function EmptyState({
  title = "No data found",
  description = "There is currently nothing to display.",
  icon: Icon = Inbox,
  className,
  action,
}) {
  return (
    <div
      className={cn(
        `
          flex flex-col items-center
          justify-center gap-4
          rounded-none border border-border/50 bg-black/40
          p-10 text-center
        `,
        className,
      )}
    >
      <div
        className="
          mb-4 flex h-14 w-14
          items-center justify-center
          rounded-full bg-muted
        "
      >
        <Icon size={28} className="text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export { EmptyState };

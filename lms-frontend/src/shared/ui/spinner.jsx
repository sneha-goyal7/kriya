import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className }) {
  return <LoaderCircle className={cn("animate-spin", className)} />;
}

export { Spinner };

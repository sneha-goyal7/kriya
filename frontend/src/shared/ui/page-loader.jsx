import { Spinner } from "@/shared/ui/spinner";

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-10 w-10 text-primary" />

        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

export default PageLoader;

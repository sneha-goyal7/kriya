import DashboardTopbar from "@/shared/navigation/DashboardTopbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardTopbar />
      <main className="flex-1 w-full px-6 lg:px-12 py-8 mt-20">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;

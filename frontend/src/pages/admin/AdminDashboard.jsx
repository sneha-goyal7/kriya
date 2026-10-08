import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useGetDashboardMetricsQuery } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";

function MetricCard({ title, value, delta, upIsGood = true }) {
  const isUp = delta > 0;
  const isGood = upIsGood ? isUp : !isUp;
  
  return (
    <div className="bg-card/30 border border-border/50 p-6 flex flex-col justify-between">
      <h3 className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{title}</h3>
      <div className="mt-4 flex items-baseline gap-4">
        <span className="text-5xl font-bold tracking-tighter text-foreground">{value}</span>
        {delta !== undefined && (
          <span className={`flex items-center text-sm font-bold ${isGood ? 'text-green-500' : 'text-destructive'}`}>
            {isUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useGetDashboardMetricsQuery();

  if (isLoading) return <PageLoader />;
  
  const metrics = data?.data?.metrics || {};

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Activity size={16} className="mr-2 text-primary" />
          Live Platform Health
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Students" value={metrics.activeStudents} />
        <MetricCard title="Active Instructors" value={metrics.activeInstructors} />
        <MetricCard title="Hiring Partners" value={metrics.totalPartners} />
        <MetricCard title="Published Courses" value={metrics.publishedCourses} />
        
        <div className="bg-card/30 border border-border/50 p-6 flex flex-col justify-between relative overflow-hidden">
          {metrics.pendingReviewCount > 0 && (
            <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
            </div>
          )}
          <h3 className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Pending Content Review</h3>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-5xl font-bold tracking-tighter text-foreground">{metrics.pendingReviewCount}</span>
            <span className="text-sm text-muted-foreground font-medium">courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

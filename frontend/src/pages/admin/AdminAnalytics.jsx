import { useGetAnalyticsQuery } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { AlertCircle, ArrowDown, Activity, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

function AdminAnalytics() {
  const { data, isLoading } = useGetAnalyticsQuery();

  if (isLoading) return <PageLoader />;

  const analytics = data?.data?.analytics;
  if (!analytics) return <div>No data available</div>;

  const { funnel, contentQueueWaitTimeHours, activeReviewers } = analytics;

  // Calculate percentages based on newSignups as 100%
  const steps = [
    { label: "New Signups", value: funnel.newSignups },
    { label: "Finished Onboarding", value: funnel.finishedOnboarding },
    { label: "Enrolled in Cohort", value: funnel.enrolledInCohort },
    { label: "Completed First Module", value: funnel.completedFirstModule },
    { label: "Job Placed", value: funnel.jobPlaced },
  ];

  const maxVal = steps[0].value;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-2 font-light">Identify friction points in the user journey and monitor operational health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funnel View */}
        <Card className="col-span-1 border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              User Journey Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps.map((step, index) => {
              const percentage = Math.round((step.value / maxVal) * 100);
              const dropoff = index > 0 ? Math.round((1 - (step.value / steps[index - 1].value)) * 100) : 0;
              
              return (
                <div key={step.label} className="relative">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-semibold">{step.label}</span>
                    <span className="text-sm font-bold">{step.value.toLocaleString()} <span className="text-muted-foreground font-normal text-xs ml-1">({percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4 overflow-hidden relative">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center justify-end mt-2 pr-4 text-xs text-muted-foreground">
                      <span className="flex items-center text-destructive/80 font-medium bg-destructive/10 px-2 py-0.5 rounded">
                        <ArrowDown size={12} className="mr-1" />
                        {Math.round((1 - (steps[index + 1].value / step.value)) * 100)}% drop-off
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Operational Health */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="text-secondary-foreground" size={20} />
                Content Moderation Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-background rounded-lg border border-border/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Average Wait Time</p>
                  <p className={`text-4xl font-black ${contentQueueWaitTimeHours > 24 ? 'text-destructive' : 'text-foreground'}`}>
                    {contentQueueWaitTimeHours} <span className="text-xl font-medium text-muted-foreground">hrs</span>
                  </p>
                </div>
                
                {contentQueueWaitTimeHours > 24 ? (
                  <div className="flex flex-col items-center justify-center p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 max-w-[140px] text-center">
                    <AlertCircle size={24} className="mb-1" />
                    <span className="text-xs font-bold uppercase leading-tight">SLA Breached Hire Reviewers</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 max-w-[140px] text-center">
                    <Clock size={24} className="mb-1" />
                    <span className="text-xs font-bold uppercase leading-tight">Within SLA (24h)</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">Active Reviewers</span>
                </div>
                <span className="font-bold">{activeReviewers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
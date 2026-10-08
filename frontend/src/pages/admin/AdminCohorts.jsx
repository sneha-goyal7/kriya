import { useState } from "react";
import { useGetCohortsQuery, useCreateCohortMutation } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { Plus, Calendar as CalendarIcon, Users, MapPin, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

function AdminCohorts() {
  const { data, isLoading } = useGetCohortsQuery();
  const [createCohort, { isLoading: isCreating }] = useCreateCohortMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", track: "", startDate: "", endDate: "" });

  if (isLoading) return <PageLoader />;

  const cohorts = data?.data?.cohorts || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCohort(formData).unwrap();
      toast.success("Cohort created successfully");
      setShowForm(false);
      setFormData({ name: "", track: "", startDate: "", endDate: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create cohort");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Timeline</h1>
          <p className="text-muted-foreground mt-2 font-light">Schedule batches and prevent resource overlap.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          {showForm ? "Cancel" : "New Cohort"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card/50 p-6 border border-border/50 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-lg">Create New Cohort</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cohort Name</label>
              <Input 
                required 
                placeholder="e.g. Spring 2026 Batch A" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Career Track</label>
              <Input 
                required 
                placeholder="e.g. Full Stack Web" 
                value={formData.track}
                onChange={e => setFormData({...formData, track: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                required 
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input 
                required 
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Save Cohort"}
            </Button>
          </div>
        </form>
      )}

      {/* Cohort Timeline View */}
      <div className="space-y-4">
        {cohorts.length === 0 ? (
          <div className="text-center p-12 bg-card/30 border border-border/50 rounded-lg text-muted-foreground">
            No cohorts scheduled yet. Click "New Cohort" to begin.
          </div>
        ) : (
          cohorts.map((cohort) => {
            const start = new Date(cohort.startDate);
            const end = new Date(cohort.endDate);
            const isPast = end < new Date();
            const isActive = start <= new Date() && end >= new Date();
            const duration = differenceInDays(end, start);

            return (
              <div 
                key={cohort._id} 
                className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-lg border ${
                  isActive ? 'border-primary/50 bg-primary/5' : 
                  isPast ? 'border-border/30 bg-card/10 opacity-60' : 'border-border/50 bg-card/30'
                }`}
              >
                {/* Visual Timeline Marker */}
                <div className="hidden md:flex flex-col items-center min-w-24">
                  <div className="text-sm font-bold text-center">
                    {format(start, "MMM")}
                    <div className="text-2xl font-black">{format(start, "d")}</div>
                  </div>
                  <div className={`w-1 flex-1 my-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className="text-sm font-bold text-center text-muted-foreground">
                    {format(end, "MMM")}
                    <div className="text-xl font-black">{format(end, "d")}</div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{cohort.name}</h3>
                        {isActive && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase">Active Now</span>}
                        {isPast && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase">Completed</span>}
                        {!isActive && !isPast && <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase">Upcoming</span>}
                      </div>
                      <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin size={14} /> {cohort.track} &middot; {duration} Days Total
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="font-medium">{cohort.activeStudents}</span> Enrolled Students
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon size={16} className="text-muted-foreground" />
                      <span className="font-medium">{format(start, "MMM d, yyyy")} &mdash; {format(end, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminCohorts;
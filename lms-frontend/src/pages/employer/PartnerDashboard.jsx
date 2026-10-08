import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetEmployerProfileQuery } from "@/features/career/careerApi";
import { ShieldAlert, Search, Users, Briefcase } from "lucide-react";
import PageLoader from "@/shared/ui/page-loader";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetEmployerProfileQuery();

  useEffect(() => {
    // If we receive a 404, it means the profile doesn't exist, so they need to onboard
    if (error && error.status === 404) {
      navigate("/employer/onboarding");
    }
  }, [error, navigate]);

  if (isLoading) return <PageLoader />;
  if (error && error.status === 404) return null; // Wait for redirect
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error.data?.error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  const profile = data?.data;

  // VERIFICATION LOCK SCREEN
  if (profile && !profile.verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto px-4">
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/20">
          <ShieldAlert className="w-12 h-12 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Verification Pending
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Thank you for joining as a Hiring Partner, <strong>{profile.companyName}</strong>. 
          To protect our students from spam and scams, our team manually verifies every new partner. 
          We are currently reviewing your website (<a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{profile.website}</a>).
        </p>

        <div className="p-6 border border-border/50 bg-secondary/30 rounded-2xl">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
            Verification typically takes 24-48 hours. Once approved, this dashboard will automatically unlock, granting you access to search our curated talent pool.
          </p>
        </div>
      </div>
    );
  }

  // FULL DASHBOARD (Unlocked)
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.companyName}</h1>
        <p className="text-muted-foreground mt-2">Find your next top performer from our verified talent pool.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-border/50 rounded-2xl bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Candidate Search</h3>
          </div>
          <p className="text-sm text-muted-foreground">Search by skills, experience level, and completion rate.</p>
        </div>

        <div className="p-6 border border-border/50 rounded-2xl bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Active Postings</h3>
          </div>
          <p className="text-sm text-muted-foreground">You currently have 0 active job postings.</p>
        </div>

        <div className="p-6 border border-border/50 rounded-2xl bg-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Saved Talent</h3>
          </div>
          <p className="text-sm text-muted-foreground">You have 0 saved candidate profiles.</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;

import { Link } from "react-router-dom";
import { BookOpen, Trophy, Target, Brain, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useGetUserEnrollmentsQuery } from "@/features/enrollment/enrollmentApi";
import { useGetRoadmapQuery, useGetProfileQuery, useGenerateRoadmapMutation } from "@/features/career/careerApi";
import AICompanionChat from "@/components/student/AICompanionChat";
import { Skeleton } from "@/shared/ui/skeleton";

function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetUserEnrollmentsQuery(user?._id || user?.id, { skip: !user });
  const { data: roadmapRes } = useGetRoadmapQuery(undefined, { skip: !user });
  const { data: profileRes } = useGetProfileQuery(undefined, { skip: !user });
  const [generateRoadmap, { isLoading: isGenerating }] = useGenerateRoadmapMutation();

  const enrollments = data?.data?.enrollments || data?.courses || data?.enrollments || [];
  const featuredCourse = enrollments.length > 0 ? (enrollments[0].course || enrollments[0]) : null;
  const featuredProgress = enrollments.length > 0 ? (enrollments[0].progress || 0) : 0;

  const roadmap = roadmapRes?.data?.roadmap;
  const profile = profileRes?.data?.profile;
  const nextNode = roadmap?.nodes?.find(n => n.status === "active" || n.status === "locked");

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 space-y-6 max-w-[1600px] mx-auto">
        <Skeleton className="h-64 w-full rounded-[2.5rem] bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-[2.5rem] bg-muted/50" />
          <Skeleton className="h-48 w-full rounded-[2.5rem] bg-muted/50" />
          <Skeleton className="h-48 w-full rounded-[2.5rem] bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
      <div className="p-4 md:p-8 lg:p-12 pb-24 max-w-[1600px] mx-auto space-y-6">
      
      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* HERO BENTO (Spans 4 columns) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 relative overflow-hidden rounded-[2.5rem] bg-card p-10 md:p-12 border border-border flex flex-col justify-between group">
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              {profile?.dreamRole ? (
                <>Ready to become a <br className="hidden md:block"/><span className="text-primary font-bold">{profile.dreamRole}</span>?</>
              ) : "Welcome back to your dashboard."}
            </h1>
            <p className="mt-6 max-w-md text-muted-foreground font-light text-lg">
              Pick up right where you left off and continue mastering your craft with focus and precision.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 h-14 font-medium bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md" asChild>
              <Link to="/student/roadmap">View Roadmap</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-medium bg-background/50 hover:bg-muted border-border transition-all" asChild>
              <Link to="/courses">Explore Library</Link>
            </Button>
          </div>
        </div>

        {/* STAT 1 - Active Courses (Spans 2 cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-[2.5rem] bg-card p-8 shadow-sm border border-border flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-muted rounded-2xl border border-border/50">
              <BookOpen className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-5xl font-semibold tracking-tighter text-foreground">{enrollments.length}</h2>
            <p className="text-muted-foreground font-medium mt-2">Active Courses</p>
          </div>
        </div>

        {/* CONTINUE LEARNING BENTO (Spans 4 columns) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 rounded-[2.5rem] bg-card shadow-sm border border-border p-4 flex flex-col md:flex-row gap-6 md:gap-10 hover:border-primary/30 transition-colors">
          {featuredCourse ? (
            <>
              {/* Image Side */}
              <div className="w-full md:w-5/12 h-64 md:h-full rounded-[2rem] overflow-hidden bg-muted relative">
                {featuredCourse.thumbnail ? (
                  <img src={featuredCourse.thumbnail} alt="Course" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <BookOpen size={48} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10" />
              </div>
              
              {/* Content Side */}
              <div className="w-full md:w-7/12 flex flex-col justify-between py-4 pr-6">
                <div>
                  <div className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                    Continue Learning
                  </div>
                  <h3 className="text-3xl font-medium tracking-tight text-foreground line-clamp-2 leading-tight">
                    {featuredCourse.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground font-light line-clamp-2 leading-relaxed">
                    {featuredCourse.description}
                  </p>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center justify-between text-xs font-medium mb-3 text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-foreground">{featuredProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-6">
                    <div className="h-full bg-foreground rounded-full transition-all duration-1000" style={{ width: `${featuredProgress}%` }} />
                  </div>
                  <Button className="w-full rounded-full h-12 font-medium shadow-none hover:shadow-md transition-all bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link to={`/course/${featuredCourse._id}/player`}>Resume Course <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </div>
              </div>
            </>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 border border-border text-muted-foreground">
                  <BookOpen size={32} strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-medium text-foreground mb-2">No Active Courses</h3>
                <p className="text-muted-foreground font-light max-w-sm mb-8">Ready to learn something new? Browse the catalog to find your next objective.</p>
                <Button className="rounded-full px-8 h-12 font-medium" asChild>
                  <Link to="/courses">Browse Catalog</Link>
                </Button>
             </div>
          )}
        </div>

        {/* ROADMAP / PATH (Spans 2 columns) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 rounded-[2.5rem] bg-card p-8 md:p-10 shadow-sm border border-border flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={120} strokeWidth={0.5} className="text-primary rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Your Path
            </div>
            
            {!roadmap || roadmap?.nodes?.length === 0 ? (
              <div>
                <h3 className="text-2xl font-medium tracking-tight mb-4">AI Learning Path</h3>
                <p className="text-muted-foreground font-light text-sm mb-8 leading-relaxed">
                  Generate your personalized curriculum based on your exact dream role.
                </p>
                <Button 
                  className="w-full h-12 rounded-full font-medium"
                  onClick={async () => {
                    try {
                      await generateRoadmap().unwrap();
                      toast.success("Path generated!");
                    } catch (error) {
                      toast.error("Failed to generate path");
                    }
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate AI Path"} <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : nextNode ? (
              <div>
                <h3 className="text-2xl font-medium tracking-tight mb-4">Next Objective</h3>
                <p className="font-semibold text-lg text-foreground leading-snug mb-2">{nextNode.title}</p>
                <p className="text-muted-foreground font-light text-sm line-clamp-3 leading-relaxed mb-8">
                  {nextNode.description}
                </p>
                <Button variant="outline" className="w-full h-12 rounded-full font-medium bg-background hover:bg-muted border-border" asChild>
                  <Link to="/student/roadmap">Continue Path <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground font-medium rounded-full"
                  onClick={async () => {
                    try {
                      await generateRoadmap().unwrap();
                      toast.success("Path regenerated successfully!");
                    } catch (error) {
                      toast.error(error?.data?.message || error?.data?.error?.message || "Failed to regenerate path");
                    }
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Regenerating..." : "Regenerate Path"}
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-medium tracking-tight mb-4">Path Completed!</h3>
                <p className="text-muted-foreground font-light text-sm">You have mastered all objectives on this roadmap.</p>
              </div>
            )}
          </div>
        </div>

        {/* SKILL MASTERY BREAKDOWN (Spans 2 columns) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-[2.5rem] bg-card p-8 shadow-sm border border-border flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-muted rounded-2xl border border-border/50">
              <Brain className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight mb-4">Domain Mastery</h3>
            <div className="space-y-4">
              {roadmap?.domainMastery && Object.keys(roadmap.domainMastery).length > 0 ? Object.entries(roadmap.domainMastery).map(([domain, percentage]) => (
                <div key={domain}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-muted-foreground">{domain}</span>
                    <span className="text-foreground">{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground font-light py-4">Generate a roadmap to see your skill mastery breakdown.</div>
              )}
            </div>
          </div>
        </div>

        {/* STAT 3 - Streak */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-[2.5rem] bg-card p-8 shadow-sm border border-border flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-4 bg-muted rounded-2xl border border-border/50">
              <Trophy className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="text-xs font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground border border-border">
              Best: {profile?.longestStreak || 0}
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-5xl font-semibold tracking-tighter text-foreground">{profile?.currentStreak || 0} <span className="text-xl font-medium text-muted-foreground">Days</span></h2>
            <p className="text-muted-foreground font-medium mt-2">Active Learning Streak</p>
          </div>
        </div>

        {/* RECENT ACTIVITIES FEED (Spans 4 columns) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-6 rounded-[2.5rem] bg-card p-8 md:p-10 shadow-sm border border-border flex flex-col hover:border-primary/30 transition-colors">
          <div className="inline-flex items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Recent Activity
          </div>
          <div className="space-y-4">
            {profile?.recentActivities && profile.recentActivities.length > 0 ? (
              profile.recentActivities.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50">
                  <div className={`p-3 rounded-xl ${activity.type === 'achievement' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {activity.type === 'achievement' ? <Trophy className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.timestamp && !isNaN(new Date(activity.timestamp).getTime()) 
                        ? `${new Date(activity.timestamp).toLocaleDateString()} at ${new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Target className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-light">No recent activity yet. Start your journey today!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Companion Floating Chat */}
      <AICompanionChat />
    </div>
  );
};

export default StudentDashboard;

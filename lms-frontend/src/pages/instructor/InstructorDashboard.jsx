import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  BookOpen, 
  GraduationCap, 
  Layers3, 
  Plus, 
  Star,
  Clock,
  TrendingUp,
  MoreVertical,
  Activity
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import CourseCard from "@/components/common/CourseCard";
import { useGetInstructorCoursesQuery } from "@/features/instructor/instructorApi";

function InstructorDashboard() {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetInstructorCoursesQuery(
    user?._id || user?.id,
    { skip: !user }
  );

  const courses = data?.data?.courses || data?.courses || [];
  
  // Calculate some aggregate metrics for the dashboard
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0);
  const totalModules = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const avgRating = courses.length > 0 ? 4.8 : 0.0;

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl bg-muted/50" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
             {Array.from({ length: 4 }).map((_, index) => (
               <Skeleton key={index} className="h-[380px] w-full rounded-2xl bg-muted/50" />
             ))}
          </div>
          <Skeleton className="h-[500px] w-full rounded-2xl bg-muted/50" />
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (isError) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="Something went wrong while loading instructor data. Please refresh."
      />
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Instructor Overview
          </h1>
          <p className="mt-2 text-muted-foreground font-light text-sm">
            Monitor your courses, analyze student engagement, and manage content.
          </p>
        </div>

        <Button asChild className="h-11 rounded-xl px-6 font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
          <Link to="/instructor/create-course">
            <Plus size={18} className="mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* KPI METRICS (4 Columns) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Courses</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{courses.length}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Students</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{totalStudents}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={24} strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Published Content</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{totalModules}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers3 size={24} strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border shadow-sm bg-card hover:border-primary/20 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Global Rating</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{avgRating}</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600">
                <Star size={24} strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* LEFT COLUMN: ACTIVE COURSES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Your Courses</h2>
            <Link to="/instructor/courses" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>

          {courses.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-4">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-lg font-medium text-foreground">No Courses Yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
                  You haven't created any courses. Start building your first premium curriculum today.
                </p>
                <Button asChild className="rounded-full">
                  <Link to="/instructor/create-course">Build a Course</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/instructor/review-queue" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Activity size={16} />
                  </div>
                  Review Student Assignments
                </div>
                <TrendingUp size={14} className="text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link to="/instructor/create-course" className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus size={16} />
                  </div>
                  Draft New Course
                </div>
                <TrendingUp size={14} className="text-muted-foreground group-hover:text-primary" />
              </Link>
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY */}
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your classroom</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    {/* Timeline connector */}
                    {i !== 2 && <div className="absolute left-4 top-10 w-px h-10 bg-border" />}
                    
                    <div className="flex-none p-2 bg-muted rounded-full text-muted-foreground border border-background ring-4 ring-background z-10">
                      <Clock size={16} />
                    </div>
                    <div className="space-y-1 pb-2">
                      <p className="text-sm font-medium leading-none text-foreground">New Enrollment</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A new student just enrolled in your "{courses[0]?.title || 'Course'}".
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pt-1">
                        {2 * (i + 1)} hours ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs font-medium text-muted-foreground hover:text-foreground">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default InstructorDashboard;

import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { BookOpen, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/shared/ui/card";

import { Button } from "@/shared/ui/button";

import { useGetCourseProgressQuery } from "@/features/lecture/lectureApi";

function CourseCard({ course, showProgress = false }) {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const isInstructorOwner = (user?._id || user?.id) && (user?._id || user?.id) === (course?.instructor?._id || course?.instructor);

  // REAL PROGRESS

  const { data: progressData } = useGetCourseProgressQuery(
    {
      userId: user?._id || user?.id,

      courseId: course._id,
    },
    {
      skip: !showProgress || !user,
    },
  );

  const progress = progressData?.progressPercentage || 0;

  return (
    <Card
      className="
        group overflow-hidden rounded-3xl border border-border/50 bg-card/60 dark:bg-black/40 backdrop-blur-xl
        transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-xl
        flex flex-col relative
      "
    >
      {/* THUMBNAIL */}
      <div
        className="
          relative flex h-60
          items-center justify-center
          bg-muted overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" 
          />
        ) : (
          <BookOpen size={52} className="text-muted-foreground/30 group-hover:scale-110 transition-transform duration-700" />
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-xs font-semibold text-foreground tracking-widest uppercase shadow-sm">
            {course.category || "Course"}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="space-y-4 pt-6 z-20 relative">
        {/* TITLE */}
        <div>
          <h3 
            className="text-2xl font-bold tracking-tight text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300"
          >
            {course.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground font-light leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* REJECTION FEEDBACK */}
        {isInstructorOwner && course.status === "rejected" && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Action Required</p>
              <p className="text-sm font-medium text-foreground leading-snug">{course.rejectionReason || "Course was rejected. Please review your content."}</p>
            </div>
          </div>
        )}

        {/* INSTRUCTOR */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {course.instructor?.name?.charAt(0) || "G"}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground tracking-wide">
            {course.instructor?.name || "Instructor"}
          </span>
        </div>

        {/* REAL PROGRESS */}
        {showProgress && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              <span>Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary)/0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="pt-2 pb-6 z-20 relative">
        <Button
          className="w-full h-12 rounded-xl font-bold transition-all duration-300 bg-foreground text-background hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_hsla(var(--primary)/0.4)] border-0"
          onClick={() => {
            if (!user) {
              navigate('/register');
              return;
            }
            if (isInstructorOwner) {
              navigate(`/instructor/course/${course._id}/lectures`);
              return;
            }
            navigate(
              showProgress
                ? `/course/${course._id}/player`
                : `/courses/${course._id}`,
            );
          }}
        >
          {isInstructorOwner
            ? "Manage Course"
            : showProgress
              ? progress === 100
                ? "Completed"
                : "Continue Course"
              : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CourseCard;

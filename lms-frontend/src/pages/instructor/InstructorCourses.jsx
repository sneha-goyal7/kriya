import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";

import CourseCard from "@/components/common/CourseCard";
import { EmptyState } from "@/shared/ui/empty-state";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import { useGetInstructorCoursesQuery } from "@/features/instructor/instructorApi";

function InstructorCourses() {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetInstructorCoursesQuery(
    user?._id || user?.id,
    {
      skip: !user,
    }
  );

  const courses = data?.data?.courses || data?.courses || [];

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[380px] w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load courses"
        description="Something went wrong while loading your courses."
      />
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            All Your Courses
          </h1>
          <p className="mt-2 text-muted-foreground font-light text-sm">
            Manage your complete catalog of published and draft courses.
          </p>
        </div>

        <Button asChild className="h-11 rounded-xl px-6 font-medium shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
          <Link to="/instructor/create-course">
            <Plus size={18} className="mr-2" />
            Create New Course
          </Link>
        </Button>
      </div>

      {/* EMPTY */}
      {courses.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">No Courses Found</h3>
            <p className="text-base text-muted-foreground mt-3 max-w-md mb-8">
              You haven't created any courses yet. Start building your first premium curriculum to share your knowledge.
            </p>
            <Button asChild className="rounded-full h-12 px-8">
              <Link to="/instructor/create-course">Build a Course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorCourses;

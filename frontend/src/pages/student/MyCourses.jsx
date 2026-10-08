import { useSelector } from "react-redux";

import CourseCard from "@/components/common/CourseCard";

import { EmptyState } from "@/shared/ui/empty-state";

import { Skeleton } from "@/shared/ui/skeleton";

import { useGetUserEnrollmentsQuery } from "@/features/enrollment/enrollmentApi";

function MyCourses() {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetUserEnrollmentsQuery(
    user?._id || user?.id,
    {
      skip: !user,
    },
  );

  const courses = data?.courses || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />

          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Skeleton key={index} className="h-[420px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load courses"
        description="Something went wrong while loading your enrolled courses."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Learning Path</h1>
        <p className="mt-4 text-lg text-muted-foreground font-light">
          Continue your progress through these curated courses.
        </p>
      </div>

      {/* EMPTY */}

      {courses.length === 0 ? (
        <EmptyState
          title="No enrolled courses"
          description="Enroll in courses to start learning."
        />
      ) : (
        <div
          className="
            grid gap-6
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} showProgress />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;

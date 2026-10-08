import { useMemo, useState } from "react";

import CourseCard from "@/components/common/CourseCard";

import { useGetCoursesQuery } from "@/features/course/courseApi";

import { Input } from "@/shared/ui/input";

import { Skeleton } from "@/shared/ui/skeleton";

import { EmptyState } from "@/shared/ui/empty-state";

const categories = ["All", "Development", "Design", "Business", "Marketing"];

function Courses() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data, isLoading, isError } = useGetCoursesQuery();

  // Fix: Extract courses properly from the backend response structure
  const courses = data?.data?.courses || [];

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, selectedCategory]);

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[420px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <EmptyState
        title="Failed to load courses"
        description="Something went wrong while fetching courses."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center pt-16 pb-8 md:pt-24 md:pb-12">
        <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-medium tracking-tight text-foreground">
          Explore Courses <br className="hidden md:block" />
          <span className="text-primary font-normal">Accelerate Your Career!</span>
        </h1>
      </div>

      {/* Search + Filters */}
      <div className="space-y-8 flex flex-col items-center">
        {/* Search */}
        <div className="w-full max-w-xl px-4">
          <Input
            placeholder="Search disciplines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-background border-border/50 h-14 px-6 text-lg focus-visible:ring-primary/50 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                rounded-full border px-6 py-2.5
                text-sm font-medium tracking-wide
                transition-all duration-300 backdrop-blur-md
                ${
                  selectedCategory === category
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_hsla(var(--primary)/0.2)]"
                    : "border-border/50 bg-background hover:bg-muted/50 hover:border-border text-muted-foreground hover:text-foreground shadow-sm"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Search */}

      {filteredCourses.length === 0 ? (
        <EmptyState
          title="No disciplines found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div
          className="
            grid gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;

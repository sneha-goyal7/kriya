import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { BookOpen, Clock3, Users, Star, PlayCircle, ArrowRight, Video, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { useEnrollCourseMutation, useGetCourseByIdQuery } from "@/features/course/courseApi";
import { useGetCourseProgressQuery } from "@/features/lecture/lectureApi";

import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetCourseByIdQuery(id);
  
  const [enroll, { isLoading: enrolling }] = useEnrollCourseMutation();

  const { data: enrollmentData } = useGetCourseProgressQuery({ courseId: id, userId: user?._id || user?.id }, {
    skip: !user || (user?.primaryType?.toLowerCase() !== "user" && user?.role?.toLowerCase() !== "student")
  });

  const isEnrolled = enrollmentData?.success && enrollmentData?.data;
  const course = data?.course || data?.data?.course;
  const lectures = data?.lectures || data?.data?.lectures || [];

  const role = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
  const isStudent = role === "user" || role === "student" || !role;
  const isInstructorOwner = role === "instructor" && course?.instructor?._id === (user?._id || user?.id);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    try {
      await enroll({ courseId: course._id, userId: user._id || user.id }).unwrap();
      toast.success("Enrolled successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Enrollment failed");
    }
  };

  const handleStartLearning = () => {
    navigate(`/course/${course._id}/player`);
  };

  const handleManageCourse = () => {
    navigate(`/instructor/course/${course._id}/lectures`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-8 max-w-7xl mx-auto">
        <Skeleton className="h-[400px] w-full rounded-[3rem] bg-white/5 border border-white/10" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Skeleton className="h-10 w-2/3 rounded-2xl bg-white/5" />
            <Skeleton className="h-[200px] w-full rounded-[2rem] bg-white/5 border border-white/10" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-[2rem] bg-white/5 border border-white/10" />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return <EmptyState title="Course not found" description="Unable to load course details." />;
  }

  return (
      <div className="relative min-h-screen bg-black overflow-hidden pb-32">
        {/* Dynamic Backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none opacity-50 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none opacity-40 -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 pt-12 md:pt-20 space-y-12">
          
          {/* HERO SECTION */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-8 md:p-16 shadow-2xl group"
          >
            <div className="relative z-10 max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              >
                <Star size={16} className="fill-primary" /> Elite Program
              </motion.div>
              
              <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                {course.title}
              </h1>
              
              <p className="mt-6 max-w-3xl text-xl text-white/70 font-light leading-relaxed">
                {course.description}
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-bold uppercase tracking-widest text-white/50">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Users size={18} className="text-primary" /> Active Cohort</div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Clock3 size={18} className="text-primary" /> Self-Paced</div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><BookOpen size={18} className="text-primary" /> {lectures.length} Modules</div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700">
               <Target size={300} className="text-primary translate-x-1/3" strokeWidth={0.5} />
            </div>
          </motion.section>

          <div className="grid gap-12 xl:grid-cols-12 items-start">
            
            {/* LEFT COLUMN: INFO & CURRICULUM */}
            <div className="xl:col-span-8 space-y-12">
              
              {/* INSTRUCTOR BENTO */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl"
              >
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 text-4xl font-bold text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                  {course.instructor?.name?.charAt(0) || "I"}
                </div>
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                    <Sparkles size={14} className="text-primary" /> Lead Educator
                  </div>
                  <h3 className="text-3xl font-bold text-white">{course.instructor?.name || "Instructor"}</h3>
                  <p className="mt-2 text-white/60 leading-relaxed max-w-lg">
                    An industry veteran committed to guiding you through this curriculum.
                  </p>
                </div>
              </motion.div>

              {/* CURRICULUM BENTO */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl p-10 shadow-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Curriculum</h2>
                    <p className="text-white/50 mt-1">What you will master in this program</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                    <BookOpen size={24} />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {lectures.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-white/20 bg-white/5">
                      <Video size={48} className="text-white/20 mb-4" />
                      <p className="text-white/60 font-medium">Curriculum is currently being structured.</p>
                    </div>
                  ) : (
                    lectures.map((lecture, index) => (
                      <motion.div 
                        key={lecture._id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 transition-all duration-300"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all">
                          <PlayCircle size={20} className="ml-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Module {index + 1}</div>
                          <h4 className="text-lg font-semibold text-white">{lecture.title}</h4>
                        </div>
                        {isEnrolled && (
                          <div className="hidden md:flex shrink-0">
                            <CheckCircle2 size={24} className="text-white/20" />
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: ACTION STICKY CARD */}
            <div className="xl:col-span-4 relative xl:sticky xl:top-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="rounded-[2.5rem] border border-white/10 bg-black/60 backdrop-blur-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]"
              >
                {/* Thumbnail Header */}
                <div className="relative h-64 w-full bg-muted">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt="Thumbnail" 
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-black/80 border-b border-white/10">
                      <BookOpen size={64} className="text-white/20" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                
                <div className="p-8 relative z-10 -mt-10">
                  <div className="mb-8">
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Free Access</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Full Platform Capabilities included</p>
                  </div>

                  <div className="space-y-4">
                    {isInstructorOwner ? (
                      <Button 
                        className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest bg-primary text-black hover:bg-primary/90 box-glow" 
                        onClick={handleManageCourse}
                      >
                        Manage Course
                      </Button>
                    ) : isStudent && isEnrolled ? (
                      <Button 
                        className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest border border-primary text-primary hover:bg-primary/10 transition-all box-glow" 
                        onClick={handleStartLearning}
                      >
                        <PlayCircle size={18} className="mr-2" /> Resume Learning
                      </Button>
                    ) : (
                      <>
                        <Button 
                          className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest bg-primary text-black hover:bg-primary/90 box-glow" 
                          onClick={handleEnroll} 
                          disabled={enrolling}
                        >
                          {enrolling ? "Initiating..." : "Enroll Now"}
                        </Button>
                        {isStudent && (
                          <Button 
                            variant="ghost" 
                            className="w-full h-14 rounded-xl text-sm font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5" 
                            onClick={handleStartLearning}
                          >
                            Preview Content <ArrowRight size={16} className="ml-2" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">This program includes:</h5>
                    <ul className="space-y-3">
                      {["Full lifetime access", "Access on mobile and TV", "Certificate of completion", "Direct AI Mentor Support"].map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-white/80">
                          <CheckCircle2 size={16} className="text-primary mr-3" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default CourseDetails;
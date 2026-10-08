import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { CheckCircle2, PlayCircle, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  useGetLecturesQuery,
  useMarkCompleteMutation,
  useGetCourseProgressQuery,
} from "@/features/lecture/lectureApi";

import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

function LecturePlayer() {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetLecturesQuery(courseId);
  const { data: progressData } = useGetCourseProgressQuery(
    { courseId, userId: user._id || user.id },
    { skip: !courseId || !user }
  );

  const [markComplete] = useMarkCompleteMutation();

  const lectures = data?.lectures || [];
  const completedLectures = progressData?.completedLectures || [];

  const [activeLecture, setActiveLecture] = useState(null);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (lectures.length > 0 && !activeLecture) {
      setActiveLecture(lectures[0]);
    }
  }, [lectures, activeLecture]);

  const handleComplete = async (lectureId) => {
    try {
      await markComplete({
        lectureId,
        userId: user._id || user.id,
      }).unwrap();

      toast.success("Lecture marked complete");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update progress");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4 max-w-[1600px] mx-auto p-6 min-h-screen">
        <Skeleton className="h-[700px] w-full rounded-none bg-white/5 border border-white/10" />
        <div className="space-y-5 lg:col-span-3">
          <Skeleton className="h-[500px] w-full rounded-none bg-white/5 border border-white/10" />
          <Skeleton className="h-10 w-1/2 bg-white/5" />
          <Skeleton className="h-5 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load lectures"
        description="Something went wrong while loading lectures."
      />
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <EmptyState
          title="No lectures available"
          description="Lectures will appear here once added."
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-hidden">
      
      {/* Cinematic Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-5 pointer-events-none dark:opacity-10" />

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 grid gap-8 lg:grid-cols-12 items-start">
        
        {/* PLAYER AREA */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group relative"
          >
            {/* Player Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 to-transparent blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
            
            <div className="relative overflow-hidden rounded-xl border border-border/40 bg-black pt-[56.25%] shadow-2xl">
              {getYouTubeId(activeLecture?.videoUrl) ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(activeLecture?.videoUrl)}?rel=0&modestbranding=1&autohide=1&showinfo=0`}
                  title={activeLecture?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-card/80">
                  <BookOpen size={48} className="mb-4 text-primary/30" />
                  <p className="font-medium text-xl">Invalid Video URL or Signal Lost</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl p-8 lg:p-10 shadow-lg"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary text-xs uppercase tracking-widest font-bold">Now Playing</span>
                  <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                </div>
                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                  {activeLecture?.title}
                </h1>
                <p className="mt-4 text-muted-foreground font-light text-lg">
                  Absorb the knowledge and take one step closer to absolute mastery.
                </p>
              </div>

              <div className="shrink-0 mt-2 md:mt-0">
                <Button
                  onClick={() => handleComplete(activeLecture._id)}
                  disabled={completedLectures.includes(activeLecture?._id)}
                  className={`
                    gap-3 h-14 rounded-full px-8 uppercase tracking-widest font-bold text-xs transition-all duration-500
                    ${completedLectures.includes(activeLecture?._id) 
                      ? "border border-green-500/30 bg-green-500/10 text-green-500 cursor-default"
                      : "box-glow border border-primary bg-primary hover:bg-primary/80 text-primary-foreground"}
                  `}
                >
                  <CheckCircle2 size={18} />
                  {completedLectures.includes(activeLecture?._id) ? "Completed" : "Mark as Completed"}
                </Button>
              </div>
            </div>

            {/* Lecture Notes Section */}
            {activeLecture?.notes && (
              <div className="mt-8 pt-8 border-t border-border/30">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen size={20} className="text-primary" />
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">Lecture Notes</h3>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {activeLecture.notes}
                </div>
              </div>
            )}
          </motion.div>

        </div>

        {/* SIDEBAR */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-8 h-auto lg:h-[calc(100vh-4rem)] flex flex-col rounded-xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-lg"
        >
          <div className="p-6 border-b border-border/30 bg-card/40 rounded-t-xl">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
              <Sparkles size={18} className="text-primary" />
              Curriculum
            </h2>
            <div className="mt-4 w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedLectures.length / Math.max(1, lectures.length)) * 100}%` }}
                transition={{ duration: 1 }}
                className="bg-primary h-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-3 text-right">
              {completedLectures.length} / {lectures.length} Completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {lectures.map((lecture, index) => {
              const isActive = activeLecture?._id === lecture._id;
              const isCompleted = completedLectures.includes(lecture._id);

              return (
                <button
                  key={lecture._id}
                  onClick={() => setActiveLecture(lecture)}
                  className={`
                    w-full flex items-start gap-4 p-4 text-left transition-all duration-300 border-l-2 group
                    ${isActive 
                      ? "border-primary bg-primary/10" 
                      : "border-transparent hover:border-primary/40 hover:bg-muted"}
                  `}
                >
                  <div className="shrink-0 mt-1">
                    {isActive ? (
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-40 animate-ping"></span>
                        <PlayCircle size={20} className="relative text-primary z-10" />
                      </div>
                    ) : isCompleted ? (
                      <CheckCircle2 size={20} className="text-green-500 opacity-80" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-muted-foreground/30 group-hover:border-primary/50 transition-colors flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground/60 group-hover:text-primary/70">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm font-medium leading-tight ${isActive ? "text-primary font-semibold" : "text-foreground group-hover:text-primary/80 transition-colors"}`}>
                      {lecture.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground font-light uppercase tracking-widest">
                      {isCompleted ? "Completed" : `Part ${index + 1}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LecturePlayer;

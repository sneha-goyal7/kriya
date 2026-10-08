import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Plus, PlayCircle, ClipboardList, BookText, 
  ArrowLeft, LayoutDashboard, Video, FileText, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";

import { 
  useGetLecturesQuery, 
  useCreateLectureMutation 
} from "@/features/lecture/lectureApi";
import { useGetCourseByIdQuery } from "@/features/course/courseApi";
import { 
  useGetCourseAssignmentsQuery, 
  useCreateAssignmentMutation 
} from "@/features/assignment/assignmentApi";

function ManageLectures() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("lecture");

  const { data: courseRes, isLoading: isCourseLoading } = useGetCourseByIdQuery(courseId);
  const { data: lecturesRes, isLoading: isLecturesLoading } = useGetLecturesQuery(courseId);
  const { data: assignmentsRes, isLoading: isAssignmentsLoading } = useGetCourseAssignmentsQuery(courseId);
  
  const [createLecture, { isLoading: isCreatingLecture }] = useCreateLectureMutation();
  const [createAssignment, { isLoading: isCreatingAssignment }] = useCreateAssignmentMutation();

  const course = courseRes?.data?.course || courseRes?.course;
  const lectures = lecturesRes?.data?.lectures || lecturesRes?.lectures || [];
  const assignments = assignmentsRes?.data?.assignments || assignmentsRes?.assignments || [];

  const [lectureData, setLectureData] = useState({ title: "", videoUrl: "", notes: "" });
  const [assignmentData, setAssignmentData] = useState({
    title: "", moduleName: "", skillTag: "", brief: "", 
    timeEstimateMinutes: 30, acceptedFormat: "github", acceptanceCriteria: "",
  });

  const handleLectureChange = (e) => setLectureData({ ...lectureData, [e.target.name]: e.target.value });
  const handleAssignmentChange = (e) => setAssignmentData({ ...assignmentData, [e.target.name]: e.target.value });

  const handleLectureSubmit = async (e) => {
    e.preventDefault();
    if (!lectureData.title || !lectureData.videoUrl) {
      return toast.error("Please fill in required lecture fields.");
    }
    try {
      await createLecture({
        course: courseId,
        title: lectureData.title,
        videoUrl: lectureData.videoUrl,
        notes: lectureData.notes,
        order: lectures.length + 1,
      }).unwrap();
      toast.success("Lecture created successfully");
      setLectureData({ title: "", videoUrl: "", notes: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create lecture");
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentData.title || !assignmentData.moduleName || !assignmentData.brief) {
      return toast.error("Please fill in required assignment fields.");
    }
    try {
      await createAssignment({
        courseId,
        ...assignmentData,
        acceptanceCriteria: assignmentData.acceptanceCriteria.split('\n').filter(c => c.trim()),
      }).unwrap();
      toast.success("Assignment created successfully");
      setAssignmentData({
        title: "", moduleName: "", skillTag: "", brief: "", 
        timeEstimateMinutes: 30, acceptedFormat: "github", acceptanceCriteria: "",
      });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create assignment");
    }
  };

  if (isCourseLoading || isLecturesLoading || isAssignmentsLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
        <Skeleton className="h-[200px] w-full rounded-[2rem] bg-muted border border-border" />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-[600px] w-full lg:col-span-2 rounded-[2rem] bg-muted border border-border" />
          <Skeleton className="h-[500px] w-full rounded-[2rem] bg-muted border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden pb-24">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none opacity-40 -translate-x-1/3 translate-y-1/3" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-5 dark:opacity-20 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl p-4 md:p-8 space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between rounded-[2rem] border border-border/40 bg-card/60 backdrop-blur-xl p-8 box-glow"
        >
          <div>
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground hover:bg-muted -ml-4" onClick={() => navigate('/instructor/dashboard')}>
              <ArrowLeft size={16} className="mr-2" /> Dashboard
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary mb-4">
              <LayoutDashboard size={14} /> Curriculum Builder
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {course?.title || "Manage Course"}
            </h1>
          </div>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: CURRICULUM LIST */}
          <div className="xl:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.1 }}
              className="rounded-[2rem] border border-border/40 bg-card/60 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Video size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Lectures</h2>
              </div>

              {lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/50 bg-muted/30">
                  <Video size={48} className="text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No Lectures Yet</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">Use the panel on the right to add video lectures and build your curriculum.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lectures.map((lecture, i) => (
                    <motion.div 
                      key={lecture._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/40 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-transform">
                          <PlayCircle size={24} className="ml-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-foreground truncate">
                            {lecture.order}. {lecture.title}
                          </h4>
                          <a href={lecture.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate block mt-1">
                            {lecture.videoUrl}
                          </a>
                        </div>
                      </div>
                      
                      {lecture.notes && (
                        <div className="mt-2 p-4 rounded-xl bg-muted/40 border border-border/30 flex gap-3 text-sm text-muted-foreground">
                          <BookText size={18} className="text-primary shrink-0 mt-0.5" />
                          <p className="whitespace-pre-wrap leading-relaxed">{lecture.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
              className="rounded-[2rem] border border-border/40 bg-card/60 backdrop-blur-xl p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                  <ClipboardList size={24} />
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Assignments</h2>
              </div>

              {assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/50 bg-muted/30">
                  <ClipboardList size={48} className="text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No Assignments</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">Create hands-on assignments to challenge your students.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment, i) => (
                    <motion.div 
                      key={assignment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-2xl border border-border/40 bg-card hover:bg-muted/50 hover:border-orange-500/50 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 rounded-full bg-muted border border-border/50 text-xs font-bold uppercase tracking-widest text-foreground">
                            {assignment.moduleName}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500">
                            {assignment.timeEstimateMinutes} Mins
                          </div>
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-foreground mb-2">{assignment.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{assignment.brief}</p>
                      
                      <div className="p-4 rounded-xl bg-muted/40 border border-border/30">
                        <h5 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Acceptance Criteria
                        </h5>
                        <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                          {assignment.acceptanceCriteria?.map((crit, idx) => (
                            <li key={idx}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="xl:col-span-5 relative xl:sticky xl:top-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-[2rem] border border-border/40 bg-card/80 backdrop-blur-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex border-b border-border/40 bg-muted/30">
                <button
                  onClick={() => setActiveTab("lecture")}
                  className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-all ${
                    activeTab === "lecture" 
                      ? "text-primary bg-primary/10 border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Video size={16} /> New Lecture
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("assignment")}
                  className={`flex-1 py-5 text-sm font-bold uppercase tracking-widest transition-all ${
                    activeTab === "assignment" 
                      ? "text-orange-500 bg-orange-500/10 border-b-2 border-orange-500" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText size={16} /> New Assignment
                  </div>
                </button>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === "lecture" && (
                    <motion.form 
                      key="lecture-form"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleLectureSubmit} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Lecture Title</label>
                        <Input name="title" placeholder="e.g. Introduction to Next.js" value={lectureData.title} onChange={handleLectureChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-primary/50" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Video URL</label>
                        <Input name="videoUrl" placeholder="https://youtube.com/watch?v=..." value={lectureData.videoUrl} onChange={handleLectureChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-primary/50" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                          <span>Lecture Notes</span>
                          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">New</span>
                        </label>
                        <Textarea name="notes" placeholder="Add supplementary reading, links, or code snippets..." value={lectureData.notes} onChange={handleLectureChange} className="min-h-[120px] bg-background border-border/50 text-foreground rounded-xl focus:border-primary/50 resize-y" />
                      </div>

                      <Button type="submit" disabled={isCreatingLecture} className="w-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 box-glow mt-4">
                        {isCreatingLecture ? "Adding..." : <><Plus size={18} className="mr-2" /> Publish Lecture</>}
                      </Button>
                    </motion.form>
                  )}

                  {activeTab === "assignment" && (
                    <motion.form 
                      key="assignment-form"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleAssignmentSubmit} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assignment Title</label>
                        <Input name="title" placeholder="e.g. Build a To-Do App" value={assignmentData.title} onChange={handleAssignmentChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Module Name</label>
                          <Input name="moduleName" placeholder="e.g. Week 1" value={assignmentData.moduleName} onChange={handleAssignmentChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Skill Tag</label>
                          <Input name="skillTag" placeholder="e.g. React" value={assignmentData.skillTag} onChange={handleAssignmentChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Instructions (Brief)</label>
                        <Textarea name="brief" placeholder="Describe what the student needs to build..." value={assignmentData.brief} onChange={handleAssignmentChange} className="min-h-[100px] bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50 resize-y" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Acceptance Criteria (One per line)</label>
                        <Textarea name="acceptanceCriteria" placeholder="- App must run without errors&#10;- Uses functional components" value={assignmentData.acceptanceCriteria} onChange={handleAssignmentChange} className="min-h-[100px] bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50 resize-y" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. Time (Mins)</label>
                          <Input name="timeEstimateMinutes" type="number" min="1" value={assignmentData.timeEstimateMinutes} onChange={handleAssignmentChange} className="h-12 bg-background border-border/50 text-foreground rounded-xl focus:border-orange-500/50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Format</label>
                          <select name="acceptedFormat" value={assignmentData.acceptedFormat} onChange={handleAssignmentChange} className="flex h-12 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-orange-500/50 outline-none">
                            <option value="github">GitHub Repo</option>
                            <option value="url">Live URL</option>
                            <option value="document">Document</option>
                          </select>
                        </div>
                      </div>

                      <Button type="submit" disabled={isCreatingAssignment} className="w-full h-14 bg-orange-500 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.4)] mt-4">
                        {isCreatingAssignment ? "Adding..." : <><Plus size={18} className="mr-2" /> Publish Assignment</>}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageLectures;
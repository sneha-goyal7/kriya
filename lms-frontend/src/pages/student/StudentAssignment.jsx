import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSubmitAssignmentMutation, useGetMySubmissionsQuery } from "@/features/submission/submissionApi";
import { useGetAssignmentForNodeQuery } from "@/features/career/careerApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { CheckCircle2, AlertTriangle, ExternalLink, Code, FileText, Globe, Clock, History } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/shared/ui/page-loader";

export default function StudentAssignment() {
  const { assignmentId } = useParams();
  
  // assignmentId is now the nodeId!
  const { data: assignmentData, isLoading: isAssignmentLoading } = useGetAssignmentForNodeQuery(assignmentId);
  const assignment = assignmentData?.data?.assignment;
  
  const { data: historyData, isLoading: historyLoading } = useGetMySubmissionsQuery(assignment?._id, {
    skip: !assignment?._id
  });
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
  
  const [content, setContent] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  if (isAssignmentLoading || historyLoading) return <PageLoader />;

  if (!assignment) {
    return <div className="p-8 text-center text-muted-foreground">Assignment could not be loaded.</div>;
  }

  const history = historyData?.data?.submissions || [];
  const latestSubmission = history.length > 0 ? history[0] : null;

  // Rate limiting logic
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentFails = history.filter(sub => sub.status === "failed" && new Date(sub.createdAt) > yesterday);
  const isCooldown = recentFails.length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCooldown) return toast.error("You are on a 48-hour cooldown.");

    try {
      await submitAssignment({
        assignmentId: actualId,
        format: assignment.acceptedFormat,
        content,
        studentNote
      }).unwrap();
      
      toast.success("Assignment submitted successfully!");
      setContent("");
      setStudentNote("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit assignment.");
    }
  };

  const FormatIcon = assignment.acceptedFormat === "github" ? Code : assignment.acceptedFormat === "url" ? Globe : FileText;

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-primary font-bold text-sm tracking-widest uppercase">{assignment.skillTag} &middot; {assignment.moduleName}</span>
          <h1 className="text-3xl font-black mt-2">{assignment.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock size={16} />
          Est. {assignment.timeEstimateMinutes} mins
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Brief and Criteria */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
              <FileText size={150} strokeWidth={0.5} className="text-primary rotate-12" />
            </div>
            <CardHeader className="bg-primary/5 border-b border-border/40 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <FileText size={20} />
                </div>
                Assignment Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none relative z-10">
              <p className="text-lg leading-relaxed text-muted-foreground">{assignment.brief}</p>
              
              {assignment.exampleOutputUrl && (
                <div className="mt-8 p-5 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-colors duration-500 flex items-center justify-between group/link">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground m-0">Reference Output</h4>
                      <p className="text-xs text-muted-foreground m-0">View the expected final result</p>
                    </div>
                  </div>
                  <a href={assignment.exampleOutputUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-medium text-sm group-hover/link:text-primary/80 transition-colors">
                    View <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-secondary/5 border-b border-border/40 pb-6 pt-8 px-8">
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-xl text-secondary-foreground">
                  <CheckCircle2 size={20} />
                </div>
                Acceptance Criteria
              </CardTitle>
              <CardDescription className="text-base mt-2">Your submission must meet all of these points to pass.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {assignment.acceptanceCriteria.map((crit, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/30 hover:border-secondary/30 transition-colors">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-foreground leading-relaxed pt-1">{crit}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {assignment.commonMistakes?.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5 shadow-lg rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-6 pt-8 px-8 border-b border-destructive/10">
                <CardTitle className="text-destructive flex items-center gap-3 text-xl font-bold tracking-tight">
                  <div className="p-2 bg-destructive/10 rounded-xl">
                    <AlertTriangle size={20} />
                  </div>
                  Common Mistakes (Avoid These!)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-3 text-muted-foreground">
                  {assignment.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-destructive mt-1 shrink-0">&times;</span>
                      <span className="leading-relaxed">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Submission Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Submit Your Work</CardTitle>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-background px-2 py-1 rounded border border-border/50">
                  <FormatIcon size={14} />
                  {assignment.acceptedFormat} Required
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              
              {isCooldown ? (
                <div className="p-6 text-center space-y-4">
                  <AlertTriangle size={48} className="mx-auto text-destructive opacity-80" />
                  <h3 className="text-xl font-bold text-destructive">Cooldown Active</h3>
                  <p className="text-muted-foreground">You have 3 failed submissions in the last 24 hours. Please review your feedback and try again after 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">
                      {assignment.acceptedFormat === "github" ? "GitHub Repository URL" : 
                       assignment.acceptedFormat === "url" ? "Live Project URL" : "Document Content / Link"}
                    </label>
                    {assignment.acceptedFormat === "document" ? (
                      <Textarea 
                        required
                        placeholder="Paste your document link or write directly here (min 50 words)..."
                        className="min-h-[200px]"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                      />
                    ) : (
                      <Input 
                        required
                        type="url"
                        placeholder={assignment.acceptedFormat === "github" ? "https://github.com/username/repo" : "https://myproject.vercel.app"}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="font-mono text-sm"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Student Note (Optional)</label>
                    <Textarea 
                      placeholder="Briefly explain your approach or any challenges you faced..."
                      className="resize-none h-24"
                      value={studentNote}
                      onChange={e => setStudentNote(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? "Running AI Verification..." : "Submit for Verification"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground font-medium">
                    AI verification takes ~5 seconds. You can resubmit if you fail.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Verification Verdict Display */}
          {latestSubmission && (
            <Card className={`border-2 ${
              latestSubmission.status === "passed" ? "border-green-500/50 bg-green-500/5" :
              latestSubmission.status === "failed" ? "border-destructive/50 bg-destructive/5" :
              latestSubmission.status === "format_failed" ? "border-orange-500/50 bg-orange-500/5" :
              "border-blue-500/50 bg-blue-500/5"
            }`}>
              <CardHeader className="pb-3 border-b border-border/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Latest Verdict</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    latestSubmission.status === "passed" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                    latestSubmission.status === "failed" ? "bg-destructive/20 text-destructive" :
                    latestSubmission.status === "format_failed" ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                    "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  }`}>
                    {latestSubmission.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                
                {latestSubmission.status === "format_failed" && (
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {latestSubmission.instructorFeedback}
                  </p>
                )}

                {(latestSubmission.status === "passed" || latestSubmission.status === "failed" || latestSubmission.status === "flagged_for_review") && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold text-muted-foreground">AI Score</div>
                      <div className="text-3xl font-black">{latestSubmission.score}<span className="text-muted-foreground text-xl font-medium">/100</span></div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Criteria Breakdown</h4>
                      {latestSubmission.criteriaVerdicts.map((crit, idx) => (
                        <div key={idx} className="p-3 bg-background rounded border border-border/50 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">{crit.criterion}</span>
                            <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded ${
                              crit.status === "met" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                              "bg-destructive/20 text-destructive"
                            }`}>
                              {crit.status === "met" ? "MET" : "NOT MET"}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">{crit.reason}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <h4 className="text-xs font-bold text-green-500 mb-2 uppercase">Strengths</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                          {latestSubmission.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-destructive mb-2 uppercase">Improvements</h4>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                          {latestSubmission.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                
                {history.length > 1 && (
                  <Button variant="outline" className="w-full text-xs" onClick={() => setShowHistory(!showHistory)}>
                    <History size={14} className="mr-2" />
                    {showHistory ? "Hide History" : `View Past Attempts (${history.length - 1})`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

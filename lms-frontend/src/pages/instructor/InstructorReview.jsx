import { useState } from "react";
import { useGetInstructorQueueQuery, useOverrideVerdictMutation } from "@/features/submission/submissionApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { ExternalLink, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import PageLoader from "@/shared/ui/page-loader";

export default function InstructorReview() {
  const { data, isLoading } = useGetInstructorQueueQuery();
  const [overrideVerdict, { isLoading: isOverriding }] = useOverrideVerdictMutation();
  const [feedback, setFeedback] = useState({});

  if (isLoading) return <PageLoader />;

  const queue = data?.data?.queue || [];

  const handleOverride = async (id, status) => {
    if (!feedback[id]) return toast.error("Please provide a reason for the override.");

    try {
      await overrideVerdict({ id, status, feedback: feedback[id] }).unwrap();
      toast.success(`Verdict overridden to ${status.toUpperCase()}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to override verdict.");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-black">Instructor Spot Check Queue</h1>
        <p className="text-muted-foreground mt-2">
          These submissions were flagged by the AI (Score 45-65 or Plagiarism). Add your human judgment to override the verdict.
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/50 rounded-lg text-muted-foreground">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold">Queue is Empty</h3>
          <p>No submissions require manual review right now.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map(submission => (
            <Card key={submission._id} className="border-orange-500/30 shadow-md">
              <CardHeader className="bg-orange-500/5 border-b border-border/50 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{submission.assignment?.title || "Unknown Assignment"}</CardTitle>
                    <CardDescription className="mt-1">
                      Submitted by <span className="font-bold text-foreground">{submission.student?.name}</span> ({submission.student?.email})
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
                      AI Flagged
                    </span>
                    <span className="text-sm mt-1 text-muted-foreground">AI Score: <strong className="text-foreground">{submission.score}/100</strong></span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* AI Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-bold border-b border-border/50 pb-2">AI Criteria Breakdown</h3>
                  <div className="space-y-3">
                    {submission.criteriaVerdicts.map((crit, idx) => (
                      <div key={idx} className="p-3 bg-card rounded border border-border/50 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{crit.criterion}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
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
                      <h4 className="text-xs font-bold text-green-500 mb-2 uppercase">AI Strengths</h4>
                      <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                        {submission.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-destructive mb-2 uppercase">AI Improvements</h4>
                      <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                        {submission.improvements.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Human Override Panel */}
                <div className="space-y-6">
                  <div className="p-4 bg-secondary/20 rounded-lg border border-border/50">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <ExternalLink size={18} className="text-primary" />
                      Student Submission
                    </h3>
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground mr-2">Format:</span>
                      <span className="uppercase font-bold">{submission.format}</span>
                    </div>
                    <div className="mt-2 p-3 bg-background rounded border border-border/50 overflow-x-auto text-sm font-mono">
                      {submission.format !== "document" ? (
                        <a href={submission.content} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          {submission.content}
                        </a>
                      ) : (
                        submission.content
                      )}
                    </div>
                    {submission.studentNote && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-900 dark:text-blue-200">
                        <strong>Student Note:</strong> "{submission.studentNote}"
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" />
                        Human Override Reason
                      </label>
                      <Textarea 
                        required
                        placeholder="Explain why you are overriding the AI verdict (this will be sent to the student)..."
                        className="h-24"
                        value={feedback[submission._id] || ""}
                        onChange={e => setFeedback({...feedback, [submission._id]: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        disabled={isOverriding}
                        onClick={() => handleOverride(submission._id, "failed")}
                      >
                        <XCircle size={16} className="mr-2" />
                        Override as FAILED
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isOverriding}
                        onClick={() => handleOverride(submission._id, "passed")}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Override as PASSED
                      </Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

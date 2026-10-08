import { useState } from "react";
import { 
  useGetContentQueueQuery, 
  useApproveContentMutation, 
  useRejectContentMutation 
} from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { Clock, CheckCircle, XCircle, Send, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

function AdminReview() {
  const { data, isLoading } = useGetContentQueueQuery();
  const [approveContent] = useApproveContentMutation();
  const [rejectContent] = useRejectContentMutation();

  const [rejectingId, setRejectingId] = useState(null);
  const [feedback, setFeedback] = useState("");

  if (isLoading) return <PageLoader />;

  const queue = data?.data?.queue || [];

  const handleApprove = async (id) => {
    try {
      await approveContent(id).unwrap();
      toast.success("Content published instantly");
    } catch (e) {
      toast.error("Failed to approve content");
    }
  };

  const handleReject = async (e, id) => {
    e.preventDefault();
    if (!feedback.trim()) return toast.error("Feedback is required");

    try {
      await rejectContent({ id, feedback }).unwrap();
      toast.success("Feedback sent to instructor");
      setRejectingId(null);
      setFeedback("");
    } catch (e) {
      toast.error("Failed to reject content");
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleReject(e, id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Review</h1>
          <p className="text-muted-foreground mt-2 font-light">Target SLA: 48 hours. Oldest submissions prioritized.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold text-sm">
          <Clock size={16} />
          {queue.length} Pending
        </div>
      </div>

      <div className="space-y-4">
        {queue.length === 0 ? (
          <div className="p-12 border border-dashed border-border/50 text-center text-muted-foreground flex flex-col items-center justify-center bg-card/10">
            <CheckCircle className="text-green-500 mb-4 h-12 w-12 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">Queue is empty</h3>
            <p className="text-sm mt-1">All instructors are unblocked.</p>
          </div>
        ) : (
          queue.map((item) => (
            <div key={item._id} className="bg-card/40 border border-border/50 p-6 flex flex-col hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center"><FileText size={14} className="mr-1" /> {item.category}</span>
                    <span>By: <span className="text-foreground font-medium">{item.instructor?.name || "Unknown"}</span></span>
                    <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {rejectingId !== item._id && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                      onClick={() => setRejectingId(item._id)}
                    >
                      <XCircle size={16} className="mr-2" /> Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      onClick={() => handleApprove(item._id)}
                    >
                      <CheckCircle size={16} className="mr-2" /> Approve & Publish
                    </Button>
                  </div>
                )}
              </div>

              {/* REJECTION UI */}
              {rejectingId === item._id && (
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-md">
                  <label className="text-sm font-bold text-destructive mb-2 block">Rejection Feedback (sent to instructor via email)</label>
                  <form onSubmit={(e) => handleReject(e, item._id)} className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input 
                        autoFocus
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item._id)}
                        placeholder="e.g. The assignment criteria is too vague. Please specify the required tech stack..."
                        className="bg-background border-destructive/30"
                      />
                    </div>
                    <Button type="button" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                    <Button type="submit" variant="destructive">
                      <Send size={16} className="mr-2" /> Send (Cmd+Enter)
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminReview;
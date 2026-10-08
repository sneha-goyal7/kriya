import { useState } from "react";
import { useGetFeedbacksQuery } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { MessageSquare, Star, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";

function AdminFeedback() {
  const { data, isLoading } = useGetFeedbacksQuery();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <PageLoader />;

  const feedbacks = data?.data?.feedbacks || [];

  const displayedFeedbacks = feedbacks.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
          <p className="text-muted-foreground mt-2 font-light">View and manage feedback submitted by users.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 border border-border/50 rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search feedback..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {displayedFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare className="h-10 w-10 mb-4 opacity-20" />
                      <p>No feedback entries found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedFeedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {item.rating ? (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"} 
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-md align-top">
                      <p className="text-sm text-foreground/80 leading-relaxed">{item.message}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground align-top">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;

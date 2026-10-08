import { useState } from "react";
import { 
  useGetInstructorsQuery, 
  useSuspendInstructorMutation,
  useRevokePublishingMutation
} from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { AlertCircle, Ban, Star, Clock, MoreHorizontal, CheckCircle2, ShieldOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { Input } from "@/shared/ui/input";

function AdminInstructors() {
  const { data, isLoading } = useGetInstructorsQuery();
  const [suspendInstructor] = useSuspendInstructorMutation();
  const [revokePublishing] = useRevokePublishingMutation();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <PageLoader />;

  const instructors = data?.data?.instructors || [];

  const handleSuspend = async (id, isSuspended) => {
    try {
      await suspendInstructor(id).unwrap();
      toast.success(`Instructor ${isSuspended ? 'restored' : 'suspended'} successfully`);
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleRevoke = async (id, isRevoked) => {
    try {
      await revokePublishing(id).unwrap();
      toast.success(`Publishing rights ${isRevoked ? 'restored' : 'revoked'}`);
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const displayedInstructors = instructors.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Management</h1>
          <p className="text-muted-foreground mt-2 font-light">Monitor aggregate performance and enforce quality standards.</p>
        </div>
        <div className="flex items-center">
          <Input 
            placeholder="Search instructors..." 
            className="w-full md:w-72 bg-card/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Instructor</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedInstructors.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-muted-foreground">
                    No instructors found.
                  </td>
                </tr>
              ) : (
                displayedInstructors.map((instructor) => (
                  <tr key={instructor._id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${instructor.isSuspended ? 'opacity-60 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{instructor.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{instructor.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {instructor.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            <Ban size={12} /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {instructor.publishingRevoked && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldOff size={12} /> Pub Revoked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={instructor.publishingRevoked ? "border-primary text-primary" : "text-muted-foreground"}
                          onClick={() => handleRevoke(instructor._id, instructor.publishingRevoked)}
                        >
                          {instructor.publishingRevoked ? "Restore Pub" : "Revoke Pub"}
                        </Button>
                        <Button 
                          variant={instructor.isSuspended ? "default" : "destructive"}
                          size="sm"
                          className={instructor.isSuspended ? "" : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"}
                          onClick={() => handleSuspend(instructor._id, instructor.isSuspended)}
                        >
                          {instructor.isSuspended ? "Restore Account" : "Suspend"}
                        </Button>
                      </div>
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

export default AdminInstructors;
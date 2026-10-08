import { useGetHiringPartnersQuery, useTogglePartnerVerificationMutation } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function AdminPartners() {
  const { data, isLoading } = useGetHiringPartnersQuery();
  const [toggleVerification] = useTogglePartnerVerificationMutation();

  if (isLoading) return <PageLoader />;

  const employers = data?.data?.employers || [];

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleVerification(id).unwrap();
      toast.success(currentStatus ? "Verification revoked" : "Partner verified successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hiring Partners</h1>
          <p className="text-muted-foreground mt-2 font-light">Verify company identities to grant them access to the talent pool.</p>
        </div>
      </div>

      <div className="border border-border/50 rounded-lg overflow-hidden bg-card/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Company</th>
                <th className="px-6 py-4 font-medium tracking-wider">Industry</th>
                <th className="px-6 py-4 font-medium tracking-wider">Size</th>
                <th className="px-6 py-4 font-medium tracking-wider">Website</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {employers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                    No hiring partners found.
                  </td>
                </tr>
              ) : (
                employers.map((emp) => (
                  <tr key={emp._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{emp.companyName}</div>
                      <div className="text-xs text-muted-foreground mt-1">{emp.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.industry}</td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.size}</td>
                    <td className="px-6 py-4">
                      <a href={emp.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline hover:text-primary/80 transition-colors w-max">
                        {emp.website.replace(/^https?:\/\//, '')}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {emp.verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggle(emp._id, emp.verified)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                          emp.verified 
                            ? 'bg-secondary/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive' 
                            : 'bg-primary text-black hover:bg-primary/80 box-glow'
                        }`}
                      >
                        {emp.verified ? 'Revoke' : 'Approve'}
                      </button>
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

export default AdminPartners;

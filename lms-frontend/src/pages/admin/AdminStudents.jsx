import { useState } from "react";
import { useGetStudentsQuery } from "@/features/admin/adminApi";
import PageLoader from "@/shared/ui/page-loader";
import { Users, Search, User, Mail } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

function AdminStudents() {
  const { data, isLoading } = useGetStudentsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <PageLoader />;

  const students = data?.data?.students || [];

  // Filter logic
  const displayedStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground mt-2 font-light">View all registered students on the platform.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/50 p-4 border border-border/50 rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
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
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => (
                  <tr key={student._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium capitalize">{student.primaryType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{new Date(student.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                          title="View Profile"
                          onClick={() => toast.info("Profile view coming soon")}
                        >
                          <User size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                          title="Message Student"
                          onClick={() => toast.info("Messaging coming soon")}
                        >
                          <Mail size={16} />
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

export default AdminStudents;
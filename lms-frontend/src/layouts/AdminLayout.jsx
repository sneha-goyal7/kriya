import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Building, 
  GraduationCap, 
  LineChart, 
  Settings, 
  LogOut,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

import { useLogoutMutation } from "@/features/auth/authApi";
import { logout } from "@/features/auth/authSlice";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (e) {
      dispatch(logout());
      navigate("/login");
    }
  };

  const navItems = [
    { title: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "Content Review", icon: BookOpen, href: "/admin/review", badge: 14 },
    { title: "Instructors", icon: GraduationCap, href: "/admin/instructors" },
    { title: "Students", icon: Users, href: "/admin/students" },
    { title: "Hiring Partners", icon: Building, href: "/admin/partners" },
    { title: "Feedback", icon: MessageSquare, href: "/admin/feedback" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR */}
      <aside className="w-64 fixed top-0 left-0 h-screen border-r border-border/50 bg-card/30 flex flex-col justify-between z-40">
        <div>
          {/* BRAND */}
          <div className="h-16 flex items-center px-6 border-b border-border/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mr-3">
              <Sparkles size={16} />
            </div>
            <span className="text-lg font-bold tracking-tight">Admin OS</span>
          </div>

          {/* NAV */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.title}
                </div>
                {item.badge ? (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="text-muted-foreground hover:text-foreground">
              <Settings size={18} />
            </Button>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={18} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;

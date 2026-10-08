import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, Settings2, User as UserIcon, Bell } from "lucide-react";
import { navigationConfig } from "@/config/navigation";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Logo } from "@/components/common/Logo";
import { useLogoutMutation } from "@/features/auth/authApi";
import { logout } from "@/features/auth/authSlice";

function DashboardTopbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const role = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase() || "student";
  const navItems = navigationConfig[role] || [];

  const [logoutApi] = useLogoutMutation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (e) {
      console.error("Logout API failed", e);
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <header className="relative mx-auto max-w-7xl h-16 px-6 md:px-8 bg-background/70 backdrop-blur-2xl border border-border/50 rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 flex items-center justify-between transition-colors duration-300 pointer-events-auto">
        
        {/* BRANDING */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <Logo className="h-5 text-foreground" showText={true} />
          </Link>

          {/* NAVIGATION (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 border-l border-border/50 pl-6">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? "text-primary bg-primary/10 shadow-inner" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* NOTIFICATION BELL */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50 focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
          </button>

          {/* User Profile Dropdown (CSS group-hover) */}
          <div className="relative group">
            <button className="flex items-center gap-3 pl-4 border-l border-border/50 focus:outline-none transition-opacity hover:opacity-80">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold tracking-tight text-foreground leading-none">{user?.name || "Student"}</span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{role}</span>
              </div>
              <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md box-glow">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || <UserIcon size={16} />
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[999] pointer-events-auto">
              <div className="bg-popover border border-border/50 rounded-2xl shadow-xl overflow-hidden p-2">
                <div className="px-3 py-2 border-b border-border/50 mb-2 sm:hidden">
                   <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                   <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                  <Settings2 size={16} />
                  Profile Settings
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default DashboardTopbar;

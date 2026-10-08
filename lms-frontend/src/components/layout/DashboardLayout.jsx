import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Map,
  Settings,
} from "lucide-react";

import { useState } from "react";

import { logout } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApi";

import { Button } from "@/shared/ui/button";
import { Logo } from "@/components/common/Logo";

function DashboardLayout({ children }) {
  const location = useLocation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [logoutApi] = useLogoutMutation();

  // Logout

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (e) {
      console.error("Logout API failed", e);
      // Fallback in case of server error
      dispatch(logout());
      navigate("/login");
    }
  };

  // Navigation

  const studentLinks = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/student/dashboard",
    },
    {
      label: "My Roadmap",
      icon: Map,
      href: "/student/roadmap",
    },
    {
      label: "My Courses",
      icon: BookOpen,
      href: "/student/courses",
    },
    {
      label: "Test Assignment",
      icon: BookOpen,
      href: "/student/assignment/6a1d24795a1852d5fa893451",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const instructorLinks = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/instructor/dashboard",
    },
    {
      label: "Create Course",
      icon: PlusCircle,
      href: "/instructor/create-course",
    },
    {
      label: "Review Queue",
      icon: BookOpen,
      href: "/instructor/review-queue",
    },
    {
      label: "Test Assignment",
      icon: BookOpen,
      href: "/student/assignment/6a1d24795a1852d5fa893451",
    },
  ];

  const employerLinks = [
    {
      label: "Partner Dashboard",
      icon: LayoutDashboard,
      href: "/employer/dashboard",
    },
  ];

  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase() || "student";
  const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
  const role = isInstructor ? "instructor" : baseRole;

  let navLinks = studentLinks;
  if (role === "instructor") {
    navLinks = instructorLinks;
  } else if (role === "employer") {
    navLinks = employerLinks;
  }

  return (
    <div
      className="
        flex min-h-screen
        bg-background
      "
    >
      {/* Sidebar */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-72
          border-r bg-background
          transition-transform duration-300
          lg:translate-x-0

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}

        <div
          className="
            flex h-20
            items-center
            border-b px-6
          "
        >
          <Link
            to="/"
            className="
              flex items-center
              gap-3
            "
          >
            <Logo className="h-6 text-foreground" showText={true} />
          </Link>
        </div>

        {/* Links */}

        <nav className="p-4">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;

              const active = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`
                      flex items-center
                      gap-3 rounded-none
                      px-4 py-3
                      text-sm font-bold uppercase tracking-widest transition-all

                      ${
                        active
                          ? `
                            bg-primary
                            text-primary-foreground
                          `
                          : `
                            hover:bg-muted
                          `
                      }
                    `}
                >
                  <Icon size={20} />

                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main */}

      <div className="flex-1 lg:pl-72">
        {/* Header */}

        <header
          className="
            sticky top-0 z-40
            flex h-20
            items-center
            justify-between
            border-b
            bg-background/80
            px-6 backdrop-blur-xl
          "
        >
          {/* Mobile */}

          <button
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-none border border-border/50 bg-black/40
              transition-colors hover:bg-black/60 hover:border-primary/50 text-foreground
              lg:hidden
            "
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={22} />
          </button>

          {/* Right */}

          <div
            className="
              ml-auto
              flex items-center
              gap-4
            "
          >
            {/* User Profile Section (Clickable) */}
            <Link
              to="/settings"
              className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer group rounded-full"
            >
              <div
                className="
                  hidden text-right
                  sm:block
                "
              >
                <p className="font-medium group-hover:text-primary transition-colors">{user?.name}</p>

                <p
                  className="
                    text-sm capitalize
                    text-muted-foreground
                  "
                >
                  {user?.primaryType || user?.role}
                </p>
              </div>

              {/* Avatar */}
              <div
                className="
                  flex h-11 w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  font-bold
                  text-primary-foreground
                  shadow-md box-glow transition-all
                "
              >
                {user?.name?.charAt(0) || "U"}
              </div>
            </Link>

            {/* Logout */}

            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut size={18} />
            </Button>
          </div>
        </header>

        {/* Content */}

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;

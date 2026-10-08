import { useState, useEffect } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { Menu, X, Sparkles } from "lucide-react";

import { logout } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApi";

import { Button } from "@/shared/ui/button";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Logo } from "@/components/common/Logo";

function Navbar() {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [logoutApi] = useLogoutMutation();

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Mobile Menu On Route Change

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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

  // Dashboard Link

  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
  const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
  
  let dashboardLink = "/";
  if (baseRole === "admin") dashboardLink = "/admin/dashboard";
  else if (baseRole === "employer") dashboardLink = "/employer/dashboard";
  else if (isInstructor) dashboardLink = "/instructor/dashboard";
  else if (baseRole === "student" || baseRole === "user") dashboardLink = "/student/dashboard";

  return (
    <header
      className={`
        sticky top-0 z-50
        transition-all duration-300
        ${
          scrolled
            ? `
              border-b
              bg-background/80
              backdrop-blur-2xl
            `
            : "bg-transparent"
        }
      `}
    >
      <div
        className="
          w-full
          flex h-20
          items-center
          justify-between
          px-6 md:px-12
        "
      >
        {/* Logo */}

        <Link
          to="/"
          className="
            flex items-center
            gap-3
            hover:opacity-80 transition-opacity
          "
        >
          <Logo className="h-7 text-foreground" showText={true} />
        </Link>

        {/* Desktop Nav - Perfectly Centered */}
        <nav
          className="
            hidden md:flex items-center
            gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          "
        >
          <Link
            to="/"
            className={`
              px-2 py-2 text-sm font-bold uppercase tracking-widest transition-all
              hover:text-primary relative group
              ${location.pathname === "/" ? "text-primary" : "text-muted-foreground"}
            `}
          >
            Home
            {location.pathname === "/" && (
              <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2" />
            )}
          </Link>

          {!isInstructor && (
            <Link
              to="/courses"
              className={`
                px-2 py-2 text-sm font-bold uppercase tracking-widest transition-all
                hover:text-primary relative group
                ${location.pathname.startsWith("/courses") ? "text-primary" : "text-muted-foreground"}
              `}
            >
              Courses
              {location.pathname.startsWith("/courses") && (
                <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2" />
              )}
            </Link>
          )}

          {user && (
            <Link
              to={dashboardLink}
              className={`
                px-2 py-2 text-sm font-bold uppercase tracking-widest transition-all
                hover:text-primary relative group
                ${location.pathname.includes("dashboard") ? "text-primary" : "text-muted-foreground"}
              `}
            >
              Dashboard
              {location.pathname.includes("dashboard") && (
                <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2" />
              )}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div
          className="
            hidden items-center
            gap-3 md:flex
          "
        >
          <ThemeToggle />
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}

        <button
          className="
            flex h-11 w-11
            items-center
            justify-center
            border
            md:hidden
          "
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}

      {mobileOpen && (
        <div
          className="
            border-t
            bg-background/95
            backdrop-blur-2xl
            md:hidden
          "
        >
          <div
            className="
              container mx-auto
              flex flex-col
              gap-2 px-6 py-6
            "
          >
            <Link
              to="/"
              className="
                px-4 py-3
                text-sm font-bold uppercase tracking-widest
                transition-all
                hover:bg-primary/10 hover:text-primary
              "
            >
              Home
            </Link>

            {!isInstructor && (
              <Link
                to="/courses"
                className="
                  px-4 py-3
                  text-sm font-bold uppercase tracking-widest
                  transition-all
                  hover:bg-primary/10 hover:text-primary
                "
              >
                Courses
              </Link>
            )}

            {user && (
              <Link
                to={dashboardLink}
                className="
                  px-4 py-3
                  text-sm font-bold uppercase tracking-widest
                  transition-all
                  hover:bg-primary/10 hover:text-primary
                "
              >
                Dashboard
              </Link>
            )}

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              {!user ? (
                <div className="space-y-3">
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/login">Login</Link>
                  </Button>

                  <Button className="w-full" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

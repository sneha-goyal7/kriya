import { useState } from "react";

import { NavLink } from "react-router-dom";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

import { navigationConfig } from "@/config/navigation";
import { Logo } from "@/components/common/Logo";

function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase() || "student";
  const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
  const role = isInstructor ? "instructor" : baseRole;

  const navItems = navigationConfig[role] || [];

  return (
    <aside
      className={cn(
        `
          hidden md:flex
          flex-col
          h-[calc(100vh-2rem)] my-4 ml-4 rounded-none
          bg-black/60 backdrop-blur-xl border border-border/50 shadow-none
          transition-all duration-300 z-50
        `,
        collapsed ? "w-[90px]" : "w-[280px]",
      )}
    >
      {/* Header */}

      <div
        className="
          flex h-20 items-center
          justify-between px-6 pt-2
        "
      >
        {!collapsed && (
          <Logo className="h-6 text-primary" showText={true} />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            rounded-full border border-border bg-transparent p-2 text-muted-foreground
            transition-default
            hover:bg-muted hover:text-foreground
          "
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  `
                    flex items-center gap-3
                    rounded-full px-5 py-3
                    text-sm font-medium
                    transition-all duration-200
                  `,
                  isActive
                    ? `
                      bg-primary/10
                      text-primary
                      border border-primary/30
                      rounded-none
                    `
                    : `
                      text-muted-foreground
                      hover:bg-black
                      hover:text-primary
                      border border-transparent
                      rounded-none
                    `,
                )
              }
            >
              <Icon size={20} />

              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default DashboardSidebar;

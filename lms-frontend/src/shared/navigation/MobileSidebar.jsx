import * as Dialog from "@radix-ui/react-dialog";

import { Menu, X } from "lucide-react";

import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { navigationConfig } from "@/config/navigation";
import { Logo } from "@/components/common/Logo";

function MobileSidebar() {
  const { user } = useSelector((state) => state.auth);
  const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase() || "student";
  const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
  const role = isInstructor ? "instructor" : baseRole;

  const navItems = navigationConfig[role] || [];

  return (
    <Dialog.Root>
      {/* Trigger */}

      <Dialog.Trigger asChild>
        <button
          className="
            inline-flex items-center justify-center
            rounded-xl border bg-card p-2
            transition-default hover:bg-muted
            md:hidden
          "
        >
          <Menu size={20} />
        </button>
      </Dialog.Trigger>

      {/* Portal */}

      <Dialog.Portal>
        {/* Overlay */}

        <Dialog.Overlay
          className="
            fixed inset-0 z-50
            bg-black/50 backdrop-blur-sm
          "
        />

        {/* Content */}

        <Dialog.Content
          className="
            fixed left-0 top-0 z-50
            h-full w-[280px]
            border-r bg-card
            p-6 shadow-2xl
          "
        >
          {/* Header */}

          <div
            className="
              mb-8 flex items-center
              justify-between
            "
          >
            <Logo className="h-6 text-foreground" showText={true} />

            <Dialog.Close asChild>
              <button
                className="
                  rounded-lg border p-2
                  hover:bg-muted
                  transition-default
                "
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Navigation */}

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Dialog.Close asChild key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `
                        flex items-center gap-3
                        rounded-xl px-4 py-3
                        text-sm font-medium
                        transition-all duration-200

                        ${
                          isActive
                            ? `
                              bg-primary
                              text-primary-foreground
                            `
                            : `
                              text-muted-foreground
                              hover:bg-muted
                              hover:text-foreground
                            `
                        }
                      `
                    }
                  >
                    <Icon size={20} />

                    <span>{item.title}</span>
                  </NavLink>
                </Dialog.Close>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default MobileSidebar;

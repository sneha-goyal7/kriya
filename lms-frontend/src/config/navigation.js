import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const navigationConfig = {
  student: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/student/dashboard",
    },

    {
      title: "My Courses",
      icon: BookOpen,
      href: "/student/courses",
    },

    {
      title: "Learning",
      icon: GraduationCap,
      href: "/student/learning",
    },

    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    }
  ],

  instructor: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/instructor/dashboard",
    },

    {
      title: "Courses",
      icon: BookOpen,
      href: "/instructor/courses",
    },

    {
      title: "Students",
      icon: GraduationCap,
      href: "/instructor/students",
    },

    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    }
  ],

  employer: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/employer/dashboard",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ],

  admin: [
    {
      title: "Overview",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      title: "Content Review",
      icon: BookOpen,
      href: "/admin/review",
    },
    {
      title: "Instructors",
      icon: GraduationCap, 
      href: "/admin/instructors",
    },
    {
      title: "Students",
      icon: BookOpen,
      href: "/admin/students",
    },
    {
      title: "Hiring Partners",
      icon: BookOpen,
      href: "/admin/partners",
    },
  ],
};

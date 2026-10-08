import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function PublicLayout({ children }) {
  const location = useLocation();
  const shouldHideFooter = location.pathname.startsWith("/login") || location.pathname.startsWith("/register") || location.pathname.startsWith("/forgot-password") || location.pathname.startsWith("/reset-password");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">{children}</main>
      
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default PublicLayout;

import Navbar from "@/components/layout/Navbar";

function PublicLayout({ children }) {
  return (
    <div
      className="
        min-h-screen
        bg-background
      "
    >
      {/* Navbar */}

      <Navbar />

      {/* Main */}

      <main>{children}</main>
    </div>
  );
}

export default PublicLayout;

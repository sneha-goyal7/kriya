import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

function Footer() {
  return (
    <footer className="w-full bg-background text-foreground pt-24 pb-12 overflow-hidden relative transition-colors duration-300">
      
      {/* Massive Brand Text with Subtle Gradient */}
      <div className="w-full overflow-hidden flex justify-center mb-16 px-4">
        <h1 
          className="text-[15vw] md:text-[18vw] leading-none font-bold tracking-tight uppercase select-none cursor-default bg-gradient-to-b from-foreground/10 via-primary/20 to-foreground/5 bg-clip-text text-transparent"
          style={{
            fontFamily: "'General Sans', sans-serif"
          }}
        >
          Kriya
        </h1>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Logo & Socials */}
          <div className="flex flex-col gap-8">
            <Link to="/" className="flex items-center gap-2 group w-fit hover:opacity-80 transition-opacity">
              <Logo className="h-10 text-foreground" showText={false} />
            </Link>
            <div className="flex items-center gap-5">
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </span>
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </span>
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6h0a8 8 0 0 0-12 0h0c-1 3-1 9 0 12h0a8 8 0 0 0 12 0h0c1-3 1-9 0-12Z"/><path d="M9 12v0"/><path d="M15 12v0"/></svg>
              </span>
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </span>
              <span className="text-muted-foreground hover:text-primary transition-colors cursor-default">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </span>
            </div>
          </div>

          {/* PLATFORM */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-foreground tracking-widest uppercase mb-2">Platform</h4>
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Explore Courses</Link>
            <Link to="/career" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Career Paths</Link>
            <Link to="/mentorship" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Mentorship</Link>
            <Link to="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Submit Feedback</Link>
          </div>

          {/* LEGAL & SUPPORT */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-foreground tracking-widest uppercase mb-2">Legal & Help</h4>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Support Center</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors w-fit">Terms and Condition</Link>
          </div>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;

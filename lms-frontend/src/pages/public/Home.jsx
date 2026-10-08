import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Star, Sparkles, BookOpen, Layers, Zap, Shield, Cpu, Code } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { useGetCoursesQuery } from "@/features/course/courseApi";
import { Skeleton } from "@/shared/ui/skeleton";
import { motion } from "framer-motion";
import MandalaScene from "../../components/canvas/MandalaScene";

const features = [
  {
    icon: Cpu,
    title: "AI-Powered Learning",
    description: "Adaptive curriculum that dynamically adjusts to your pace, optimizing how you master any skill.",
  },
  {
    icon: Zap,
    title: "Personalized Paths",
    description: "Stop following one-size-fits-all tutorials. Get a unique roadmap tailored precisely to your goals.",
  },
  {
    icon: Layers,
    title: "Action-Oriented",
    description: "Learn by doing. Build real-world projects and portfolios that showcase your true capability.",
  },
  {
    icon: Star,
    title: "Direct Opportunities",
    description: "We don't just hand you a certificate. We actively connect verified, deserving talent with the right industry roles.",
  }
];

function Home() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetCoursesQuery();
  const realCourses = data?.data?.courses?.filter(c => c.status === 'published')?.slice(0, 3) || [];

  const getDashboardLink = () => {
    if (!user) return "/register";
    const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
    const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
    
    if (baseRole === "admin") return "/admin/dashboard";
    if (baseRole === "employer") return "/employer/dashboard";
    if (isInstructor) return "/instructor/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="relative overflow-x-hidden bg-background text-foreground font-sans w-full">
      
      {/* --- WEBGL BACKGROUND --- */}
      <MandalaScene />

      {/* --- HERO SECTION --- */}
      <section className="w-full relative z-10 px-6 lg:px-12 min-h-[85vh] flex flex-col items-center justify-center border-b border-border/40 pt-20 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mx-auto max-w-5xl text-center flex flex-col items-center justify-center w-full"
        >
          {/* Refined Premium Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6"
          >
            <h3 className="font-mono text-sm md:text-base font-bold uppercase tracking-[0.3em] text-primary">
              Where Ambition Takes Action
            </h3>
          </motion.div>

          {/* Heading */}
          <h1 className="mt-8 text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-medium tracking-tight text-foreground">
            Master Any Skill <br className="hidden md:block" />
            <span className="text-primary font-normal">Claim Your Opportunity!</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground font-light">
            Master any skill through an AI-guided learning experience built just for you. We don't just educate—we bridge the gap by connecting deserving talent directly with the right opportunities.
          </p>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="h-14 px-10 text-lg font-medium rounded-full box-glow transition-transform hover:scale-105" asChild>
              <Link to={getDashboardLink()}>
                {user ? "Go to Dashboard" : "Start Journey"}
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="w-full relative z-10 px-6 lg:px-12 py-32 border-b border-border/40 bg-muted/20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Engineered for <br/>rapid mastery</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" style={{ perspective: "1000px" }}>
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title} 
                  initial={{ opacity: 0, y: 30, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                  className="group relative flex flex-col items-start p-8 rounded-3xl bg-card border border-border/40 hover:border-primary/50 transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_hsl(var(--primary)/0.25)] overflow-hidden cursor-default"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Glowing ambient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* 3D Icon Container */}
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-8 border border-primary/20 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-6 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                    <Icon size={28} strokeWidth={1.5} className="transition-transform duration-500" />
                    {/* Inner glow behind icon */}
                    <div className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="relative z-10 text-xl font-semibold tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="relative z-10 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  
                  {/* Bottom reflective 3D edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* --- FEATURED COURSES --- */}
      <section className="w-full relative z-10 px-6 lg:px-12 py-32 border-b border-border/40 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-16"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Featured Programs
              </h2>
            </div>
            <Button variant="ghost" className="text-primary hover:bg-primary/10" asChild>
              <Link to="/courses" className="flex items-center">
                Explore All <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-2xl bg-muted/50" />)
            ) : realCourses.length > 0 ? (
              realCourses.map((course) => (
                <motion.div 
                  key={course._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                >
                  <Card className="group overflow-hidden rounded-2xl border border-border/60 bg-card hover:shadow-xl transition-all duration-500 hover:border-primary/50 relative h-full flex flex-col">
                    <div className="flex h-52 items-center justify-center overflow-hidden bg-muted/30 relative shrink-0">
                      {course.thumbnail ? (
                         <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <BookOpen size={40} className="text-muted-foreground/30 transition-transform duration-500 group-hover:scale-110" />
                      )}
                    </div>

                    <CardContent className="flex-1 flex flex-col p-6 space-y-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground tracking-tight line-clamp-2">{course.title}</h3>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{course.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-6 border-t border-border/50 shrink-0">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                            {course.instructor?.name?.charAt(0) || "I"}
                          </div>
                          <span className="text-muted-foreground">{course.instructor?.name || "Instructor"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Star size={14} className="fill-primary text-primary" />
                          <span>Premium</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-10 text-lg">No active programs found.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="w-full relative z-10 px-6 lg:px-12 py-32 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">Ready to build?</h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
            Join thousands of developers mastering modern stacks on our enterprise platform.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg font-medium rounded-full box-glow transition-transform hover:scale-105" asChild>
            <Link to={getDashboardLink()}>{user ? "Go to Dashboard" : "Create an Account"}</Link>
          </Button>
        </div>
      </section>
      
    </div>
  );
}

export default Home;


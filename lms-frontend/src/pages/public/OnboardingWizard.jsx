import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation, useGenerateRoadmapMutation } from "@/features/career/careerApi";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Sparkles, ArrowRight, Brain, Hammer, BookOpen, Eye, Clock } from "lucide-react";
import { toast } from "sonner";

// Common roles for auto-suggest
const roles = ["Frontend Engineer", "Backend Engineer", "Full Stack Developer", "Data Scientist", "AI Engineer", "Product Manager", "DevOps Engineer"];

// Skills for step 3
const commonSkills = ["JavaScript", "Python", "React", "Node.js", "SQL", "MongoDB", "TypeScript", "AWS", "Docker", "Machine Learning", "CSS", "HTML", "Git"];

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dreamRole: "",
    currentLevel: "beginner",
    currentSkills: [],
    preferredLearningStyle: "mixed",
    targetTimelineMonths: 6,
  });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [generateRoadmap, { isLoading: isGenerating }] = useGenerateRoadmapMutation();

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    try {
      // 1. Update Profile
      await updateProfile(formData).unwrap();
      
      // 2. Trigger AI Roadmap Generation
      toast.info("Generating your personalized Cosmos roadmap...", { icon: <Sparkles className="w-4 h-4 text-primary" /> });
      setStep(6); // Launch sequence step

      await generateRoadmap().unwrap();
      
      toast.success("Roadmap generated! Welcome to your new career.");
      const baseRole = user?.primaryType?.toLowerCase() || user?.role?.toLowerCase();
      const isInstructor = baseRole === "instructor" || (baseRole === "user" && user?.capabilities?.canTeach);
      let dashboardLink = "/student/dashboard";
      if (baseRole === "admin") dashboardLink = "/admin/dashboard";
      else if (baseRole === "employer") dashboardLink = "/employer/dashboard";
      else if (isInstructor) dashboardLink = "/instructor/dashboard";

      navigate(dashboardLink);
    } catch (error) {
      toast.error(error.data?.error?.message || "Failed to complete onboarding");
      setStep(5); // Go back if failed
    }
  };

  const variants = {
    enter: (direction) => ({
      y: 20,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 30 },
    },
    exit: (direction) => ({
      zIndex: 0,
      y: -20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    }),
  };

  // ─── STEP 1: DREAM ROLE ──────────────────────────────────────────────
  const Step1 = () => (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
        What's the dream?
      </h2>
      <div className="w-full relative group">
        <Input
          autoFocus
          className="h-16 text-2xl text-center bg-card/60 border-border focus:border-primary focus:ring-primary/50 rounded-xl transition-all duration-300 font-semibold tracking-tight"
          placeholder="e.g. Frontend Engineer"
          value={formData.dreamRole}
          onChange={(e) => setFormData({ ...formData, dreamRole: e.target.value })}
        />
        <div className="absolute inset-0 -z-10 rounded-none bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>
      
      {/* Suggestions */}
      {formData.dreamRole.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {roles.filter(r => r.toLowerCase().includes(formData.dreamRole.toLowerCase())).slice(0, 3).map(role => (
            <button
              key={role}
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-none bg-black/40 hover:bg-primary/10 border border-primary/30 text-primary transition-colors"
              onClick={() => setFormData({ ...formData, dreamRole: role })}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      <Button 
        onClick={handleNext} 
        disabled={formData.dreamRole.length < 2}
        className="mt-8 h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black"
      >
        Continue <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );

  // ─── STEP 2: CURRENT LEVEL ───────────────────────────────────────────
  const Step2 = () => {
    const levels = ["beginner", "intermediate", "advanced"];
    return (
      <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Where are you right now?</h2>
        
        <div className="flex justify-between w-full gap-4">
          {levels.map((level) => {
            const isSelected = formData.currentLevel === level;
            return (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, currentLevel: level })}
                className={`flex-1 p-6 rounded-none border ${isSelected ? 'border-primary bg-primary/10 box-glow' : 'border-border/50 bg-black/40 hover:border-primary/50'} transition-all`}
              >
                <div className={`text-xl font-semibold tracking-tight capitalize ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                  {level}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" onClick={handlePrev} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
          <Button onClick={handleNext} className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black">
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // ─── STEP 3: SKILLS ──────────────────────────────────────────────────
  const Step3 = () => (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-3xl mx-auto text-center">
      <h2 className="text-4xl font-bold tracking-tight text-foreground">What do you already know?</h2>
      <p className="text-muted-foreground font-light">Select skills to form your current constellation.</p>
      
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {commonSkills.map((skill) => {
          const isSelected = formData.currentSkills.includes(skill);
          return (
            <motion.button
              key={skill}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newSkills = isSelected 
                  ? formData.currentSkills.filter(s => s !== skill)
                  : [...formData.currentSkills, skill];
                setFormData({ ...formData, currentSkills: newSkills });
              }}
              className={`px-6 py-3 rounded-none border text-xs font-bold uppercase tracking-widest ${isSelected ? 'border-primary bg-primary/10 text-primary box-glow' : 'border-border/50 bg-black/40 text-muted-foreground hover:border-primary/50 hover:text-primary'} transition-all duration-300`}
            >
              {skill}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-12">
        <Button variant="ghost" onClick={handlePrev} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
        <Button onClick={handleNext} className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black">
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // ─── STEP 4: LEARNING STYLE ──────────────────────────────────────────
  const Step4 = () => {
    const styles = [
      { id: "hands-on", icon: Hammer, label: "Hands-on", desc: "I learn by building projects" },
      { id: "visual", icon: Eye, label: "Visual", desc: "I prefer videos and diagrams" },
      { id: "reading", icon: BookOpen, label: "Reading", desc: "I absorb written documentation" },
      { id: "mixed", icon: Brain, label: "Mixed", desc: "A bit of everything" }
    ];

    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">How do you learn best?</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {styles.map((style) => {
            const Icon = style.icon;
            const isSelected = formData.preferredLearningStyle === style.id;
            return (
              <motion.div
                key={style.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData({ ...formData, preferredLearningStyle: style.id })}
                className={`cursor-pointer p-6 rounded-none border flex flex-col items-center gap-4 ${isSelected ? 'border-primary bg-primary/10 box-glow' : 'border-border/50 bg-black/40 hover:border-primary/50'} transition-all`}
              >
                <div className={`p-4 rounded-none border ${isSelected ? 'border-primary/30 bg-primary/20 text-primary' : 'border-border/50 bg-black/40 text-muted-foreground'}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className={`font-semibold tracking-tight text-lg ${isSelected ? 'text-primary' : 'text-foreground'}`}>{style.label}</h3>
                <p className="text-sm text-muted-foreground">{style.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="ghost" onClick={handlePrev} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
          <Button onClick={handleNext} className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black">
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // ─── STEP 5: TIMELINE ────────────────────────────────────────────────
  const Step5 = () => {
    const timelines = [3, 6, 9, 12];
    
    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">When do you want to be job-ready?</h2>
        
        <div className="flex gap-4 w-full justify-center">
          {timelines.map((months) => {
            const isSelected = formData.targetTimelineMonths === months;
            return (
              <motion.button
                key={months}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, targetTimelineMonths: months })}
                className={`p-6 rounded-none border flex flex-col items-center justify-center w-32 h-32 ${isSelected ? 'border-primary bg-primary/10 box-glow' : 'border-border/50 bg-black/40 hover:border-primary/50'} transition-all`}
              >
                <Clock className={`w-8 h-8 mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-bold text-2xl ${isSelected ? 'text-primary' : 'text-foreground'}`}>{months}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">months</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-12">
          <Button variant="ghost" onClick={handlePrev} disabled={isUpdating || isGenerating} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
          <Button 
            onClick={handleComplete} 
            disabled={isUpdating || isGenerating}
            className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black"
          >
            {isUpdating || isGenerating ? "Launching..." : "Generate My Roadmap"} <Sparkles className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // ─── LAUNCH SEQUENCE (STEP 6) ────────────────────────────────────────
  const LaunchSequence = () => (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto text-center h-full">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="relative w-32 h-32 flex items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full border-t-2 border-primary border-opacity-50 blur-[2px]" />
        <div className="absolute inset-2 rounded-full border-r-2 border-cyan-400 border-opacity-50 blur-[1px] animate-spin-reverse" />
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </motion.div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">Building your learning path...</h2>
      <p className="text-muted-foreground font-light animate-pulse">Our AI is mapping the optimal path to {formData.dreamRole}</p>
    </div>
  );

  const steps = [
    <Step1 key="1" />,
    <Step2 key="2" />,
    <Step3 key="3" />,
    <Step4 key="4" />,
    <Step5 key="5" />,
    <LaunchSequence key="6" />
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px] mix-blend-screen" />
      </div>

      {/* Progress Bar */}
      {step < 6 && (
        <div className="w-full h-1 bg-white/5 fixed top-0 z-50">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex items-center justify-center"
          >
            {steps[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingWizard;

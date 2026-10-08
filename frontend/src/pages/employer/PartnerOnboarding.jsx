import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCreateEmployerProfileMutation } from "@/features/career/careerApi";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ArrowRight, Building, Globe, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

const PartnerOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    size: "1-10",
    website: "",
  });

  const [createProfile, { isLoading }] = useCreateEmployerProfileMutation();
  const { data: existingProfile, isLoading: isChecking } = useGetEmployerProfileQuery(undefined, {
    retry: false
  });

  React.useEffect(() => {
    if (existingProfile?.data) {
      navigate("/employer/dashboard", { replace: true });
    }
  }, [existingProfile, navigate]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    try {
      let finalWebsite = formData.website;
      if (finalWebsite && !/^https?:\/\//i.test(finalWebsite)) {
        finalWebsite = `https://${finalWebsite}`;
      }

      await createProfile({ ...formData, website: finalWebsite }).unwrap();
      toast.success("Company profile created! Awaiting verification.");
      navigate("/employer/dashboard");
    } catch (error) {
      const apiError = error.data?.error;
      let errorMsg = apiError?.message || "Failed to create profile";
      if (apiError?.details && apiError.details.length > 0) {
        errorMsg = `${apiError.details[0].field}: ${apiError.details[0].message}`;
      }
      toast.error(errorMsg);
    }
  };

  const variants = {
    enter: { y: 20, opacity: 0, scale: 0.95 },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      zIndex: 0,
      y: -20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  const Step1 = () => (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto text-center">
      <Building className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-4xl font-bold tracking-tight text-foreground">
        What is your company's name?
      </h2>
      <div className="w-full relative group">
        <Input
          autoFocus
          className="h-16 text-2xl text-center bg-card/60 border-border focus:border-primary focus:ring-primary/50 rounded-xl transition-all duration-300 font-semibold tracking-tight"
          placeholder="e.g. Acme Corp"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />
        <div className="absolute inset-0 -z-10 rounded-none bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>

      <Button
        onClick={handleNext}
        disabled={formData.companyName.length < 2}
        className="mt-8 h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black"
      >
        Continue <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );

  const Step2 = () => {
    const industries = ["Technology", "Healthcare", "Finance", "Education", "E-commerce", "Other"];
    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-3xl mx-auto text-center">
        <Briefcase className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Primary Industry</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {industries.map((ind) => {
            const isSelected = formData.industry === ind;
            return (
              <motion.button
                key={ind}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ ...formData, industry: ind });
                  setTimeout(handleNext, 300);
                }}
                className={`px-8 py-4 rounded-none border text-sm font-bold uppercase tracking-widest ${isSelected ? 'border-primary bg-primary/10 text-primary box-glow' : 'border-border/50 bg-black/40 text-muted-foreground hover:border-primary/50 hover:text-primary'} transition-all duration-300`}
              >
                {ind}
              </motion.button>
            );
          })}
        </div>
        
        <div className="flex gap-4 mt-12">
          <Button variant="ghost" onClick={handlePrev} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
        </div>
      </div>
    );
  };

  const Step3 = () => {
    const sizes = ["1-10", "11-50", "51-200", "201-500", "500+", "Enterprise"];
    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-3xl mx-auto text-center">
        <Users className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Company Size</h2>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {sizes.map((sz) => {
            const isSelected = formData.size === sz;
            return (
              <motion.button
                key={sz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFormData({ ...formData, size: sz });
                  setTimeout(handleNext, 300);
                }}
                className={`px-8 py-4 rounded-none border text-sm font-bold uppercase tracking-widest ${isSelected ? 'border-primary bg-primary/10 text-primary box-glow' : 'border-border/50 bg-black/40 text-muted-foreground hover:border-primary/50 hover:text-primary'} transition-all duration-300`}
              >
                {sz}
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-4 mt-12">
          <Button variant="ghost" onClick={handlePrev} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
        </div>
      </div>
    );
  };

  const Step4 = () => (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto text-center">
      <Globe className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-4xl font-bold tracking-tight text-foreground">Company Website</h2>
      <p className="text-muted-foreground font-light mb-4">We use your website to verify your identity.</p>
      
      <div className="w-full relative group">
        <Input
          autoFocus
          type="url"
          className="h-16 text-2xl text-center bg-card/60 border-border focus:border-primary focus:ring-primary/50 rounded-xl transition-all duration-300 font-semibold tracking-tight"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
        <div className="absolute inset-0 -z-10 rounded-none bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="flex gap-4 mt-12">
        <Button variant="ghost" onClick={handlePrev} disabled={isLoading} className="rounded-none uppercase tracking-widest text-xs font-bold hover:bg-primary/10 hover:text-primary">Back</Button>
        <Button
          onClick={handleComplete}
          disabled={formData.website.length < 5 || isLoading}
          className="h-12 px-8 rounded-none uppercase tracking-widest text-xs font-bold box-glow bg-primary hover:bg-primary/80 text-black"
        >
          {isLoading ? "Submitting..." : "Complete Setup"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const steps = [
    <Step1 key="1" />,
    <Step2 key="2" />,
    <Step3 key="3" />,
    <Step4 key="4" />
  ];

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen" />
      </div>

      <div className="w-full h-1 bg-white/5 fixed top-0 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-indigo-400"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
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

export default PartnerOnboarding;

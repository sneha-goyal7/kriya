import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Code, CheckCircle, ArrowRight, ShieldCheck, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import ResourcePack from "./ResourcePack";
import { useTestOutRoadmapNodeMutation } from "@/features/career/careerApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LeafPanel = ({ node, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [testOutNode, { isLoading: isTestingOut }] = useTestOutRoadmapNodeMutation();
  
  // Modal states
  const [isTestOutModalOpen, setIsTestOutModalOpen] = useState(false);
  const [testOutUrl, setTestOutUrl] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!node) return null;

  const handleTestOutSubmit = async (e) => {
    e.preventDefault();
    if (!testOutUrl || (!testOutUrl.startsWith("http") && !testOutUrl.startsWith("github.com"))) {
      toast.error("Please enter a valid URL (http://... or https://...)");
      return;
    }

    try {
      const res = await testOutNode({ nodeId: node._id, url: testOutUrl }).unwrap();
      setVerificationSuccess(true);
      toast.success(res.message, {
        icon: <Sparkles className="w-4 h-4 text-primary" />
      });
      
      // Close modal after success animation
      setTimeout(() => {
        setIsTestOutModalOpen(false);
        setTestOutUrl("");
        setVerificationSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      toast.error(error?.data?.error?.message || "Failed to verify skill.");
    }
  };

  const handleStartAssignment = () => {
    navigate(`/student/assignment/${node._id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isTestOutModalOpen && onClose()}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden"
          >

            {/* Header */}
            <div className="flex-none flex items-center justify-between p-6 border-b border-border bg-card relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 box-glow shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  <Code size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                    {node.skillDomain} • {node.type}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{node.title}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 pb-32 space-y-10 custom-scrollbar">
              
              {/* Section 1: The Why */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-secondary" />
                  Why this matters
                </h3>
                <p className="text-lg font-light leading-relaxed text-foreground">
                  {node.description}
                </p>
              </section>

              {/* Section 2: Resources */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Curated Resources
                </h3>
                <ResourcePack node={node} />
              </section>

              {/* Section 3: The Assignment */}
              <section className="p-6 rounded-2xl border border-border bg-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 relative z-10">
                  The Assignment
                </h3>
                <div className="space-y-4 relative z-10">
                  <p className="text-sm text-muted-foreground">
                    Prove your mastery by completing a hands-on technical challenge designed to simulate real-world requirements.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Est. Time: {node.estimatedHours}h</span>
                    <span>•</span>
                    <span>Submission: GitHub Repo</span>
                  </div>
                  
                  <Button 
                    onClick={node.status === "completed" ? undefined : handleStartAssignment}
                    disabled={node.status === "completed"}
                    className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-xs font-bold box-glow rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {node.status === "completed" ? "Assignment Completed" : "Start Assignment"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </section>

              {/* Section 4: Skill Output & Test Out */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-bold text-foreground">Skill Badge Output</div>
                      <div className="text-xs text-muted-foreground">Verified {node.skillTag || "Skill"} Level 1</div>
                    </div>
                  </div>
                </div>

                {node.status === "completed" ? (
                  <div className="flex items-center justify-center w-full h-12 bg-primary/10 text-primary uppercase tracking-widest text-xs font-bold border border-primary/30 rounded-xl">
                    <CheckCircle className="w-4 h-4 mr-2" /> Skill Mastered
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTestOutModalOpen(true)}
                    className="w-full h-12 border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary uppercase tracking-widest text-xs font-bold rounded-xl transition-all"
                  >
                    I already know this (Test Out)
                  </Button>
                )}
              </section>
            </div>
          </motion.div>

          {/* Test-Out Modal (Nested inside AnimatePresence so it can animate in/out independently) */}
          <AnimatePresence>
            {isTestOutModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Secondary backdrop specifically for the modal focus */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !isTestingOut && !verificationSuccess && setIsTestOutModalOpen(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-foreground tracking-tight">Verify Existing Knowledge</h3>
                    </div>
                    {!isTestingOut && !verificationSuccess && (
                      <button onClick={() => setIsTestOutModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    {verificationSuccess ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-10 flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
                          <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Verification Passed!</h3>
                        <p className="text-muted-foreground text-sm">
                          AI Architect has successfully verified your codebase and unlocked this module.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleTestOutSubmit} className="space-y-6">
                        <div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            You can bypass this module by providing proof of mastery. Submit a link to a GitHub repository or a live project that demonstrates your proficiency in <strong>{node.title}</strong>.
                          </p>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-foreground">
                              Project URL
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <input
                                type="url"
                                required
                                value={testOutUrl}
                                onChange={(e) => setTestOutUrl(e.target.value)}
                                disabled={isTestingOut}
                                placeholder="https://github.com/username/project"
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={isTestingOut || !testOutUrl}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest text-xs rounded-xl transition-all relative overflow-hidden"
                          >
                            {isTestingOut ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2"
                              >
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Scanning Repository...</span>
                              </motion.div>
                            ) : (
                              <span className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" /> Submit Proof
                              </span>
                            )}
                            
                            {/* Futuristic scanning laser effect when loading */}
                            {isTestingOut && (
                              <motion.div 
                                className="absolute inset-0 border-t-2 border-white/50 bg-gradient-to-b from-white/20 to-transparent"
                                animate={{ y: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              />
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default LeafPanel;

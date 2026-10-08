import React, { useState, useEffect, useRef } from "react";
import { useGetRoadmapQuery, useGenerateRoadmapMutation } from "@/features/career/careerApi";
import { Map, ChevronRight, ChevronLeft, ChevronDown, CheckCircle, Play, Lock, RefreshCw } from "lucide-react";
import LeafPanel from "@/components/roadmap/LeafPanel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import AICompanionChat from "@/components/student/AICompanionChat";

const CareerPathTree = () => {
  const { data, isLoading } = useGetRoadmapQuery();
  const [generateRoadmap, { isLoading: isGenerating }] = useGenerateRoadmapMutation();
  const [activeLeaf, setActiveLeaf] = useState(null);
  const [expandedDomains, setExpandedDomains] = useState({});
  const [paths, setPaths] = useState([]);
  
  const containerRef = useRef(null);
  const rootRef = useRef(null);
  const domainRefs = useRef({});
  const nodeRefs = useRef({});

  useEffect(() => {
    // We delay the line drawing slightly to ensure the DOM is painted
    const timeout = setTimeout(drawLines, 50);
    window.addEventListener("resize", drawLines);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", drawLines);
    };
  }, [expandedDomains, data]);

  const drawLines = () => {
    if (!containerRef.current || !rootRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();
    
    // Function to calculate center-right of a source element
    const getStartPoint = (rect) => ({
      x: rect.right - containerRect.left,
      y: rect.top - containerRect.top + (rect.height / 2)
    });

    // Function to calculate center-left of a target element
    const getEndPoint = (rect) => ({
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top + (rect.height / 2)
    });

    const createCurve = (start, end) => {
      const offsetX = Math.abs(end.x - start.x) / 2.5;
      return `M ${start.x} ${start.y} C ${start.x + offsetX} ${start.y}, ${end.x - offsetX} ${end.y}, ${end.x} ${end.y}`;
    };

    const newPaths = [];
    const rootStart = getStartPoint(rootRect);

    // Draw lines from Root to Domains
    Object.keys(domainRefs.current).forEach((domain) => {
      const el = domainRefs.current[domain];
      if (!el) return;
      const endPoint = getEndPoint(el.getBoundingClientRect());
      newPaths.push(createCurve(rootStart, endPoint));

      // Draw lines from Domain to Nodes if expanded
      if (expandedDomains[domain]) {
        const domainStart = getStartPoint(el.getBoundingClientRect());
        const nodes = groupedNodes[domain] || [];
        nodes.forEach((node) => {
          const nodeEl = nodeRefs.current[node._id];
          if (!nodeEl) return;
          const nodeEnd = getEndPoint(nodeEl.getBoundingClientRect());
          newPaths.push(createCurve(domainStart, nodeEnd));
        });
      }
    });

    setPaths(newPaths);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const roadmap = data?.data?.roadmap;

  if (!roadmap || !roadmap.nodes || roadmap.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Map className="w-16 h-16 text-primary mb-6 opacity-30 box-glow" />
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Path Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          You haven't generated your AI curriculum yet. Click below to instantly build your personalized roadmap.
        </p>
        <Button 
          className="rounded-full px-8 h-12 font-medium shadow-md"
          onClick={async () => {
            try {
              await generateRoadmap().unwrap();
              toast.success("Path generated successfully!");
            } catch (error) {
              toast.error(error?.data?.message || error?.data?.error?.message || "Failed to generate path");
            }
          }}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate AI Path"}
        </Button>
      </div>
    );
  }

  const groupedNodes = roadmap.nodes.reduce((acc, node) => {
    const domain = node.skillDomain || "Core";
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(node);
    return acc;
  }, {});

  const domains = Object.keys(groupedNodes);

  const toggleDomain = (domain) => {
    setExpandedDomains(prev => ({ ...prev, [domain]: !prev[domain] }));
  };

  return (
    <div className="min-h-screen bg-background/50 flex items-center justify-center p-8 overflow-x-auto relative">
      
      {/* Floating Actions */}
      <div className="fixed top-24 right-8 z-50">
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-full shadow-lg bg-card/80 backdrop-blur-md border-border text-muted-foreground hover:text-foreground"
          onClick={async () => {
            try {
              await generateRoadmap().unwrap();
              toast.success("Path regenerated successfully!");
            } catch (error) {
              toast.error(error?.data?.message || error?.data?.error?.message || "Failed to regenerate path");
            }
          }}
          disabled={isGenerating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? "Regenerating..." : "Regenerate Path"}
        </Button>
      </div>

      {/* SVG Canvas for Lines */}
      <div className="absolute inset-0 pointer-events-none" ref={containerRef}>
        <svg className="w-full h-full">
          {paths.map((d, i) => (
            <path 
              key={i} 
              d={d} 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              className="text-border"
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-row items-start gap-16 relative z-10 w-full max-w-[1200px] min-w-max">
        
        {/* LEVEL 1: ROOT */}
        <div className="flex flex-col justify-center h-full pt-32">
          <div 
            ref={rootRef}
            className="flex items-center bg-card hover:bg-secondary border border-border text-foreground rounded-xl pl-4 pr-1 py-2 text-sm font-bold shadow-lg transition-colors"
          >
            <span className="mr-3">Career Path</span>
            <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center border border-border">
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* LEVEL 2: DOMAINS */}
        <div className="flex flex-col gap-6 pt-16">
          {domains.map((domain) => (
            <div key={domain} className="flex flex-row items-center gap-16 relative">
              
              <div 
                ref={(el) => (domainRefs.current[domain] = el)}
                onClick={() => toggleDomain(domain)}
                className="flex items-center bg-card hover:bg-secondary border border-border text-foreground rounded-xl pl-4 pr-1 py-2 text-sm font-bold cursor-pointer shadow-lg transition-colors z-10"
              >
                <span className="mr-3">{domain}</span>
                <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center border border-border">
                  {expandedDomains[domain] ? (
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* LEVEL 3: NODES */}
              <AnimatePresence>
                {expandedDomains[domain] && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-3 z-10"
                  >
                    {groupedNodes[domain].map((node) => (
                      <div 
                        key={node._id}
                        ref={(el) => (nodeRefs.current[node._id] = el)}
                        onClick={() => setActiveLeaf(node)}
                        className={`flex items-center rounded-xl pl-3 pr-2 py-2 text-xs font-bold cursor-pointer shadow-md transition-transform hover:scale-105 border ${
                          node.status === 'completed' ? 'bg-primary/10 border-primary/30 text-primary' :
                          node.status === 'active' ? 'bg-primary border-primary text-primary-foreground box-glow' :
                          'bg-secondary border-border text-muted-foreground hover:bg-card'
                        }`}
                      >
                        <div className="mr-2">
                          {node.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                          {node.status === 'active' && <Play className="w-4 h-4" />}
                          {node.status === 'locked' && <Lock className="w-4 h-4 opacity-50" />}
                        </div>
                        <span className="mr-3">{node.title}</span>
                        <div className="w-5 h-5 bg-background/50 rounded-full flex items-center justify-center border border-border/50 ml-auto">
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))}
        </div>

      </div>

      <LeafPanel 
        node={activeLeaf} 
        isOpen={!!activeLeaf} 
        onClose={() => setActiveLeaf(null)} 
      />

      <AICompanionChat />
    </div>
  );
};

export default CareerPathTree;

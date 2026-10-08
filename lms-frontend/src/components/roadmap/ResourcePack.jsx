import React from "react";
import { useGetResourcesByTagQuery } from "@/features/career/careerApi";
import { Skeleton } from "@/shared/ui/skeleton";
import { ExternalLink, Video, FileText, MonitorPlay, Link2, Clock } from "lucide-react";

const getResourceIcon = (type) => {
  switch (type) {
    case "video": return <Video className="w-4 h-4" />;
    case "course": return <MonitorPlay className="w-4 h-4" />;
    case "article": return <FileText className="w-4 h-4" />;
    case "interactive": return <MonitorPlay className="w-4 h-4" />;
    case "documentation": return <FileText className="w-4 h-4" />;
    default: return <Link2 className="w-4 h-4" />;
  }
};

const ResourcePack = ({ node }) => {
  const { data, isLoading, error } = useGetResourcesByTagQuery({
    skillTag: node.skillTag,
    nodeTitle: node.title,
    nodeDescription: node.description,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl border border-white/5 bg-white/5" />
        ))}
      </div>
    );
  }

  if (error || !data?.data?.resources) {
    console.error("ResourcePack Error:", error);
    return (
      <div className="p-4 border border-destructive/30 bg-destructive/10 text-destructive rounded-xl text-sm break-all">
        Failed to load resources. Error: {error ? JSON.stringify(error) : "No data.data.resources returned."}
      </div>
    );
  }

  const resources = data.data.resources;

  return (
    <div className="space-y-3">
      {resources.map((resource, i) => (
        <a
          key={i}
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl border border-border bg-card hover:bg-secondary hover:border-primary/50 transition-all duration-300 group shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:scale-110 transition-transform h-fit">
                {getResourceIcon(resource.type)}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {resource.sourceName}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-widest border border-border/50">
                    {resource.type}
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {resource.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                  <Clock className="w-3 h-3 text-primary/70" />
                  {resource.estimatedTime}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default ResourcePack;

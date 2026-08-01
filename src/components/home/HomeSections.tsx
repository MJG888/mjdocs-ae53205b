import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Eye, Flame, Sparkles, Clock, FileQuestion, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Doc = Tables<"documents">;

function DocGrid({ docs }: { docs: Doc[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map((doc) => (
        <Link
          key={doc.id}
          to={`/documents/${doc.id}`}
          className="bg-card border border-border rounded-xl p-5 card-hover block"
        >
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {doc.doc_type === "question_paper" ? "Question Paper" : "Notes"}
            </Badge>
            {doc.semester && (
              <Badge variant="outline" className="text-xs">
                {doc.semester}
              </Badge>
            )}
          </div>
          <h3 className="font-display font-semibold text-foreground line-clamp-2">{doc.title}</h3>
          {doc.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {doc.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {doc.view_count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  docs,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  docs: Doc[];
}) {
  if (docs.length === 0) return null;
  return (
    <div className="mb-14">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-muted-foreground mb-5">{subtitle}</p>
      <DocGrid docs={docs} />
    </div>
  );
}

export function HomeSections() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    supabase
      .from("documents")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => setDocs(data ?? []));
  }, []);

  if (docs.length === 0) return null;

  const featured = docs.filter((d) => d.is_featured).slice(0, 3);
  const recent = docs.slice(0, 6);
  const papers = docs.filter((d) => d.doc_type === "question_paper").slice(0, 6);
  const popular = [...docs].sort((a, b) => b.download_count - a.download_count).slice(0, 6);
  const announcements = docs.slice(0, 3);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {announcements.length > 0 && (
          <div className="mb-12 rounded-xl border border-border bg-accent/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Latest uploads</h2>
            </div>
            <ul className="space-y-1.5">
              {announcements.map((doc) => (
                <li key={doc.id} className="text-sm">
                  <Link to={`/documents/${doc.id}`} className="text-muted-foreground hover:text-primary">
                    New: {doc.title}
                    {doc.semester ? ` — ${doc.semester}` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Section
          icon={Sparkles}
          title="Featured notes"
          subtitle="Hand-picked material our team recommends this month."
          docs={featured}
        />
        <Section
          icon={FileQuestion}
          title="Latest question papers"
          subtitle="Recent previous year papers with real exam patterns."
          docs={papers}
        />
        <Section
          icon={Clock}
          title="Recently uploaded"
          subtitle="Fresh notes and papers added to the library."
          docs={recent}
        />
        <Section
          icon={Flame}
          title="Most downloaded"
          subtitle="What students are grabbing the most right now."
          docs={popular}
        />
      </div>
    </section>
  );
}
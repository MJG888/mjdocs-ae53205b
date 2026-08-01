import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Download,
  Eye,
  FileText,
  HardDrive,
  Heart,
  Layers,
  Loader2,
  RefreshCw,
  ThumbsUp,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Seo, breadcrumbJsonLd, SITE_URL } from "@/components/seo/Seo";
import { AdSlot } from "@/components/ads/AdSlot";
import { PdfPreview } from "@/components/documents/PdfPreview";
import { ShareDialog } from "@/components/documents/ShareDialog";
import { ReportDialog } from "@/components/documents/ReportDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  buildDescription,
  formatFileSize,
  getSignedUrl,
  recordLocalDownload,
  recordRecentlyViewed,
} from "@/lib/documents";
import type { Tables } from "@/integrations/supabase/types";

type Doc = Tables<"documents">;

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [related, setRelated] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState("");
  const [liked, setLiked] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      setDoc(data ?? null);
      setLoading(false);

      if (data) {
        recordRecentlyViewed(data.id);
        supabase.rpc("increment_document_view", { _document_id: data.id });
        getSignedUrl(data.id)
          .then((url) => active && setFileUrl(url))
          .catch(() => undefined);

        const { data: rel } = await supabase
          .from("documents")
          .select("*")
          .eq("status", "active")
          .neq("id", data.id)
          .or(
            [
              data.category ? `category.eq.${data.category}` : null,
              data.semester ? `semester.eq.${data.semester}` : null,
            ]
              .filter(Boolean)
              .join(",") || `id.neq.${data.id}`,
          )
          .order("download_count", { ascending: false })
          .limit(12);
        if (active) setRelated(rel ?? []);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("document_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("document_id", id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
    supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("document_id", id)
      .maybeSingle()
      .then(({ data }) => setFavorite(!!data));
  }, [user, id]);

  const isPaper = doc?.doc_type === "question_paper";
  const relatedNotes = useMemo(() => related.filter((d) => d.doc_type !== "question_paper").slice(0, 4), [related]);
  const relatedPapers = useMemo(() => related.filter((d) => d.doc_type === "question_paper").slice(0, 4), [related]);
  const longDescription = doc ? buildDescription(doc) : "";

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const url = await getSignedUrl(doc.id);
      await supabase.functions.invoke("increment-download", { body: { documentId: doc.id } });
      recordLocalDownload(doc.id);
      if (user) {
        await supabase.from("user_downloads").insert({ user_id: user.id, document_id: doc.id });
      }
      window.open(url, "_blank");
      setDoc({ ...doc, download_count: doc.download_count + 1 });
      toast({ title: "Download started", description: doc.file_name });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Sign in to mark notes as helpful." });
      return;
    }
    if (!doc) return;
    if (liked) {
      await supabase.from("document_likes").delete().eq("user_id", user.id).eq("document_id", doc.id);
      setLiked(false);
      setDoc({ ...doc, helpful_count: Math.max(doc.helpful_count - 1, 0) });
    } else {
      await supabase.from("document_likes").insert({ user_id: user.id, document_id: doc.id });
      setLiked(true);
      setDoc({ ...doc, helpful_count: doc.helpful_count + 1 });
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Sign in to bookmark documents." });
      return;
    }
    if (!doc) return;
    if (favorite) {
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("document_id", doc.id);
      setFavorite(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase.from("user_favorites").insert({ user_id: user.id, document_id: doc.id });
      setFavorite(true);
      toast({ title: "Bookmarked" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!doc) {
    return (
      <Layout>
        <Seo title="Document not found | MJDOCS" description="This document is no longer available." path={`/documents/${id}`} noindex />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Document not found</h1>
          <p className="text-muted-foreground mb-6">It may have been removed or the link is incorrect.</p>
          <Link to="/documents">
            <Button>Browse all documents</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const pageTitle = `${doc.title}${doc.subject_code ? ` (${doc.subject_code})` : ""} PDF — Free Download | MJDOCS`;
  const metaDescription = (doc.description?.trim() ||
    `Download ${doc.title}${doc.semester ? ` for ${doc.semester}` : ""} as a free PDF. Preview online, see topics covered and exam tips on MJDOCS.`
  ).slice(0, 158);
  const path = `/documents/${doc.id}`;

  return (
    <Layout>
      <Seo
        title={pageTitle.slice(0, 65)}
        description={metaDescription}
        path={path}
        type="article"
        jsonLd={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Documents", path: "/documents" },
            { name: doc.title, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: doc.title,
            description: metaDescription,
            url: `${SITE_URL}${path}`,
            learningResourceType: isPaper ? "Exam question paper" : "Study notes",
            educationalLevel: doc.semester ?? undefined,
            about: doc.category ?? undefined,
            dateModified: doc.updated_at,
            datePublished: doc.created_at,
            inLanguage: "en",
            isAccessibleForFree: true,
          },
        ]}
      />

      <AdSlot format="header" className="container mx-auto px-4 pt-4" />

      {/* Header */}
      <section className="py-10 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/documents" className="hover:text-primary">Documents</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{doc.title}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge>{isPaper ? "Question Paper" : "Notes"}</Badge>
            {doc.subject_code && <Badge variant="secondary">{doc.subject_code}</Badge>}
            {doc.semester && <Badge variant="outline">{doc.semester}</Badge>}
            {doc.exam_type && <Badge variant="outline">{doc.exam_type}</Badge>}
            {doc.exam_year && <Badge variant="outline">{doc.exam_year}</Badge>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{doc.title}</h1>
          {doc.description && <p className="text-muted-foreground max-w-3xl">{doc.description}</p>}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="min-w-0 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat icon={HardDrive} label="File size" value={formatFileSize(doc.file_size)} />
                <Stat icon={FileText} label="Pages" value={doc.page_count ? `${doc.page_count}` : "—"} />
                <Stat icon={Download} label="Downloads" value={`${doc.download_count}`} />
                <Stat icon={Eye} label="Views" value={`${doc.view_count}`} />
                <Stat
                  icon={Calendar}
                  label="Uploaded"
                  value={format(new Date(doc.created_at), "d MMM yyyy")}
                />
                <Stat
                  icon={RefreshCw}
                  label="Last updated"
                  value={formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                />
                <Stat icon={Layers} label="Version" value={`v${doc.current_version}`} />
                <Stat icon={ThumbsUp} label="Helpful" value={`${doc.helpful_count}`} />
              </div>

              {/* Preview */}
              <div>
                <h2 className="font-display text-xl font-bold mb-3">Preview</h2>
                <PdfPreview url={fileUrl} title={doc.title} fileType={doc.file_type} />
              </div>

              {/* Download + actions */}
              <div className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={handleDownload}>
                  <Download className="w-5 h-5 mr-2" />
                  Download {doc.file_type?.includes("pdf") ? "PDF" : "file"} ({formatFileSize(doc.file_size)})
                </Button>
                <Button variant={liked ? "secondary" : "outline"} size="sm" onClick={toggleLike}>
                  <ThumbsUp className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  Helpful ({doc.helpful_count})
                </Button>
                <Button variant={favorite ? "secondary" : "outline"} size="sm" onClick={toggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${favorite ? "fill-current text-red-500" : ""}`} />
                  {favorite ? "Bookmarked" : "Bookmark"}
                </Button>
                <ShareDialog title={doc.title} url={`${SITE_URL}${path}`} />
                <ReportDialog documentId={doc.id} />
              </div>

              {/* About */}
              <article className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-bold mb-4">
                  About {isPaper ? "this question paper" : `this subject`}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {longDescription.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </article>

              <AdSlot format="in-content" />

              {/* Topics */}
              {doc.topics && doc.topics.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-bold mb-4">
                    {isPaper ? "Important units" : "Topics covered"}
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {doc.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prep tips */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-bold mb-4">
                  {isPaper ? "How to use this paper" : "Exam preparation tips"}
                </h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  {doc.prep_tips?.trim() ? (
                    doc.prep_tips.split("\n").filter(Boolean).map((tip, i) => <p key={i}>{tip}</p>)
                  ) : (
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Skim the full document once to map the syllabus before deep reading.</li>
                      <li>Attempt previous year questions under timed conditions, then self-evaluate.</li>
                      <li>Maintain a one-page formula and definition sheet for last-minute revision.</li>
                      <li>Revise each module within 24 hours and again after a week to lock in recall.</li>
                      <li>Write full-length answers by hand — recognition is not the same as recall.</li>
                    </ul>
                  )}
                </div>
              </div>

              {/* Related */}
              <RelatedList title="Related notes" docs={relatedNotes} />
              <RelatedList
                title={isPaper ? "Previous year papers" : "Related question papers"}
                docs={relatedPapers}
              />

              <AdSlot format="multiplex" />
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display font-semibold mb-3">Document details</h3>
                <dl className="text-sm space-y-2">
                  <Row label="Subject" value={doc.category || "—"} />
                  <Row label="Subject code" value={doc.subject_code || "—"} />
                  <Row label="Semester" value={doc.semester || "—"} />
                  <Row label="File name" value={doc.file_name} />
                  <Row label="Type" value={isPaper ? "Question paper" : "Notes"} />
                </dl>
              </div>
              <AdSlot format="sidebar" className="hidden lg:block" />
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-display font-semibold text-foreground text-sm">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-foreground text-right truncate">{value}</dd>
    </div>
  );
}

function RelatedList({ title, docs }: { title: string; docs: Tables<"documents">[] }) {
  if (docs.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {docs.map((d) => (
          <Link
            key={d.id}
            to={`/documents/${d.id}`}
            className="bg-card border border-border rounded-xl p-4 card-hover block"
          >
            <p className="font-medium text-foreground truncate">{d.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {[d.subject_code, d.semester, `${d.download_count} downloads`].filter(Boolean).join(" · ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
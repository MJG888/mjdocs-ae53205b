import { useEffect, useRef, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfPreviewProps {
  url: string;
  title: string;
  fileType?: string | null;
}

/** Lazy: the iframe only mounts once the block scrolls into view and the user opts in. */
export function PdfPreview({ url, title, fileType }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [show, setShow] = useState(false);

  const isImage = fileType?.includes("image");
  const isPdf = fileType?.includes("pdf");
  const previewable = isPdf || isImage || fileType?.includes("text");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="rounded-xl border border-border overflow-hidden bg-muted/30">
      <div className="h-[520px] w-full">
        {!previewable ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-muted-foreground">
              This file type can't be previewed in the browser. Download it to view.
            </p>
          </div>
        ) : !show ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-3xl">
              📕
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Preview the full document before downloading — no signup needed.
            </p>
            <Button onClick={() => setShow(true)} disabled={!inView || !url}>
              {!url ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              {url ? "Load preview" : "Preparing file..."}
            </Button>
          </div>
        ) : isImage ? (
          <img src={url} alt={title} loading="lazy" className="w-full h-full object-contain" />
        ) : (
          <iframe
            src={isPdf ? `${url}#toolbar=1&navpanes=0` : url}
            title={`${title} preview`}
            loading="lazy"
            className="w-full h-full border-0 bg-background"
          />
        )}
      </div>
    </div>
  );
}
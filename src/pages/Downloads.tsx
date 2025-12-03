import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2, FolderOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  category: string | null;
  tags: string[] | null;
  download_count: number;
  created_at: string;
}

interface DownloadRecord {
  documentId: string;
  downloadedAt: string;
}

const DOWNLOADS_KEY = "mjdocs_downloads";

export default function Downloads() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDownloadedDocuments();
  }, []);

  const getDownloadHistory = (): DownloadRecord[] => {
    const stored = localStorage.getItem(DOWNLOADS_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const fetchDownloadedDocuments = async () => {
    try {
      const history = getDownloadHistory();
      const documentIds = history.map((r) => r.documentId);

      if (documentIds.length === 0) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .in("id", documentIds)
        .eq("status", "active");

      if (error) throw error;

      // Sort by download date (most recent first)
      const sortedDocs = (data || []).sort((a, b) => {
        const aRecord = history.find((r) => r.documentId === a.id);
        const bRecord = history.find((r) => r.documentId === b.id);
        return new Date(bRecord?.downloadedAt || 0).getTime() - new Date(aRecord?.downloadedAt || 0).getTime();
      });

      setDocuments(sortedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load downloaded documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(DOWNLOADS_KEY);
    setDocuments([]);
    toast({
      title: "History Cleared",
      description: "Your download history has been cleared.",
    });
  };

  const handleDownload = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    try {
      // Increment download count via edge function
      await supabase.functions.invoke("increment-download", {
        body: { documentId: id },
      });

      // Get download URL
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(doc.file_path);

      window.open(data.publicUrl, "_blank");

      toast({
        title: "Download Started",
        description: `Downloading ${doc.file_name}`,
      });
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Download Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(doc.file_path);

    window.open(data.publicUrl, "_blank");
  };

  const getDownloadDate = (id: string): string | undefined => {
    const history = getDownloadHistory();
    const record = history.find((r) => r.documentId === id);
    return record?.downloadedAt;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-4">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                My Downloads
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your <span className="text-primary">Downloaded</span> Documents
            </h1>
            <p className="text-muted-foreground">
              View and re-download documents you've previously downloaded.
            </p>
          </div>
        </div>
      </section>

      {/* Downloads List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {documents.length > 0 && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Downloads Yet
                </h3>
                <p className="text-muted-foreground">
                  Documents you download will appear here for easy access.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {documents.length} downloaded document{documents.length !== 1 ? "s" : ""}
                </p>
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      description={doc.description || undefined}
                      fileName={doc.file_name}
                      fileSize={doc.file_size}
                      fileType={doc.file_type || undefined}
                      category={doc.category || undefined}
                      tags={doc.tags || undefined}
                      downloadCount={doc.download_count}
                      createdAt={getDownloadDate(doc.id) || doc.created_at}
                      onDownload={handleDownload}
                      onView={handleView}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

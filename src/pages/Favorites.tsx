import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2, FileX } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  category: string | null;
  download_count: number;
  created_at: string;
}

export default function Favorites() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [viewerUrl, setViewerUrl] = useState("");
  
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        document_id,
        documents (
          id,
          title,
          description,
          file_name,
          file_path,
          file_size,
          file_type,
          category,
          download_count,
          created_at
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } else if (data) {
      const docs = data
        .map((item: any) => item.documents)
        .filter((doc: Document | null) => doc !== null) as Document[];
      setDocuments(docs);
    }
    setIsLoading(false);
  };

  const handleRemoveFavorite = async (documentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("document_id", documentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    } else {
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      toast({
        title: "Removed",
        description: "Document removed from favorites",
      });
    }
  };

  const handleDownload = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    try {
      // Get signed URL from edge function
      const { data: result, error } = await supabase.functions.invoke("get-signed-url", {
        body: { documentId: id },
      });

      if (error || result?.error) {
        throw new Error(result?.error || error?.message || "Failed to get download link");
      }

      // Increment download count
      await supabase.functions.invoke("increment-download", {
        body: { documentId: id },
      });

      // Track download in user_downloads
      if (user) {
        await supabase.from("user_downloads").insert({
          user_id: user.id,
          document_id: id,
        });
      }

      // Open signed URL in new tab
      window.open(result.signedUrl, "_blank");
    } catch (error) {
      console.error("Error downloading:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    
    try {
      // Get signed URL for viewing
      const { data: result } = await supabase.functions.invoke("get-signed-url", {
        body: { documentId: id },
      });
      
      if (result?.signedUrl) {
        setViewerUrl(result.signedUrl);
        setViewingDoc(doc);
      }
    } catch (error) {
      console.error("Error getting view URL:", error);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-background to-orange-100/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              My Favorites
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your bookmarked documents for quick access. Save documents you frequently need.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <FileX className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                No Favorites Yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start browsing documents and click the heart icon to save them here for quick access.
              </p>
              <Button variant="hero" onClick={() => navigate("/documents")}>
                Browse Documents
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  downloadCount={doc.download_count}
                  createdAt={doc.created_at}
                  onDownload={handleDownload}
                  onView={handleView}
                  onRemoveFavorite={handleRemoveFavorite}
                  isFavorite={true}
                  showActionsAlways={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Document Viewer Modal */}
      {viewingDoc && viewerUrl && (
        <DocumentViewer
          isOpen={!!viewingDoc}
          onClose={() => {
            setViewingDoc(null);
            setViewerUrl("");
          }}
          title={viewingDoc.title}
          fileUrl={viewerUrl}
          fileType={viewingDoc.file_type || undefined}
          fileName={viewingDoc.file_name}
          onDownload={() => handleDownload(viewingDoc.id)}
        />
      )}
    </Layout>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { SearchFilter } from "@/components/documents/SearchFilter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Loader2, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Fetch user favorites
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_favorites")
      .select("document_id")
      .eq("user_id", user.id);
    
    if (data) {
      setFavorites(new Set(data.map((f) => f.document_id)));
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = documents
      .map((doc) => doc.category)
      .filter((cat): cat is string => cat !== null);
    return [...new Set(cats)];
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "downloads":
        filtered.sort((a, b) => b.download_count - a.download_count);
        break;
      case "size":
        filtered.sort((a, b) => b.file_size - a.file_size);
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [documents, searchQuery, selectedCategory, sortBy]);

  const handleDownload = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    try {
      // Increment download count via edge function (bypasses RLS)
      const { data: result } = await supabase.functions.invoke("increment-download", {
        body: { documentId: id },
      });

      // Save to localStorage for Downloads page
      const DOWNLOADS_KEY = "mjdocs_downloads";
      const stored = localStorage.getItem(DOWNLOADS_KEY);
      const history = stored ? JSON.parse(stored) : [];
      const existingIndex = history.findIndex((r: { documentId: string }) => r.documentId === id);
      if (existingIndex >= 0) {
        history[existingIndex].downloadedAt = new Date().toISOString();
      } else {
        history.unshift({ documentId: id, downloadedAt: new Date().toISOString() });
      }
      localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(history));

      // Get download URL
      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(doc.file_path);

      // Open download in new tab
      window.open(data.publicUrl, "_blank");

      // Update local state with new count
      const newCount = result?.newCount || doc.download_count + 1;
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, download_count: newCount } : d
        )
      );

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
    setViewingDoc(doc);
  };

  const handleToggleFavorite = async (id: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites.",
        variant: "destructive",
      });
      return;
    }

    const isFav = favorites.has(id);
    
    if (isFav) {
      // Remove from favorites
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("document_id", id);

      if (!error) {
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast({ title: "Removed from favorites" });
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, document_id: id });

      if (!error) {
        setFavorites((prev) => new Set(prev).add(id));
        toast({ title: "Added to favorites" });
      }
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Document Library
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse <span className="text-primary">Documents</span>
            </h1>
            <p className="text-muted-foreground">
              Search, filter, and download from our collection of verified documents.
            </p>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            categories={categories}
          />

          <div className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Documents Found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filters."
                    : "Documents will appear here once uploaded by an administrator."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
                </p>
                <div className="grid gap-4">
                  {filteredDocuments.map((doc) => (
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
                      createdAt={doc.created_at}
                      onDownload={handleDownload}
                      onView={handleView}
                      isFavorite={favorites.has(doc.id)}
                      onToggleFavorite={user ? handleToggleFavorite : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewer
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title={viewingDoc.title}
          fileUrl={getFileUrl(viewingDoc.file_path)}
          fileType={viewingDoc.file_type || undefined}
          fileName={viewingDoc.file_name}
          onDownload={() => handleDownload(viewingDoc.id)}
        />
      )}
    </Layout>
  );
}

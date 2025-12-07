import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Loader2,
  FileText,
  Download,
  Users,
  Heart,
  TrendingUp,
  BarChart3,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

interface Stats {
  totalDocuments: number;
  totalDownloads: number;
  totalUsers: number;
  totalFavorites: number;
  recentDownloads: { document_id: string; title: string; downloaded_at: string }[];
  categoryBreakdown: { category: string; count: number }[];
  topDocuments: { id: string; title: string; download_count: number }[];
}

export default function Statistics() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch documents
      const { data: documents } = await supabase
        .from("documents")
        .select("id, title, download_count, category")
        .eq("status", "active");

      // Fetch users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true });

      // Fetch recent downloads with document titles
      const { data: recentDownloadsData } = await supabase
        .from("user_downloads")
        .select("document_id, downloaded_at, documents(title)")
        .order("downloaded_at", { ascending: false })
        .limit(10);

      // Calculate category breakdown
      const categoryMap = new Map<string, number>();
      documents?.forEach((doc) => {
        const cat = doc.category || "Uncategorized";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });

      // Top documents by downloads
      const topDocs = [...(documents || [])]
        .sort((a, b) => b.download_count - a.download_count)
        .slice(0, 5);

      setStats({
        totalDocuments: documents?.length || 0,
        totalDownloads: documents?.reduce((sum, d) => sum + d.download_count, 0) || 0,
        totalUsers: usersCount || 0,
        totalFavorites: favoritesCount || 0,
        recentDownloads: recentDownloadsData?.map((d) => ({
          document_id: d.document_id,
          title: (d.documents as { title: string })?.title || "Unknown",
          downloaded_at: d.downloaded_at,
        })) || [],
        categoryBreakdown: Array.from(categoryMap.entries()).map(([category, count]) => ({
          category,
          count,
        })),
        topDocuments: topDocs.map((d) => ({
          id: d.id,
          title: d.title,
          download_count: d.download_count,
        })),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Statistics</h1>
              <p className="text-xs text-muted-foreground">Analytics & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalDownloads}</p>
                <p className="text-xs text-muted-foreground">Total Downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Registered Users</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalFavorites}</p>
                <p className="text-xs text-muted-foreground">Total Favorites</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Documents */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Top Documents</h2>
            </div>
            {stats?.topDocuments.length ? (
              <div className="space-y-3">
                {stats.topDocuments.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {doc.title}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {doc.download_count} downloads
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents yet</p>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Categories</h2>
            </div>
            {stats?.categoryBreakdown.length ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(cat.count / (stats?.totalDocuments || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories yet</p>
            )}
          </div>

          {/* Recent Downloads */}
          <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Recent Downloads</h2>
            </div>
            {stats?.recentDownloads.length ? (
              <div className="space-y-2">
                {stats.recentDownloads.map((download, index) => (
                  <div
                    key={`${download.document_id}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-foreground truncate max-w-[300px]">
                      {download.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(download.downloaded_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No downloads yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

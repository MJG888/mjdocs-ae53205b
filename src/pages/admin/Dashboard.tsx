import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Upload,
  Trash2,
  Edit,
  LogOut,
  Plus,
  Download,
  RefreshCw,
  RotateCcw,
  Loader2,
  FolderOpen,
  LayoutDashboard,
  History,
  BarChart3,
  FileQuestion,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  current_version: number;
  status: "active" | "soft_deleted";
  download_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  semester: string | null;
}

interface Semester {
  id: string;
  name: string;
  display_order: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Upload dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadSemester, setUploadSemester] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit dialog state
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSemester, setEditSemester] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDocuments();
      fetchSemesters();
    }
  }, [user, isAdmin, showDeleted]);

  const fetchSemesters = async () => {
    const { data } = await supabase
      .from("semesters")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (data) {
      setSemesters(data);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("documents").select("*");
      
      if (!showDeleted) {
        query = query.eq("status", "active");
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as Document[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a file and title.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = uploadFile.name.split(".").pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: insertError } = await supabase.from("documents").insert({
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || null,
        file_name: uploadFile.name,
        file_path: filePath,
        file_size: uploadFile.size,
        file_type: uploadFile.type,
        category: uploadCategory.trim() || null,
        tags: uploadTags.trim() ? uploadTags.split(",").map((t) => t.trim()) : null,
        semester: uploadSemester || null,
        uploaded_by: user?.id,
      });

      if (insertError) throw insertError;

      toast({
        title: "Upload Successful",
        description: `${uploadFile.name} has been uploaded.`,
      });

      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("");
      setUploadTags("");
      setUploadSemester("");
      setIsUploadOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!editDoc) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from("documents")
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          category: editCategory.trim() || null,
          tags: editTags.trim() ? editTags.split(",").map((t) => t.trim()) : null,
          semester: editSemester || null,
        })
        .eq("id", editDoc.id);

      if (error) throw error;

      toast({
        title: "Document Updated",
        description: "Changes have been saved.",
      });

      setEditDoc(null);
      fetchDocuments();
    } catch (error) {
      console.error("Edit error:", error);
      toast({
        title: "Update Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleSoftDelete = async (doc: Document) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: "soft_deleted", deleted_at: new Date().toISOString() })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "The document has been moved to trash.",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (doc: Document) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: "active", deleted_at: null })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Document Restored",
        description: "The document has been restored.",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (doc: Document) => {
    try {
      // Delete from storage
      await supabase.storage.from("documents").remove([doc.file_path]);

      // Delete from database
      const { error } = await supabase.from("documents").delete().eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Permanently Deleted",
        description: "The document has been permanently removed.",
      });

      fetchDocuments();
    } catch (error) {
      console.error("Permanent delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (doc: Document) => {
    setEditDoc(doc);
    setEditTitle(doc.title);
    setEditDescription(doc.description || "");
    setEditCategory(doc.category || "");
    setEditTags(doc.tags?.join(", ") || "");
    setEditSemester(doc.semester || "");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
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
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/statistics">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Statistics</span>
              </Button>
            </Link>
            <Link to="/admin/requests">
              <Button variant="outline" size="sm" className="gap-2">
                <FileQuestion className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </Button>
            </Link>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {documents.filter((d) => d.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">Active Documents</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {documents.reduce((sum, d) => sum + d.download_count, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {documents.filter((d) => d.status === "soft_deleted").length}
                </p>
                <p className="text-xs text-muted-foreground">In Trash</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {documents.reduce((sum, d) => sum + d.current_version, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Versions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the library.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>File *</Label>
                  <Input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  {uploadFile && (
                    <p className="text-xs text-muted-foreground">
                      {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={uploadSemester} onValueChange={setUploadSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.name}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      placeholder="e.g., Reports"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Trash2 className="w-4 h-4" />
            {showDeleted ? "Showing Trash" : "Show Trash"}
          </Button>

          <Button variant="outline" onClick={fetchDocuments}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Documents
            </h3>
            <p className="text-muted-foreground mb-4">
              {showDeleted
                ? "No documents in trash."
                : "Upload your first document to get started."}
            </p>
            {!showDeleted && (
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="w-4 h-4" />
                Upload Document
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Document</th>
                    <th className="text-left p-4 font-semibold text-foreground">Semester</th>
                    <th className="text-left p-4 font-semibold text-foreground">Category</th>
                    <th className="text-left p-4 font-semibold text-foreground">Size</th>
                    <th className="text-left p-4 font-semibold text-foreground">Downloads</th>
                    <th className="text-left p-4 font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-xl">
                            📄
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {doc.semester ? (
                          <Badge variant="outline">{doc.semester}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {doc.category ? (
                          <Badge variant="secondary">{doc.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="p-4 text-muted-foreground">{doc.download_count}</td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {format(new Date(doc.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={doc.status === "active" ? "default" : "destructive"}
                        >
                          {doc.status === "active" ? "Active" : "Deleted"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === "active" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(doc)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will move "{doc.title}" to trash. You can restore it later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSoftDelete(doc)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(doc)}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{doc.title}". This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handlePermanentDelete(doc)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Permanently
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editDoc} onOpenChange={() => setEditDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update document information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={editSemester || "none"} onValueChange={(value) => setEditSemester(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Semester</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.id} value={sem.name}>
                      {sem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="e.g., Reports"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="tag1, tag2"
                />
              </div>
            </div>
            <Button onClick={handleEdit} disabled={isEditing} className="w-full">
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

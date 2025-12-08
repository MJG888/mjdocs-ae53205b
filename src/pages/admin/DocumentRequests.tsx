import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  FileQuestion,
  LogOut,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DocumentRequest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
  in_progress: { icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
};

export default function DocumentRequests() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchRequests();
    }
  }, [user, isAdmin]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch usernames
      const userIds = [...new Set(data?.map((r) => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);

      setRequests(
        data?.map((r) => ({
          ...r,
          username: profileMap.get(r.user_id) || "Unknown User",
        })) || []
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load document requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("document_requests")
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: "The request has been updated successfully.",
      });

      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Update Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openRequestDialog = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setAdminNotes(request.admin_notes || "");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

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
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <FileQuestion className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-foreground truncate">Document Requests</h1>
              <p className="text-xs text-muted-foreground">Manage user requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
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
        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={request.id}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openRequestDialog(request)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{request.title}</h3>
                        <Badge className={`${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {request.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {request.username}
                        </span>
                        <span>{format(new Date(request.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Requests</h3>
            <p className="text-sm text-muted-foreground">
              {filterStatus === "all"
                ? "No document requests have been submitted yet."
                : `No ${filterStatus} requests found.`}
            </p>
          </div>
        )}

        {/* Update Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Update Request</DialogTitle>
              <DialogDescription>
                Review and update the status of this document request.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 mt-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-1">{selectedRequest.title}</h4>
                  {selectedRequest.description && (
                    <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    {selectedRequest.username}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for the user..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleUpdateRequest}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Request"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

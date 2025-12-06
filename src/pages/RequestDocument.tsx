import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileQuestion, Send, Loader2, Clock, CheckCircle, XCircle, FileCheck } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";

const requestSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  description: z.string().trim().max(1000, "Description too long").optional(),
});

interface DocumentRequest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Rejected" },
  fulfilled: { icon: FileCheck, color: "bg-blue-100 text-blue-800", label: "Fulfilled" },
};

export default function RequestDocument() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    
    const result = requestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("document_requests")
      .insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Submitted",
        description: "Your document request has been submitted successfully.",
      });
      setFormData({ title: "", description: "" });
      if (data) {
        setRequests([data, ...requests]);
      }
    }

    setIsSubmitting(false);
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
              <FileQuestion className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Request a Document
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Can't find what you're looking for? Submit a request and our admins will try to add it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Request Form */}
            <div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  Submit New Request
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title *</Label>
                    <Input
                      id="title"
                      placeholder="What document are you looking for?"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: "" });
                      }}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide any additional details about the document you need..."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: "" });
                      }}
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Request History */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Your Requests
              </h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
                  <p className="text-muted-foreground">
                    You haven't made any requests yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => {
                    const status = statusConfig[request.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    
                    return (
                      <div
                        key={request.id}
                        className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {request.title}
                          </h3>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        
                        {request.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {request.description}
                          </p>
                        )}
                        
                        {request.admin_notes && (
                          <div className="bg-muted/50 rounded-lg p-3 mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Admin Response:
                            </p>
                            <p className="text-sm text-foreground">{request.admin_notes}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-3">
                          Submitted {format(new Date(request.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

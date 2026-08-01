import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const REASONS = [
  { value: "broken_pdf", label: "PDF is broken or won't open" },
  { value: "wrong_file", label: "Wrong file for this subject" },
  { value: "poor_quality", label: "Unreadable or low quality scan" },
  { value: "copyright", label: "Copyright concern" },
  { value: "other", label: "Something else" },
];

export function ReportDialog({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const submit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("document_reports").insert({
      document_id: documentId,
      user_id: user?.id ?? null,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Could not send report", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report sent", description: "Thanks — we'll review this file shortly." });
    setOpen(false);
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="w-4 h-4 mr-2" />
          Report a problem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Report this file</DialogTitle>
          <DialogDescription>Tell us what's wrong and we'll fix or replace it.</DialogDescription>
        </DialogHeader>

        <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
          {REASONS.map((r) => (
            <div key={r.value} className="flex items-center gap-2">
              <RadioGroupItem value={r.value} id={r.value} />
              <Label htmlFor={r.value} className="font-normal cursor-pointer">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Textarea
          placeholder="Optional details (page numbers, error message, etc.)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={1000}
        />

        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Sending..." : "Send report"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
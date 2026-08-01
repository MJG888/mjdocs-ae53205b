import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ShareDialog({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied", description: "Share it with your classmates." });
    } catch {
      toast({ title: "Copy failed", description: "Copy the link manually.", variant: "destructive" });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share this document</DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <div className="p-4 bg-background border border-border rounded-xl">
            <QRCodeCanvas value={url} size={160} includeMargin={false} />
          </div>
        </div>

        <div className="flex gap-2">
          <Input readOnly value={url} className="text-sm" onFocus={(e) => e.currentTarget.select()} />
          <Button onClick={copy} variant={copied ? "secondary" : "default"}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan the QR code to open this page on a phone.
        </p>
      </DialogContent>
    </Dialog>
  );
}
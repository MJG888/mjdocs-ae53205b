import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
  fileType?: string;
  fileName: string;
  onDownload: () => void;
}

function isViewableInBrowser(fileType?: string): boolean {
  if (!fileType) return false;
  return (
    fileType.includes("pdf") ||
    fileType.includes("image") ||
    fileType.includes("text")
  );
}

export function DocumentViewer({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileType,
  fileName,
  onDownload,
}: DocumentViewerProps) {
  const canView = isViewableInBrowser(fileType);
  const isPdf = fileType?.includes("pdf");
  const isImage = fileType?.includes("image");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-lg truncate pr-4">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(fileUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {canView ? (
            isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={title}
              />
            ) : isImage ? (
              <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                <img
                  src={fileUrl}
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <iframe
                src={fileUrl}
                className="w-full h-full border-0 bg-background"
                title={title}
              />
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center text-4xl mb-6">
                📄
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Preview Not Available
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                This file type ({fileName.split('.').pop()?.toUpperCase() || 'Unknown'}) cannot be previewed in the browser. 
                Please download the file to view it.
              </p>
              <Button onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download {fileName}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { FileText, Download, Calendar, HardDrive, Tag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface DocumentCardProps {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  category?: string;
  tags?: string[];
  downloadCount: number;
  createdAt: string;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
  viewPrimary?: boolean;
  showActionsAlways?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(fileType?: string): string {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("doc")) return "📘";
  if (fileType.includes("excel") || fileType.includes("sheet")) return "📗";
  if (fileType.includes("image")) return "🖼️";
  if (fileType.includes("video")) return "🎬";
  if (fileType.includes("audio")) return "🎵";
  if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
  return "📄";
}

export function DocumentCard({
  id,
  title,
  description,
  fileName,
  fileSize,
  fileType,
  category,
  tags,
  downloadCount,
  createdAt,
  onDownload,
  onView,
  viewPrimary = false,
  showActionsAlways = false,
}: DocumentCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-hover group">
      <div className="flex items-start gap-4">
        {/* File Icon */}
        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
          {getFileIcon(fileType)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {formatFileSize(fileSize)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {downloadCount} downloads
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Tags */}
          {(category || (tags && tags.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
              {tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex flex-col gap-2 transition-opacity ${showActionsAlways ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {viewPrimary ? (
            <>
              <Button size="sm" onClick={() => onView(id)}>
                <Eye className="w-4 h-4" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDownload(id)}>
                <Download className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => onDownload(id)}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => onView(id)}>
                <Eye className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Filter, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: string[];
  /** Titles, subject codes and tags used for auto-suggestions */
  suggestions?: string[];
  /** Most popular subjects, shown when the search box is empty */
  trending?: string[];
}

const RECENT_KEY = "mjdocs_recent_searches";

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  suggestions = [],
  trending = [],
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(readRecent()), []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set<string>();
    return suggestions
      .filter((s) => {
        const key = s.toLowerCase();
        if (!key.includes(q) || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [searchQuery, suggestions]);

  const commitSearch = (term: string) => {
    onSearchChange(term);
    setIsOpen(false);
    const next = [term, ...readRecent().filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* storage unavailable */
    }
  };

  const hasActiveFilters = selectedCategory !== "all" || sortBy !== "newest";
  const showPanel =
    isOpen && (matches.length > 0 || (!searchQuery.trim() && (recent.length > 0 || trending.length > 0)));

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1" ref={boxRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by subject name, subject code, or tag..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) commitSearch(searchQuery.trim());
              if (e.key === "Escape") setIsOpen(false);
            }}
            className="pl-10 h-12 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {showPanel && (
            <div className="absolute z-50 top-full mt-2 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden animate-slide-up">
              {matches.length > 0 && (
                <ul className="py-1">
                  {matches.map((m) => (
                    <li key={m}>
                      <button
                        type="button"
                        onClick={() => commitSearch(m)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{m}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!searchQuery.trim() && recent.length > 0 && (
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent searches
                    </span>
                    <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-primary">
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <Badge
                        key={r}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => commitSearch(r)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery.trim() && trending.length > 0 && (
                <div className="p-3">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <TrendingUp className="w-3 h-3" /> Trending subjects
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => commitSearch(t)}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-muted/50 rounded-xl p-4 animate-slide-up">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onCategoryChange("all");
                    onSortChange("newest");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Active:</span>
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button onClick={() => onCategoryChange("all")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {sortBy !== "newest" && (
                <Badge variant="secondary" className="gap-1">
                  {sortBy === "oldest" && "Oldest First"}
                  {sortBy === "name-asc" && "Name (A-Z)"}
                  {sortBy === "name-desc" && "Name (Z-A)"}
                  {sortBy === "downloads" && "Most Downloaded"}
                  {sortBy === "size" && "File Size"}
                  <button onClick={() => onSortChange("newest")}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

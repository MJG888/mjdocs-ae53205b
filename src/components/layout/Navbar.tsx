import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, User, LogOut, Heart, FileQuestion, UserPlus, Shield, MoreVertical } from "lucide-react";
import logoImg from "@/assets/MJDOCS.jpg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Documents", path: "/documents" },
  { name: "Downloads", path: "/downloads" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logoImg} alt="MJDOCS Logo" className="w-9 h-9 rounded-lg shadow-md border-[3px] border-primary group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 object-cover" />
            <span className="font-display text-2xl font-bold text-foreground tracking-tight">
              MJ<span className="text-gradient-orange">DOCS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full p-1.5 backdrop-blur-sm border border-border/50">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-full font-medium text-sm transition-all duration-300",
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-2 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <User className="w-4 h-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                      <Heart className="w-4 h-4" />
                      My Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/request-document" className="flex items-center gap-2 cursor-pointer">
                      <FileQuestion className="w-4 h-4" />
                      Request Document
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard" className="flex items-center gap-2 cursor-pointer text-primary">
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-primary cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-2 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/auth?mode=signup" className="flex items-center gap-2 cursor-pointer">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center gap-2 cursor-pointer">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/login" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isOpen 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "px-4 py-3 rounded-xl font-medium transition-all duration-300 animate-fade-in opacity-0",
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/favorites" onClick={() => setIsOpen(false)} className="mt-2">
                    <Button variant="outline" className="w-full rounded-xl border-2 shadow-md">
                      <Heart className="w-4 h-4" />
                      My Favorites
                    </Button>
                  </Link>
                  <Link to="/request-document" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-2 shadow-md">
                      <FileQuestion className="w-4 h-4" />
                      Request Document
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)} className="mt-2">
                    <Button variant="hero" className="w-full rounded-xl shadow-md">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-2 shadow-md">
                      <LogIn className="w-4 h-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full rounded-xl text-muted-foreground">
                      Admin Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

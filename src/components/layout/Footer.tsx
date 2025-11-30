import { Link } from "react-router-dom";
import { FileText, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                MJ<span className="text-primary">DOCS</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              A secure, admin-managed document storage platform. Browse, search, and download documents with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/documents" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documents
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:mjdocs777@gmail.com" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  mjdocs777@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MJDOCS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

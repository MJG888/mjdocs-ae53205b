import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download, Shield, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find documents instantly with powerful search and filtering capabilities.",
  },
  {
    icon: Download,
    title: "Fast Downloads",
    description: "Download any document with a single click. Support for large files.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "All documents are stored securely with admin-only upload access.",
  },
  {
    icon: Zap,
    title: "Version Control",
    description: "Track document versions and changes over time.",
  },
];

const stats = [
  { value: "100%", label: "Secure" },
  { value: "24/7", label: "Available" },
  { value: "Fast", label: "Downloads" },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-accent/50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent-foreground">
                Secure Document Management
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Your Documents,{" "}
              <span className="text-gradient-orange">Organized & Secure</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up stagger-1">
              MJDOCS is a secure document storage platform where you can browse, search, and download documents with ease. Admin-managed for quality control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
              <Link to="/documents">
                <Button variant="hero" size="xl">
                  <FileText className="w-5 h-5" />
                  Browse Documents
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="hero-outline" size="xl">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 md:gap-16 mt-16 animate-slide-up stagger-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">MJDOCS</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A modern document management solution built with security and usability in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-xl p-6 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-foreground/0 dark:from-primary dark:to-primary/60 rounded-2xl p-8 md:p-16 text-center relative overflow-hidden gradient-orange">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
                Start browsing our collection of documents today. All files are verified and organized for easy access.
              </p>
              <Link to="/documents">
                <Button 
                  variant="secondary" 
                  size="xl"
                  className="bg-background text-primary hover:bg-background/90 shadow-xl"
                >
                  <Search className="w-5 h-5" />
                  Explore Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

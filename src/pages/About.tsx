import { Layout } from "@/components/layout/Layout";
import { Shield, FileText, Users, Clock, CheckCircle } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "All documents are managed by verified administrators only. No unauthorized uploads.",
  },
  {
    icon: FileText,
    title: "Quality Content",
    description: "Every document is reviewed before publishing to ensure accuracy and relevance.",
  },
  {
    icon: Users,
    title: "Open Access",
    description: "Browse and download documents freely. No registration required for visitors.",
  },
  {
    icon: Clock,
    title: "Version History",
    description: "Track document changes with comprehensive version control.",
  },
];

const features = [
  "Admin-only document uploads",
  "Powerful search and filtering",
  "Multiple file format support",
  "Version control system",
  "Secure file storage",
  "Fast CDN-backed downloads",
  "Document categorization",
  "Tag-based organization",
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">MJDOCS</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              MJDOCS is a secure, admin-managed document storage platform designed to provide easy access to important documents while maintaining strict quality control. <span className="font-semibold text-primary">ADMIN: Manoj</span>
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-6">
                We believe in making document access simple, secure, and organized. MJDOCS provides a centralized platform where verified administrators can upload and manage documents, while visitors can easily browse, search, and download what they need.
              </p>
              <p className="text-muted-foreground">
                Unlike traditional file sharing platforms, MJDOCS focuses on quality over quantity. Every document is curated and verified before being made available, ensuring you always get reliable content.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="bg-card border border-border rounded-xl p-5 card-hover"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                    <value.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Platform Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for efficient document management and access.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 bg-card border border-border rounded-lg p-4"
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Browse
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore our collection of documents using search and filters.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Select
                </h3>
                <p className="text-sm text-muted-foreground">
                  View document details, metadata, and version history.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Download
                </h3>
                <p className="text-sm text-muted-foreground">
                  Download documents instantly with our fast CDN-backed delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

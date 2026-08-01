import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  highlight: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, highlight, intro, updated, sections }: LegalPageProps) {
  return (
    <Layout>
      <section className="py-16 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{title} {highlight}</span>
            </nav>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title} <span className="text-primary">{highlight}</span>
            </h1>
            <p className="text-muted-foreground">{intro}</p>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {updated}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 space-y-8">
              {sections.map((section, i) => (
                <div key={section.heading}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-3">
                    {i + 1}. {section.heading}
                  </h2>
                  <div className="text-muted-foreground space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1">
                    {section.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

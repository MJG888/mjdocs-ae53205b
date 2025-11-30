import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="py-16 bg-gradient-to-b from-orange-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground">
              Last updated: November 30, 2025
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <div className="bg-card border border-border rounded-xl p-8 space-y-8">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  1. Information We Collect
                </h2>
                <p className="text-muted-foreground">
                  MJDOCS collects minimal information to provide our document storage service:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Contact form submissions (name, email, message)</li>
                  <li>Download statistics (anonymous)</li>
                  <li>Basic usage analytics</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-muted-foreground">
                  We use collected information to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Respond to your inquiries</li>
                  <li>Improve our services</li>
                  <li>Maintain platform security</li>
                  <li>Generate anonymous usage statistics</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  3. Data Security
                </h2>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your information. All data transmissions are encrypted using SSL/TLS protocols. Admin access is restricted and monitored.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  4. Cookies
                </h2>
                <p className="text-muted-foreground">
                  We use essential cookies to maintain session state and improve user experience. No third-party tracking cookies are used without your consent.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  5. Third-Party Services
                </h2>
                <p className="text-muted-foreground">
                  MJDOCS uses secure cloud infrastructure for file storage and delivery. These services have their own privacy policies and security measures.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  6. Your Rights
                </h2>
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request data deletion</li>
                  <li>Opt out of communications</li>
                  <li>Request data correction</li>
                </ul>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  7. Contact Us
                </h2>
                <p className="text-muted-foreground">
                  For privacy-related inquiries, please contact us at{" "}
                  <a href="mailto:mjdocs777@gmail.com" className="text-primary hover:underline">
                    mjdocs777@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  8. Changes to This Policy
                </h2>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

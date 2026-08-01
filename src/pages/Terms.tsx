import { LegalPage } from "@/components/legal/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Terms &"
      highlight="Conditions"
      updated="August 1, 2026"
      intro="Please read these terms carefully before using MJDOCS."
      sections={[
        {
          heading: "Acceptance of Terms",
          body: (
            <p>
              By accessing or using MJDOCS, you agree to be bound by these Terms &amp; Conditions and our
              Privacy Policy. If you do not agree with any part of these terms, please discontinue use of
              the platform.
            </p>
          ),
        },
        {
          heading: "Use of the Platform",
          body: (
            <>
              <p>MJDOCS provides study documents, notes, and question papers for academic reference. You agree to:</p>
              <ul>
                <li>Use the material for personal, educational, non-commercial purposes only</li>
                <li>Not resell, redistribute, or republish downloaded files</li>
                <li>Not attempt to bypass access controls, scrape, or overload the service</li>
                <li>Provide accurate information when creating an account</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Accounts",
          body: (
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activity that occurs under your account. We may suspend or terminate accounts that
              violate these terms.
            </p>
          ),
        },
        {
          heading: "Intellectual Property",
          body: (
            <p>
              Documents hosted on MJDOCS remain the property of their respective authors, institutions, or
              copyright holders. MJDOCS acts as an access and organisation layer for study material. If you
              believe content infringes your rights, see our DMCA Policy.
            </p>
          ),
        },
        {
          heading: "Advertising",
          body: (
            <p>
              MJDOCS may display advertisements, including ads served by Google AdSense and its partners.
              These providers may use cookies to serve ads based on your prior visits to this or other
              websites. See our Privacy Policy for details and opt-out options.
            </p>
          ),
        },
        {
          heading: "Limitation of Liability",
          body: (
            <p>
              MJDOCS is provided on an "as is" and "as available" basis. We are not liable for any academic,
              financial, or other loss arising from the use of, or inability to use, the platform or its
              content.
            </p>
          ),
        },
        {
          heading: "Changes to These Terms",
          body: (
            <p>
              We may update these terms from time to time. Continued use of MJDOCS after changes are posted
              constitutes acceptance of the revised terms.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about these terms? Email us at{" "}
              <a className="text-primary hover:underline" href="mailto:mjdocs777@gmail.com">
                mjdocs777@gmail.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
import { LegalPage } from "@/components/legal/LegalPage";

export default function Disclaimer() {
  return (
    <LegalPage
      title="Legal"
      highlight="Disclaimer"
      updated="August 1, 2026"
      intro="What MJDOCS does and does not guarantee about its content."
      sections={[
        {
          heading: "Educational Purpose Only",
          body: (
            <p>
              All notes, question papers, and study material on MJDOCS are provided strictly for
              educational and reference purposes. They are not a substitute for official syllabus documents,
              prescribed textbooks, or guidance from your institution.
            </p>
          ),
        },
        {
          heading: "No Accuracy Guarantee",
          body: (
            <p>
              While we review uploads before publishing, MJDOCS makes no warranty regarding the accuracy,
              completeness, or currency of any document. Syllabi and exam patterns change; always verify
              against your university's official sources before relying on any material.
            </p>
          ),
        },
        {
          heading: "No University Affiliation",
          body: (
            <p>
              MJDOCS is an independent platform. It is not affiliated with, endorsed by, or sponsored by any
              university, board, or examination authority. Institution and subject names are used only to
              describe the material's context.
            </p>
          ),
        },
        {
          heading: "External Links and Advertising",
          body: (
            <p>
              Pages may contain links to third-party websites and advertisements served by Google AdSense and
              its partners. We do not control and are not responsible for the content, accuracy, or practices
              of those third parties.
            </p>
          ),
        },
        {
          heading: "Copyright Concerns",
          body: (
            <p>
              If you are a rights holder and believe material on MJDOCS infringes your copyright, please
              follow our DMCA Policy and we will act promptly.
            </p>
          ),
        },
        {
          heading: "Limitation of Liability",
          body: (
            <p>
              MJDOCS and its operators accept no liability for any loss, academic outcome, or damage
              resulting from the use of material downloaded from this site.
            </p>
          ),
        },
      ]}
    />
  );
}
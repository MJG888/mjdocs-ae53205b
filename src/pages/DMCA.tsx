import { LegalPage } from "@/components/legal/LegalPage";

export default function DMCA() {
  return (
    <LegalPage
      title="DMCA"
      highlight="Policy"
      updated="August 1, 2026"
      intro="How to report copyrighted material hosted on MJDOCS."
      sections={[
        {
          heading: "Our Position on Copyright",
          body: (
            <p>
              MJDOCS respects the intellectual property rights of others. The platform hosts study notes and
              question papers intended for academic reference. We remove any material that infringes a valid
              copyright as soon as a properly documented notice is received.
            </p>
          ),
        },
        {
          heading: "Filing a Takedown Notice",
          body: (
            <>
              <p>Send a notice to mjdocs777@gmail.com including all of the following:</p>
              <ul>
                <li>Your full name, address, phone number, and email address</li>
                <li>A description of the copyrighted work you claim has been infringed</li>
                <li>The exact URL(s) on MJDOCS where the material appears</li>
                <li>A statement that you have a good-faith belief the use is not authorised</li>
                <li>A statement, under penalty of perjury, that the information is accurate and that you are the owner or authorised to act on the owner's behalf</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Our Response Time",
          body: (
            <p>
              Valid notices are typically actioned within 72 hours. The reported file is removed or disabled
              and the uploader is notified.
            </p>
          ),
        },
        {
          heading: "Counter-Notice",
          body: (
            <p>
              If you believe your material was removed by mistake, you may send a counter-notice to the same
              address with your contact details, identification of the removed material, and a statement
              under penalty of perjury that the removal was a mistake or misidentification.
            </p>
          ),
        },
        {
          heading: "Repeat Infringers",
          body: (
            <p>
              Accounts that repeatedly upload infringing material are permanently suspended.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Copyright agent:{" "}
              <a className="text-primary hover:underline" href="mailto:mjdocs777@gmail.com">
                mjdocs777@gmail.com
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-800">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        ← Back to Main Page
      </Link>
      
      <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mt-6 mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated: June 5, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the YourCyberWill application, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not utilize our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">2. Service Scope and Responsibility</h2>
          <p>
            YourCyberWill provides zero-knowledge browser encryption tools for asset inventory storage. Because your master password and key are managed locally on your machine, you are solely responsible for keeping your credentials safe. We cannot reset or recover lost security keys.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">3. Account Status and Inactivity</h2>
          <p>
            The automated delivery of your digital vault is entirely dependent on your system check-in timer settings. It is your responsibility to maintain active check-ins to prevent premature automated delivery to your designated beneficiaries.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">4. Disclaimers and Limitations</h2>
          <p>
            YourCyberWill is an information technology tool and does not constitute a legal last will and testament under probate law. We provide this system on an "as-is" basis and accept no liability for any unintended distribution, data loss, or server availability interruptions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">5. Support</h2>
          <p>
            If you have questions about plan limits, billing updates, or system configurations, reach out to our team at{" "}
            <a href="mailto:support@yourcyberwill.com" className="text-zinc-900 underline font-medium">
              support@yourcyberwill.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
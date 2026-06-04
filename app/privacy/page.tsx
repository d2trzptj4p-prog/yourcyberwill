import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-zinc-800">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
        ← Back to Main Page
      </Link>
      
      <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight mt-6 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-500 mb-8">Last updated: June 5, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">1. Overview</h2>
          <p>
            YourCyberWill ("we," "our," or "us") provides a platform for securing and transferring digital assets and records to designated beneficiaries. We prioritize the security and confidentiality of your data through local browser-side encryption.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">2. Data We Collect</h2>
          <p>
            <strong>Account Information:</strong> We collect your name, email address, and billing details when you register for an account or subscribe to a plan.
          </p>
          <p className="mt-2">
            <strong>Encrypted Vault Data:</strong> Your passwords, notes, and files are encrypted directly in your browser using a key that we do not possess. We store this encrypted payload on our servers, but we cannot access or read its content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">3. How Your Data Is Distributed</h2>
          <p>
            Your encrypted items remain secure until your custom check-in timer expires. Upon expiration, a secure link to the encrypted payload is automatically transmitted to your designated recipients.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">4. Your Rights</h2>
          <p>
            You retain full ownership and control over your data. You may modify, delete, or export your vault entries at any point while your vault remains unlocked. Deleted information is permanently removed from our active server infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-2">5. Contact</h2>
          <p>
            For any privacy inquiries or assistance regarding your account data, contact our security registry at{" "}
            <a href="mailto:support@yourcyberwill.com" className="text-zinc-900 underline font-medium">
              support@yourcyberwill.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
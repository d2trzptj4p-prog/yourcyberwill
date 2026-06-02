import Link from "next/link";

const FEATURES = [
  {
    icon: "🔐",
    title: "End-to-End Encrypted",
    description: "AES-256 encryption ensures only you can access your data",
  },
  {
    icon: "🛡️",
    title: "Secure Sharing",
    description: "Share access with trusted recipients safely and securely",
  },
  {
    icon: "⏰",
    title: "Check-in System",
    description: "Automatic notifications ensure your vault stays secure",
  },
  {
    icon: "👥",
    title: "Multi-User Access",
    description: "Designate multiple recipients to access your digital legacy",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Cipherwill
            </h1>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            Your digital legacy, encrypted and secure
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Safely store and share sensitive information with loved ones. Create a secure vault that only unlocks when you're no longer here.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-black px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 px-8 text-base font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h3 className="text-center text-3xl font-bold text-black dark:text-white mb-16">
            Why choose Cipherwill?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-4xl">{feature.icon}</div>
                <h4 className="font-semibold text-black dark:text-white">
                  {feature.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl bg-gradient-to-r from-black to-zinc-800 px-8 py-16 text-center dark:from-white dark:to-zinc-200">
          <h3 className="text-3xl font-bold text-white dark:text-black">
            Ready to secure your digital legacy?
          </h3>
          <p className="mt-4 text-lg text-zinc-300 dark:text-zinc-700">
            Start protecting your most important information today.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-medium text-black transition-colors hover:bg-zinc-100 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © 2024 Cipherwill. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

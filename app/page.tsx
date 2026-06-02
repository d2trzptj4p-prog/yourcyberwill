"use client";

import { useState } from "react";
import Link from "next/link";

const HOW_IT_WORKS_SECTIONS = [
  {
    step: "01",
    title: "Build Your Encrypted Vault",
    subtitle: "Add passwords, crypto keys, files, or sensitive final notes.",
    description: "Your data is instantly transformed into unreadable ciphertext directly inside your browser using zero-knowledge AES-256 encryption. We never see your master passphrase, and your unencrypted data never touches the internet. It is a completely airtight digital haven.",
    bgClass: "bg-white text-zinc-900 border-b border-zinc-100",
    badge: "🔒 Client-Side Isolation",
    placeholderType: "vault"
  },
  {
    step: "02",
    title: "Set Your Life Check-In Timer",
    subtitle: "Define your threshold and tell the system when to look for you.",
    description: "You decide how often you want to confirm you are okay (e.g., every 30 days, 90 days, or 6 months). When the timer nears its end, our automated system quietly pings you via email, SMS, or Telegram. A single click resets your timer instantly. It's foolproof, completely private, and built to avoid false alarms.",
    bgClass: "bg-zinc-50 text-zinc-900 border-b border-zinc-200/60",
    badge: "⏰ Foolproof Safeguards",
    placeholderType: "timer"
  },
  {
    step: "03",
    title: "Automated, Expiring Release",
    subtitle: "Safe delivery to beneficiaries only if you completely disappear.",
    description: "If you go entirely silent and miss multiple consecutive safety check-ins over several weeks, the switch triggers. Your designated beneficiaries receive a secure email containing a uniquely generated, encrypted link to access the vault. To prevent permanent exposure, this link completely expires and self-destructs after 15 days.",
    bgClass: "bg-zinc-900 text-white",
    badge: "⏳ Secure Delivery Protocol",
    placeholderType: "release"
  }
];

const FAQS = [
  {
    question: "Is yourcyberwill open source?",
    answer: "Yes, 100%. Our entire codebase, including our cryptographic vault architecture and automated trigger scripts, is completely open-source and publicly auditable on GitHub. We believe transparency is non-negotiable for digital inheritance."
  },
  {
    question: "What happens if I just forget to click a check-in email?",
    answer: "We built an aggressive, multi-week fail-safe system so you won't accidentally trigger your vault. We don't just send one email—we will ping you repeatedly via email, secondary backup emails, SMS, and messaging apps over a grace period you define before anything is sent to beneficiaries."
  },
  {
    question: "Can your developers see the data I put inside my vault?",
    answer: "Absolutely not. We utilize zero-knowledge architecture. Your master password is used to encrypt the data locally on your device before it is backed up to our cloud. Since we don't store or know your password, we hold absolutely no keys to read your data."
  },
  {
    question: "How long do my beneficiaries have to download the vault data?",
    answer: "Once the dead man's switch triggers, your beneficiaries are sent an encrypted link via email. For strict security reasons, this link expires precisely 15 days after issuance. If not accessed, the secure pathway self-destructs to prevent stale access links from sitting in code or inboxes indefinitely."
  },
  {
    question: "What happens if your company goes out of business?",
    answer: "Because our platform functions as an open-source decentralized protocol in key areas, your automated checks are resilient. Furthermore, our trust-backed operational runway guarantees data preservation, and users can opt into decentralized blockchain networks (Web3 backups) that run independently of our central servers."
  }
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 selection:bg-zinc-200">
      
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="w-[180px] h-10 select-none overflow-hidden flex justify-center items-center">
              <img className="min-w-full min-h-full object-cover scale-120" src="/textlogo.png" alt="yourcyberwill Logo" />
            </div>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 mb-6">
            🛡️ Open-Source Digital Estate Protocol
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-6xl leading-[1.15]">
            Ensure your digital assets reach the right people. <span className="text-zinc-500">Automatically.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto">
            Create a secure digital dead man's switch. Safely hand over passwords, crypto keys, and final wishes using a system that unlocks only if you go silent.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-zinc-950 px-8 text-base font-medium text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800"
            >
              Protect Your Legacy
            </Link>
            <Link
              href="#process-steps"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Full-Width Core Mechanics Breakdown */}
      <div id="process-steps" className="w-full">
        {HOW_IT_WORKS_SECTIONS.map((section, idx) => (
          <section key={idx} className={`w-full py-24 sm:py-32 flex items-center ${section.bgClass}`}>
            <div className="mx-auto max-w-6xl px-6 w-full">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                
                {/* Text Content Block */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-60">
                      Step {section.step}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      idx === 2 ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/60 text-zinc-800'
                    }`}>
                      {section.badge}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className={`text-lg font-medium ${idx === 2 ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {section.subtitle}
                  </p>
                  <p className={`leading-relaxed text-base ${idx === 2 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {section.description}
                  </p>
                </div>

                {/* Vector Image/Mockup Placeholder Block */}
                <div className="lg:col-span-6 w-full">
                  <div className={`w-full aspect-[4/3] rounded-2xl border flex flex-col items-center justify-center p-8 relative overflow-hidden ${
                    idx === 2 
                      ? 'bg-gradient-to-br from-zinc-900 to-black border-zinc-800' 
                      : 'bg-gradient-to-br from-zinc-50 to-zinc-100/50 border-zinc-200'
                  }`}>
                    {/* Background decorative shapes */}
                    <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl ${
                      idx === 2 ? 'bg-zinc-800/20' : 'bg-zinc-300/20'
                    }`} />

                    {/* Vector / UI Illustration Stubs */}
                    {section.placeholderType === "vault" && (
                      <div className="w-full max-w-sm space-y-4 text-zinc-400 font-mono text-xs">
                        <div className="p-4 bg-white rounded-xl border border-zinc-200/80 shadow-sm space-y-2">
                          <p className="text-zinc-900 font-sans font-bold text-sm">🔒 Encrypted Vault Input</p>
                          <div className="h-8 bg-zinc-50 rounded border border-dashed border-zinc-200 flex items-center px-3 text-zinc-400">🔑 My Bitcoin Seed Phrase...</div>
                          <div className="h-8 bg-zinc-50 rounded border border-dashed border-zinc-200 flex items-center px-3 text-zinc-400">💼 Master Password Logins...</div>
                        </div>
                        <p className="text-center text-[10px] text-zinc-400 font-sans">↓ Data converts locally to AES-256 ciphertext before cloud sync</p>
                      </div>
                    )}

                    {section.placeholderType === "timer" && (
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-zinc-200/60 font-sans font-bold text-2xl text-zinc-900 animate-pulse">
                          24d Left
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-zinc-800">Trigger Threshold: 30 Days</p>
                          <p className="text-[11px] text-zinc-500 max-w-xs">Automated verification pings scheduled via Email & SMS</p>
                        </div>
                      </div>
                    )}

                    {section.placeholderType === "release" && (
                      <div className="w-full max-w-sm space-y-4 text-zinc-500 font-mono text-xs">
                        <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl space-y-3">
                          <p className="text-zinc-300 font-sans font-semibold text-xs">📬 Incoming Legacy Notice</p>
                          <div className="h-9 bg-black rounded border border-zinc-800 flex items-center justify-between px-3">
                            <span className="text-emerald-400 text-[11px] font-sans underline">secure-vault-access.link</span>
                            <span className="text-[10px] text-red-400 px-1.5 py-0.5 bg-red-950/40 border border-red-900/50 rounded">15 Days Left</span>
                          </div>
                        </div>
                        <p className="text-center text-[10px] text-zinc-500 font-sans">Vault key access permanently self-destructs on day 16</p>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          </section>
        ))}
      </div>

      {/* FAQ Dropdown Section (Entire Screen Width) */}
      <section className="w-full bg-zinc-50 border-b border-zinc-200/50 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Common Questions</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-950 hover:bg-zinc-50/50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span className={`text-xl text-zinc-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </button>
                  
                  <div className={`transition-all duration-200 ease-in-out ${
                    isOpen ? 'max-h-60 opacity-100 border-t border-zinc-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}>
                    <p className="px-6 py-5 text-sm text-zinc-600 leading-relaxed bg-zinc-50/20">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="mx-auto max-w-6xl px-6 py-24 w-full">
        <div className="rounded-2xl bg-zinc-900 px-8 py-16 text-center text-white shadow-xl">
          <h3 className="text-3xl font-bold tracking-tight">
            Ready to secure your digital legacy?
          </h3>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">
            Take 10 minutes today to ensure your data and assets aren't locked away forever.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-medium text-zinc-950 shadow-md transition-colors hover:bg-zinc-100"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-zinc-50 text-zinc-500">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 yourcyberwill. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="https://github.com" className="hover:text-zinc-900 transition-colors">GitHub (Open Source)</Link>
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
            <Link href="/security" className="hover:text-zinc-900 transition-colors">Security Specification</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
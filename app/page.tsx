"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  VaultIcon,
  ClockCountdownIcon,
  PaperPlaneTiltIcon,
  KeyIcon,
  WalletIcon,
  ArrowRightIcon,
  CaretDownIcon,
  EnvelopeOpenIcon,
  GithubLogoIcon,
  FingerprintIcon,
  LinkSimpleIcon,
  UsersFourIcon,
  CursorIcon,
  MailboxIcon,
  MicrosoftOutlookLogoIcon,
  PaperPlane,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Footer } from "./components/footer";

const HOW_IT_WORKS_SECTIONS = [
  {
    step: "01",
    title: "Build Your Encrypted Vault",
    subtitle: "Add passwords, crypto keys, files, or sensitive final notes.",
    description:
      "Your data is instantly transformed into unreadable ciphertext directly inside your browser using zero-knowledge AES-256 encryption. We never see your master passphrase, and your unencrypted data never touches the internet.",
    Icon: VaultIcon,
    badge: "Securely add your details",
    placeholderType: "vault",
    dark: false,
  },
  {
    step: "02",
    title: "Set Your Life Check-In Timer",
    subtitle: "Define your threshold and tell the system when to look for you.",
    description:
      "You decide how often you confirm you're okay — every 30 days, 90 days, or 6 months. As the timer nears its end, we email you constant reminders. A simple click will reset the counter.",
    Icon: ClockCountdownIcon,
    badge: "Check-in to confirm your alive and not incapacitated",
    placeholderType: "timer",
    dark: false,
  },
  {
    step: "03",
    title: "Automated, Expiring Release",
    subtitle: "Safe delivery to beneficiaries only if you completely disappear.",
    description:
      "If you go entirely silent and miss multiple consecutive safety check-ins, the switch triggers. Beneficiaries receive a secure, uniquely encrypted link to the vault — which self-destructs after 15 days to prevent permanent exposure.",
    Icon: PaperPlaneTiltIcon,
    badge: "Secure Delivery Protocol",
    placeholderType: "release",
    dark: true,
  },
] as const;

const FAQS = [
  {
    question: "Is yourcyberwill open source?",
    answer:
      "Yes, 100%. Our entire codebase, including the cryptographic vault architecture and automated trigger scripts, is publicly auditable on GitHub. We believe transparency is non-negotiable for digital inheritance.",
  },
  {
    question: "What happens if I just forget to click a check-in email?",
    answer:
      "We built an aggressive, multi-week fail-safe so you won't accidentally trigger your vault. We don't send one email — we ping you repeatedly via email, backup emails, SMS, and messaging apps over a grace period you define before anything reaches beneficiaries.",
  },
  {
    question: "Can your developers see the data I put inside my vault?",
    answer:
      "Absolutely not. We use zero-knowledge architecture. Your master password encrypts data locally on your device before it's backed up. Since we don't store or know your password, we hold no keys to read your data.",
  },
  {
    question: "How long do my beneficiaries have to download the vault data?",
    answer:
      "Once the dead man's switch triggers, beneficiaries receive an encrypted link. For security, it expires precisely 15 days after issuance. If not accessed, the secure pathway self-destructs to prevent stale links from sitting in inboxes indefinitely.",
  },
  {
    question: "What happens if your company goes out of business?",
    answer:
      "Because our platform functions as an open-source protocol in key areas, your automated checks are resilient. Our trust-backed operational runway guarantees data preservation, and users can opt into decentralized Web3 backups that run independently of our servers.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-zinc-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex items-center justify-between">
            <div className="w-[200px] h-12 select-none overflow-hidden flex justify-center items-center">
              <img className="min-w-full min-h-full object-cover scale-150" src="/textlogo.png" alt="yourcyberwill Logo" />
            </div>
            
          </div>
            </Link>
            <Link
              href="/login"
              
            >
              <Button>
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative dot grid + glow */}
        <div
          aria-hidden
          // className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.200)_1px,transparent_0)] [background-size:28px_28px] opacity-60 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_60%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-200/50 to-transparent blur-3xl"
        />

        <img className="h-100 left-[calc(50vw-200px)] opacity-50 absolute" src="/logo.png"/>

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-20">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mx-auto max-w-3xl"
          >
           

            <h1 className="mt-6 text-balance text-5xl leading-[1.1] tracking-tighter text-black sm:text-7xl">
              Ensure your digital assets reach the right people.{" "}
              <span className="bg-gradient-to-r from-zinc-600 to-zinc-300 bg-clip-text text-transparent">
                Automatically.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-zinc-600 sm:text-xl">
              Safely hand over passwords, bank accounts, files,
              crypto keys, final messages and wishes using a system that unlocks only if you
              go silent.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/login"
                // className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 text-base font-medium text-white shadow-lg shadow-zinc-950/10 transition-all hover:bg-zinc-800 active:scale-[0.98] sm:w-auto"
              >
                <Button className="h-12 px-8">
                  Protect Your Legacy
                <ArrowRightIcon
                  size={18}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5"
                />
                </Button>
              </Link>
              <Link
                href="#process-steps"
                // className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-7 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900 sm:w-auto"
              >
                <Button className="h-12 px-8" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-zinc-500">
              <span className="inline-flex items-center gap-3 ">
                <FingerprintIcon size={20} weight="duotone" /> Zero-knowledge encryption
              </span>
              <span className="hidden h-3.5 bg-zinc-200 sm:block" />
              <span className="inline-flex items-center gap-3">
                <GithubLogoIcon size={20} /> 100% open source
              </span>
              <span className="hidden h-3.5 bg-zinc-200 sm:block" />
              <span className="inline-flex items-center gap-3">
                <KeyIcon size={20} /> AES-256 client-side
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core mechanics */}
      <div id="process-steps" className="w-full">
        {HOW_IT_WORKS_SECTIONS.map((section, idx) => {
          const Icon = section.Icon;
          return (
            <section
              key={idx}
              className={`flex w-full items-center py-24 sm:py-32 ${
                section.dark
                  ? "bg-zinc-950 text-white"
                  : idx === 1
                  ? "bg-zinc-50 text-zinc-900 border-y border-zinc-100"
                  : "bg-white text-zinc-900"
              }`}
            >
              <div className="mx-auto w-full max-w-6xl px-6">
                <div
                  className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-20 ${
                    idx % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Text */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-120px" }}
                    className="space-y-6 lg:col-span-6"
                  >
                    <div className="flex items-center gap-5">
                      <span
                        className={`flex size-16 items-center justify-center rounded-xl ${
                          section.dark
                            ? "bg-white/10 text-white ring-1 ring-white/10"
                            : "bg-zinc-900 text-white"
                        }`}
                      >
                        <Icon size={40} weight="fill" />
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-3xl ${
                            section.dark ? "text-zinc-500" : "text-zinc-400"
                          }`}
                        >
                          Step — <span className="font-extrabold"  >{section.step}</span>
                        </span>
                        <span
                          className={`text-md mt-3 font-semibold ${
                            section.dark ? "text-zinc-300" : "text-zinc-700"
                          }`}
                        >
                          {section.badge}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-3xl tracking-tighter   sm:text-4xl">
                      {section.title}
                    </h2>
                    <p
                      className={`text-lg font-medium ${
                        section.dark ? "text-zinc-300" : "text-zinc-800"
                      }`}
                    >
                      {section.subtitle}
                    </p>
                    <p
                      className={`text-base leading-relaxed ${
                        section.dark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {section.description}
                    </p>
                  </motion.div>

                  {/* Visual */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-120px" }}
                    custom={1}
                    className="w-full lg:col-span-6"
                  >
                    <div
                      className={`relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden p-8 ${
                        section.dark
                          ? "border-zinc-800 bg-gradient-to-br from-zinc-900 to-black"
                          : "border-zinc-200 bg-zinc-100"
                      }`}
                    >
                      <div
                        aria-hidden
                        className={`absolute -bottom-12 -right-12 h-44 w-44 rounded-full blur-3xl ${
                          section.dark ? "bg-zinc-700/20" : "bg-zinc-300/30"
                        }`}
                      />

                      {/* Vault */}
                      {section.placeholderType === "vault" && (
                        <div className="relative w-full max-w-sm space-y-4 select-none">
                          <div className="space-y-2.5 border-zinc-200/80 bg-white p-10">
                          <CursorIcon className="size-12 absolute translate-x-79 translate-y-27" weight="fill"/> 
                            <p className="flex items-center gap-2 text-lg text-zinc-900">
                              <VaultIcon size={24} className="text-zinc-700" />
                              Encrypted Vault Input
                            </p>
                            <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500">
                              <KeyIcon size={15} weight="duotone" />
                              My Bitcoin Seed Phrase…
                            </div>
                            <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500">
                              <WalletIcon size={15} weight="duotone" />
                              Master Password Logins…
                            </div>
                          </div>
                          <p className="text-center text-[11px] text-zinc-500">
                            Encrypted before stored on our servers
                          </p>
                        </div>
                      )}

                      {/* Timer with animated ring */}
                      {section.placeholderType === "timer" && (
                        <div className="relative flex flex-col items-center gap-5 text-center w-full">
                          <div className="relative h-32 w-32">
                            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                              <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-zinc-200"
                              />
                              <motion.circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className="text-zinc-900"
                                strokeDasharray={2 * Math.PI * 52}
                                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                whileInView={{ strokeDashoffset: 2 * Math.PI * 300 * 0.2 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.4, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <ClockCountdownIcon size={22} className="text-zinc-500" />
                              <span className="mt-1 text-2xl font-bold text-zinc-900">3d</span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-600">
                                left
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 w-full px-4">
                            <p className="text-lg mb-6 text-zinc-800">
                              Stop false triggers with constant reminders
                            </p>
                            <div className="w-full px-5 py-3.5 flex items-center space-x-3 overflow-hidden rounded-full bg-zinc-900">
                               <PaperPlane className="size-7 text-white" />
                               <div className="flex flex-col items-start text-left text-white">
                                <div className="flex items-center space-x-3">
                                <div className="size-2 rounded-full animate-pulse bg-red-400"></div>
                                <div className="flex flex-col space-y-0.5  py-1  ">
                                  <h1 className="text-zinc-400 text-sm">From: notify@yourcyberwill.com</h1>
                                <h1 className="text-zinc-200 text-sm font-semibold">To: john23@gmail.com</h1>
                                  </div>
                                </div>
                                <span className="ml-3.5 font-bold">John, check-in now!</span>
                              </div>
                              
                               </div>
                          </div>
                        </div>
                      )}

                      {/* Release */}
                      {section.placeholderType === "release" && (
                        <div className="relative w-full max-w-sm space-y-4">
                          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl">
                            <p className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                              <EnvelopeOpenIcon size={16} weight="duotone" className="text-zinc-400" />
                              Incoming Legacy Notice
                            </p>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-black px-3 py-2.5">
                              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 underline">
                                <LinkSimpleIcon size={14} weight="bold" />
                                secure-vault-access.link
                              </span>
                              <span className="rounded-md border border-red-900/50 bg-red-950/40 px-1.5 py-0.5 text-[10px] text-red-400">
                                15 days left
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                              <UsersFourIcon size={15} weight="duotone" />
                              Delivered to 3 designated beneficiaries
                            </div>
                          </div>
                          <p className="text-center text-[11px] text-zinc-500">
                            Vault key access permanently self-destructs on day 16
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* FAQ */}
      <section className="w-full border-y border-zinc-200/60 bg-zinc-50 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Common Questions
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                    isOpen
                      ? "border-zinc-300 shadow-md"
                      : "border-zinc-200/80 shadow-sm hover:border-zinc-300"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-zinc-950 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-all duration-300 ${
                        isOpen ? "rotate-180 bg-zinc-900 text-white" : "bg-zinc-100"
                      }`}
                    >
                      <CaretDownIcon size={16} weight="bold" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-zinc-100 px-6 py-5 text-sm leading-relaxed text-zinc-600">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-16 text-center text-white shadow-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_40%,transparent_100%)]"
          />
          <div className="relative">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <ShieldCheckIcon size={24} weight="duotone" />
            </span>
            <h3 className="text-3xl font-bold tracking-tight">
              Ready to secure your digital legacy?
            </h3>
            <p className="mx-auto mt-4 max-w-md text-zinc-400">
              Take 10 minutes today to ensure your data and assets aren't locked away
              forever.
            </p>
            <Link
              href="/login"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-medium text-zinc-950 shadow-md transition-all hover:bg-zinc-100 active:scale-[0.98]"
            >
              Get Started Now
              <ArrowRightIcon
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
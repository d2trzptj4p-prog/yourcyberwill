"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  GithubLogoIcon,
  FingerprintIcon,
  LinkSimpleIcon,
  UsersFourIcon,
  PlayCircleIcon,
  StarIcon,
  LockKeyIcon,
  HeartIcon,
  FileLockIcon,
  BellRingingIcon,
  CheckCircleIcon,
  CurrencyBtcIcon,
  ChatCircleTextIcon,
  DeviceMobileIcon,
  EnvelopeOpenIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Footer } from "./components/footer";
import { User } from "@phosphor-icons/react/dist/ssr";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const TRUST_STATS = [
  { value: "AES-256", label: "Client-side encryption" },
  { value: "0", label: "Keys we can ever read" },
  { value: "100%", label: "Open source code" },
  { value: "15-day", label: "Self-destructing access links" },
] as const;

const REVIEWS = [
  {
    name: "Akash S",
    role: "Bitcoin holder and startup founder",
    quote:
      "I have quite a bit of money in my crypto account and I feel good knowing I have a plan for it to be passed on if something happens to me. The vault is easy to set up and gives me peace of mind. Would recommend!",
    avatar: "/review-1.png",
  },
  {
    name: "Scott P.",
    role: "A normal guy",
    quote:
      "i was very intriguied about the concept of how YourCyberWill works and I think it is something everyone should have. kinda like life-insurance haha! but yes, very easy to setup and understand how it works.",
    avatar: "/review-2.png",
  },
  {
    name: "Anonymous Reviewer",
    role: "Father of beautiful kids",
    quote:
      "You know, I wrote final letters to my kids, which feels weird ofcourse. But knowing they'll receive them — only if I'm truly gone — gives me a strange, real peace and obviously not leave them scrambling to try and reocover dumb passwords and important files. YourCyberWill just makes so much sense.",
    avatar: "/review-3.png",
  },
] as const;

const HOW_IT_WORKS_SECTIONS = [
  {
    step: "01",
    badge: "Securely add your details",
    title: "Build your encrypted vault",
    subtitle: "Add passwords, crypto keys, files, or final messages.",
    description:
      "Everything you add is turned into unreadable ciphertext inside your browser using zero-knowledge AES-256 encryption. We never see your master passphrase, and your unencrypted data never touches the internet.",
    Icon: VaultIcon,
    image: "/step-1.png",
    imageAlt: "Encrypted vault interface",
  },
  {
    step: "02",
    badge: "Confirm you're alive & well",
    title: "Set your life check-in timer",
    subtitle: "Decide how often you confirm you're okay.",
    description:
      "Choose your interval — every 30 days, 90 days, or 6 months. As the timer nears its end we ping you relentlessly across email, SMS, and messaging apps. A single click resets the counter. No accidental triggers, ever.",
    Icon: ClockCountdownIcon,
    image: "/step-2.png",
    imageAlt: "Check-in timer interface",
  },
  {
    step: "03",
    badge: "Secure delivery protocol",
    title: "Automated, expiring release",
    subtitle: "Delivered to your people only if you go fully silent.",
    description:
      "If you miss multiple consecutive check-ins, the switch triggers. Your beneficiaries receive a uniquely encrypted link to the vault — which self-destructs after 15 days to prevent permanent exposure.",
    Icon: PaperPlaneTiltIcon,
    image: "/step-3.png",
    imageAlt: "Secure delivery to beneficiaries",
  },
  {
    step: "04",
    badge: "Your tagged benificiaries get access",
    title: "They get the message",
    subtitle: "Your people can access the vault with an encrypted link",
    description:
      "The day comes and your timer goes over due. Our servers automatically send your people a link that self destructs after 15 days for security",
    Icon: EnvelopeOpenIcon,
    image: "/step-4.png",
    imageAlt: "Secure delivery to beneficiaries",
  },
] as const;

const FEATURES = [
  {
    Icon: FingerprintIcon,
    title: "Zero-knowledge by design",
    text: "Your master password encrypts data locally before anything is stored. We hold no keys — we literally cannot read your vault.",
  },
  {
    Icon: BellRingingIcon,
    title: "Check-in fail-safe",
    text: "Repeated reminders over email are sent to you as your timer ticks to zero. You will not trigger by accident.",
  },
  {
    Icon: CurrencyBtcIcon,
    title: "Built for crypto self-custody",
    text: "Seed phrases, hardware wallet PINs, and exchange logins are protected and recoverable — without ever exposing them to us.",
  },
  {
    Icon: FileLockIcon,
    title: "Files & final messages",
    text: "Store documents, letters, and wishes alongside credentials. Everything your people need, in one encrypted place.",
  },
  {
    Icon: GithubLogoIcon,
    title: "Fully open source",
    text: "Our cryptographic architecture and trigger scripts are publicly auditable on GitHub. Transparency is non-negotiable for inheritance.",
  },
  {
    Icon: UsersFourIcon,
    title: "Multiple beneficiaries",
    text: "Designate exactly who receives access, and what they can see. Different people, different vaults, different keys.",
  },
] as const;

const PRICING = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Everything you need to secure the essentials.",
    cta: "Start free",
    highlighted: false,
    features: [
      "1 password",
      "1 beneficiary",
      "1 note",
      "Limited file storage",
      "Email reminders",
    
    ],
  },
  {
    name: "Premium Monthly",
    price: "$16",
    period: "/month",
    description: "For serious holders who can't afford to lose access.",
    cta: "Go Pro",

    features: [
      "20 benificiaries",
      "50 passwords",
      "Lots of file storage",
      "50 notes",
      "Priority support",
      "Email reminders",
    ],
  },
  {
    name: "Premium Yearly",
    price: "$46",
    period: "/year",
    description: "For serious holders who can't afford to lose access.",
    cta: "Go Premium",
    features: [
      "20 benificiaries",
      "50 passwords",
      "Lots of file storage",
      "50 notes",
      "Priority support",
      "Email reminders",
    ],
  },
  {
    name: "Premium Lifetime",
    price: "$86",
    period: "one-time",
    description: "Pay once and get ease of mind",
    cta: "Go Premium",
        highlighted: true,
    features: [
      "20 benificiaries",
      "50 passwords",
      "Lots of file storage",
      "50 notes",
      "Priority support",
      "Email reminders",
    ],
  },
] as const;

const FAQS = [
  {
    question: "Do my beneficiaries need to know a secret password?",
    answer:
      "No, the whole point of YourCyberWill is to make it easy. Via a very intense encryption algorithm, on release day all your beneficiaries will need to do to access your vault is click the link that is automatically sent to them. Easy. Simple.",
  },
  {
    question: "How do my beneficiaries receive access to my vault?",
    answer:
      "An encrypted link with a token is sent to their email upon release day which allows them to access your read-only vault and download your sensitive information. The link self destructs in 15 days. After that - it's gone.",
  },
  {
    question: "How does the system know I am alive",
    answer:
      "You set a check in timer frequency (1 month, 3 month, a year), and after the limit is foregone and a danger buffer zone is passed, the vault access is shipped to ONLY your beneficiaries via an encrypted link. Checking in takes 2 seconds and resets your timer.",
  },
  {
    question: "How do you prevent false sends to my beneficiaries?",
    answer:
      "We offer an extra buffer zone when your check in timer passes, and very frequently ping when your timer is low via email to ensure you're alive and for you to check in.",
  },
  {
    question: "Is YourCyberWill open source?",
    answer:
      "Yes, 100%. Our entire codebase, including the cryptographic vault architecture and automated trigger scripts, is publicly auditable on GitHub at https://github.com/d2trzptj4p-prog/yourcyberwill. We believe transparency is non-negotiable for digital inheritance.",
  },
  {
    question: "Is YourCyberWill free?",
    answer:
      "YourCyberWill is completely free to use with all features. However Premium, which is extremely affordable, is a paid perk which allows you to upload more files, notes, passwords, and numbers of beneficiaries.",
  },
  {
    question: "What happens if I just forget to click a check-in email?",
    answer:
      "We built an aggressive, multi-week fail-safe so you won't accidentally trigger your vault. We don't send one email — we ping you repeatedly via email.",
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
] as const;

/* ------------------------------------------------------------------ */
/*  ANIMATION                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const router = useRouter();

  // Autoload / prefetch the login route so sign-in is instant.
  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      {/* ---------------------------------------------------------- */}
      {/* Header                                                     */}
      {/* ---------------------------------------------------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex h-12 w-48 items-center justify-center overflow-hidden select-none">
                <img
                  className="min-h-full min-w-full scale-150 object-cover"
                  src="/textlogo.png"
                  alt="yourcyberwill Logo"
                />
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              <Link href="#process-steps">
                <Button variant="ghost">How it works</Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost">Features</Button>
              </Link>
              <Link href="#pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="#faq">
                <Button variant="ghost">FAQ</Button>
              </Link>
              <Link href="/blogs">
                <Button variant="ghost">Blog</Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/* Hero — full-viewport hero.png background                    */}
      {/* ---------------------------------------------------------- */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        {/* Overlay keeps text readable and blends into the white page below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/45 via-white/40 to-white"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 z-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-200/40 to-transparent blur-3xl"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mx-auto max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 backdrop-blur">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 not-sm:hidden" />
               A tool every person with people who rely on them need — built by a team of ex-crypto security engineers
            </span>

            <h1 className="mt-6 text-balance text-5xl leading-[1.1] tracking-tighter text-black sm:text-7xl">
              Your digital information shouldn't die{" "}
              <span className="bg-gradient-to-r from-slate-600 to-slate-300 bg-clip-text text-transparent">
                with you.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
              Safely hand over passwords, bank accounts, files, crypto keys, and
              final messages to the people you choose — using an encrypted vault
              that unlocks{" "}
              <span className="font-semibold text-slate-900">only if you go silent.</span>
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/login" className="group w-full sm:w-auto">
                <Button className="h-14 w-full gap-2 px-8 sm:w-auto">
                  Protect Your Legacy for Free
                  <ArrowRightIcon
                    size={18}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              </Link>
              <Link href="#demo-video" className="w-full sm:w-auto">
                <Button variant="secondary" className="h-14 w-full gap-2 px-8 sm:w-auto">
                  <PlayCircleIcon className="size-6" weight="fill" />
                  Watch 5 min demo
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <FingerprintIcon size={18} weight="duotone" /> Zero-knowledge encryption
              </span>
              <span className="hidden h-3.5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-2">
                <GithubLogoIcon size={18} /> 100% open source
              </span>
              <span className="hidden h-3.5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-2">
                <KeyIcon size={18} /> AES-256 client-side
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Hero Video                                                 */}
      {/* ---------------------------------------------------------- */}
      <section id="demo-video" className="relative w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-4xl text-slate-900 mb-12 w-full text-center">The problem</h1>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className=""
          >
            <h1 className="mt-2 text-center text-2xl"> Traditional wills don't look after passwords, 2FA codes, crypto, seed phrases, important files, and last messages. <br/> 
            <br/>If something happens to you tomorrow, your life's work and digital assets are permanently locked away from your people.</h1>

          </motion.div>
          </div>
          </section>
      <section id="demo-video" className="relative w-full py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h1 className="text-4xl text-slate-900 mb-12 w-full text-center">How it works</h1>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/20"
          >
            <video
              className="aspect-video w-full"
              controls
              playsInline
              preload="metadata"
              poster="/herovideo-poster.png"
            >
              <source src="/hero.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>
          <p className="mt-4 text-center text-sm text-slate-500">
            See exactly how your vault is built, checked, and released — in under 5 minutes.
          </p>
          <p className="mt-4 text-center text-sm text-slate-500">
            Note: Our pricings have changed since the recording
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Trust stats bar                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="w-full border-slate-300 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 py-12 sm:grid-cols-4">
          {TRUST_STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={idx}
              className="flex flex-col items-center text-center"
            >
              <span className="text-3xl tracking-tight text-slate-950 sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-4 text-xs font-medium text-slate-500">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Reviews                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="w-full bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Loved by people with something to lose
            </span>
            <h2 className="mt-3 text-4xl tracking-tight text-slate-950 sm:text-4xl">
              Peace of mind, encrypted
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {REVIEWS.map((review, idx) => (
              <motion.figure
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={idx}
                className="flex flex-col justify-between rounded-3xl border-2 border-slate-200/80 p-8"
              >
                <div>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} size={20} weight="fill" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-pretty text-sm leading-relaxed text-slate-700">
                    "{review.quote}"
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-500">
                    <User className="size-5"/>
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                    <p className="text-xs text-slate-500">{review.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* How it works — steps with image placeholders               */}
      {/* ---------------------------------------------------------- */}
      <div id="process-steps" className="w-full">
        <div className="mx-auto max-w-6xl px-6 pt-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            How it works
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl tracking-tight text-slate-950 sm:text-5xl">
            Three steps and 10 minutes between you and a worry-free legacy
          </h2>
        </div>

        {HOW_IT_WORKS_SECTIONS.map((section, idx) => {
          const Icon = section.Icon;
          const dark = idx === 2;
          return (
            <section
              key={idx}
              className={`flex w-full items-center py-20 sm:py-28 ${
                dark
                  ? "bg-zinc-950 text-white"
                  : idx === 1
                  ? "bg-slate-50 text-slate-900"
                  : "bg-white text-slate-900"
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
                          dark
                            ? "bg-white/10 text-white ring-1 ring-white/10"
                            : "bg-slate-200 text-black"
                        }`}
                      >
                        <Icon size={36} weight="fill" />
                      </span>
                      <div className="flex flex-col">
                        <span className={`text-3xl ${dark ? "text-slate-300" : "text-slate-800"}`}>
                          Step — {section.step}
                        </span>
                        <span
                          className={`mt-2 text-sm font-semibold ${
                            dark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {section.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-3xl tracking-tighter sm:text-4xl">{section.title}</h3>
                    <p className={`text-lg font-medium ${dark ? "text-slate-300" : "text-zinc-800"}`}>
                      {section.subtitle}
                    </p>
                    <p className={`text-base leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      {section.description}
                    </p>
                  </motion.div>

                  {/* Image placeholder — swap src for your own screenshot */}
                  <motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-120px" }}
  custom={1}
  className="w-full lg:col-span-6"
>
  {/* REMOVED h-120 so the container adapts to the image height */}
  <div
    className={`group relative flex items-center justify-center rounded-3xl overflow-hidden ${
      dark ? "border-slate-800 bg-slate-900" : "border-2 p-4 border-slate-200 bg-white"
    }`}
  >
    <img
      src={section.image}
      alt={section.title || "Section asset"}
      className="w-full h-auto block rounded-2xl" // w-full and h-auto ensures 100% visibility
    />
    
    {/* Fallback shown only if image is missing */}
    <div
      className={`absolute inset-0 hidden flex-col items-center justify-center gap-3 ${
        dark ? "text-slate-600" : "text-slate-400"
      }`}
    >
      <Icon size={48} weight="duotone" />
      <span className="text-sm font-medium">
        Place your image at <code>{section.image}</code>
      </span>
    </div>
  </div>
</motion.div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Features grid                                              */}
      {/* ---------------------------------------------------------- */}
      <section id="features" className="w-full border-y border-slate-100 bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Why yourcyberwill
            </span>
            <h2 className="mt-3 text-3xl tracking-tight text-slate-950 sm:text-5xl">
              A secure digital life insurance
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.Icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  custom={idx}
                  className="rounded-2xl border-slate-200/80 bg-slate-100 p-6 transition-shadow hover:bg-slate-200"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon size={22} weight="fill" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Security highlight                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="w-full bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-slate-50/60 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="space-y-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                <LockKeyIcon size={16} weight="fill" /> Security first
              </span>
              <h2 className="text-3xl tracking-tight text-slate-950 sm:text-4xl">
                We can't read your data — and that's the whole point.
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                Encryption happens on your device, before anything leaves it. Your
                master passphrase never reaches our servers, so even under subpoena
                or breach, your vault stays unreadable.
              </p>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={1}
              className="space-y-4"
            >
              {[
                { Icon: FingerprintIcon, text: "Zero-knowledge AES-256 encryption" },
                { Icon: DeviceMobileIcon, text: "Encrypts locally, in your browser" },
                { Icon: ChatCircleTextIcon, text: "Check-in reminders" },
                { Icon: GithubLogoIcon, text: "Publicly auditable open-source code" },
                { Icon: HeartIcon, text: "Start for free" },
              ].map((item, i) => {
                const Icon = item.Icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon size={18} weight="duotone" />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{item.text}</span>
                    <CheckCircleIcon size={18} weight="fill" className="ml-auto text-emerald-500" />
                  </li>
                );
              })}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FAQ                                                        */}
      {/* ---------------------------------------------------------- */}
      <section id="faq" className="w-full border-y border-slate-200/60 bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Common Questions
            </span>
            <h2 className="mt-3 text-3xl tracking-tight text-slate-950 sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-2xl !cursor-pointer hover:bg-slate-100 bg-white transition-all ${
                    isOpen
                      ? "border-slate-300 shadow-md"
                      : "border-slate-200/80 shadow-sm hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-950 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen ? "rotate-180 bg-zinc-900 text-white" : "bg-slate-100 text-slate-400"
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
                        <p className="border-t border-slate-100 px-6 py-5 text-sm leading-relaxed text-slate-600">
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

      {/* ---------------------------------------------------------- */}
      {/* Final CTA                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-20 text-center text-white shadow-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_40%,transparent_100%)]"
          />
          <div className="relative">
          <div className="w-full justify-center flex">
            <img className="w-45 invert mb-4" src={"/logo.png"}/>
          </div>
            <h3 className="text-3xl tracking-tight sm:text-4xl">
              Ready to secure your digital legacy?
            </h3>
            <p className="mx-auto mt-6 max-w-md text-slate-300">
              Take 10 minutes today to make sure your data and assets aren't locked
              away forever. Quick and easy.
            </p>
            <Link
              href="/login"
              className="group mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-base font-medium text-slate-950 shadow-md transition-all hover:bg-slate-100 active:scale-[0.98]"
            >
              Get Started Now
              <ArrowRightIcon
                size={18}
                weight="bold"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              Free to start · No card required · Open source
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Pricing — placed just above the footer                     */}
      {/* ---------------------------------------------------------- */}
      <section id="pricing" className="w-full border-t border-slate-100 bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Pricing
            </span>
            <h2 className="mt-3 text-3xl tracking-tight text-slate-950 sm:text-5xl">
              Simple plans for total peace of mind
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {PRICING.map((plan, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                custom={idx}
                className={`relative flex flex-col rounded-3xl p-8 ${
                  plan.highlighted
                    ? "border-slate-900 bg-zinc-900 text-white shadow-xl"
                    : "border-slate-200/80 bg-white text-slate-900"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-200 px-4 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 shadow">
                    Most popular
                  </span>
                )}

                <h3
                  className={`text-xl ${
                    plan.highlighted ? "text-white" : "text-slate-950"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlighted ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl tracking-tight">{plan.price}</span>
                  <span
                    className={`text-sm font-medium ${
                      plan.highlighted ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircleIcon
                        size={18}
                        weight="fill"
                        className={`mt-0.5 shrink-0 ${
                          plan.highlighted ? "text-emerald-400" : "text-emerald-500"
                        }`}
                      />
                      <span
                        className={plan.highlighted ? "text-slate-200" : "text-slate-700"}
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-2">
                  <Link href="/login" className="group block">
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className={`h-12 w-full gap-2 ${
                        plan.highlighted ? "bg-white text-slate-950 hover:bg-slate-100" : ""
                      }`}
                    >
                      {plan.cta}
                      <ArrowRightIcon
                        size={18}
                        weight="bold"
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-slate-500">
            All premium plans (Monthly, Yearly, Lifetime) are the exact same
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
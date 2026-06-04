"use client"

import Link from "next/link";
import { GithubLogoIcon, House, Shield, FileText, Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-black text-zinc-300 print:hidden">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="select-none">
              <div className="w-62 sm:-translate-x-5 h-14 overflow-hidden flex justify-center items-center">
                <img
                  className="min-w-full invert min-h-full object-cover scale-150"
                  src="/textlogo.png"
                  alt="YourCyberWill Logo"
                />
              </div>
            </Link>
            <p className="text-sm text-zinc-400 text-center md:text-left max-w-xs leading-relaxed">
              Securely manage and protect your digital legacy for the people who matter most.
            </p>
            <a
              href="https://github.com/d2trzptj4p-prog/yourcyberwill"
              target="_blank"
              rel="noopener noreferrer"
              // className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors duration-150"
            >
              <Button variant="secondary">
                <GithubLogoIcon className="w-4 h-4" />
              Open Source on GitHub
              </Button>
            </a>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigation
            </h3>
            <nav className="flex flex-col items-center md:items-start gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <House className="w-4 h-4" />
                Main Page
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-150"
              >
                <FileText className="w-4 h-4" />
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Get in Touch
            </h3>
            <a
              href="mailto:support@yourcyberwill.com"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-150"
            >
              <Envelope className="w-4 h-4" />
              support@yourcyberwill.com
            </a>
            <p className="text-sm text-zinc-500 text-center md:text-left">
              We typically respond within 24 hours.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {currentYear} YourCyberWill. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors duration-150">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors duration-150">
              Terms
            </Link>
            <a
              href="https://github.com/d2trzptj4p-prog/yourcyberwill"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors duration-150"
            >
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
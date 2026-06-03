import Link from "next/link";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-slate-200 py-8 px-4 print:hidden">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        
        {/* Brand and Copyright Statement */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex items-center justify-between">
            <div className="w-[200px] h-14 select-none overflow-hidden flex justify-center items-center">
              <img className="min-w-full min-h-full object-cover scale-150" src="/textlogo.png" alt="yourcyberwill Logo" />
            </div>
            
          </div>
            </Link>
          <p>© {currentYear} YourCyberWill. All rights reserved.</p>
        </div>

        {/* Navigation Assets & Support Registry */}
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
          <Link 
            href="/" 
            className="hover:text-zinc-900 transition-colors duration-150"
          >
            Main Page
          </Link>
          <Link 
            href="/privacy" 
            className="hover:text-zinc-900 transition-colors duration-150"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/terms" 
            className="hover:text-zinc-900 transition-colors duration-150"
          >
            Terms of Service
          </Link>
          <a 
            href="mailto:support@yourcyberwill.com" 
            className="text-zinc-600 hover:text-zinc-900 text-lg font-medium transition-colors duration-150 flex items-center gap-1"
          >
            support@yourcyberwill.com
          </a>
        </nav>

      </div>
    </footer>
  );
}
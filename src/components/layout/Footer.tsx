import Logo from "../ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background py-8 md:py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={24} showText={true} textSize="text-sm" />
            <span className="text-xs text-text-secondary self-end mb-0.5">
              © {currentYear} DevTrack. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary font-medium">
            <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#score-engine" className="hover:text-text-primary transition-colors">Score Engine</a>
            <a href="#wrapped" className="hover:text-text-primary transition-colors">Wrapped</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1">
              <span>GitHub API Documentation</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

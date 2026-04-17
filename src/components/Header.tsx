import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Menu, X, Sparkles, Languages } from "lucide-react";

interface HeaderProps {
  mode?: "normal" | "playground";
}

const Header = ({ mode = "normal" }: HeaderProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems =
    mode === "normal"
      ? [
          { href: "#about", label: "nav.about" },
          { href: "#skills", label: "nav.skills" },
          { href: "#experience", label: "nav.experience" },
          { href: "#contact", label: "nav.contact" },
        ]
      : [];

  const handleAnchorClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.getElementById(href.slice(1));
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [menuOpen]);

  const basePath = import.meta.env.BASE_URL || "/profile/";
  const switchHref =
    mode === "normal" ? `${basePath}playground/` : basePath;
  const switchLabel = mode === "normal" ? "Playground" : "Portfolio";
  const isDark = mode === "playground";

  return (
    <header
      className={`fixed top-0 w-full z-50 ${isDark ? "bg-black/40 backdrop-blur-sm border-b border-white/5" : "bg-background/80 backdrop-blur-md border-b border-border/50"}`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center justify-between">
          <a
            href={basePath}
            className={`text-lg font-semibold italic transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-primary hover:text-primary/80"}`}
          >
            dy
          </a>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleAnchorClick(item.href); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t(item.label)}
              </a>
            ))}
            <a
              href={switchHref}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? "text-white/60 hover:text-white" : "text-primary/70 hover:text-primary"}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {switchLabel}
            </a>
            <button
              onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
              className={`p-2 rounded-md transition-colors ${isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              <Languages className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-2" ref={menuRef}>
            <button
              onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
              className={`p-2.5 rounded-md transition-colors ${isDark ? "text-white/60 active:text-white active:bg-white/10" : "text-muted-foreground active:text-foreground active:bg-accent"}`}
            >
              <Languages className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-2.5 rounded-md transition-colors ${isDark ? "text-white/60 active:text-white active:bg-white/10" : "text-muted-foreground active:text-foreground active:bg-accent"}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Dropdown panel */}
            {menuOpen && (
              <div className={`absolute top-full right-4 mt-1 w-44 rounded-lg border shadow-lg overflow-hidden ${isDark ? "bg-black/90 border-white/10" : "bg-card border-border"}`}>
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => { e.preventDefault(); handleAnchorClick(item.href); }}
                    className={`block px-4 py-3 text-sm transition-colors ${isDark ? "text-white/70 active:bg-white/10" : "text-foreground active:bg-accent"}`}
                  >
                    {t(item.label)}
                  </a>
                ))}
                <a
                  href={switchHref}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm transition-colors ${isDark ? "text-white/70 active:bg-white/10" : "text-primary/70 active:bg-accent"}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {switchLabel}
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

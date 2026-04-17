import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import Header from "./Header";
import { useState, useEffect, lazy, Suspense } from "react";

const Scene3D = lazy(() => import("./Scene3D"));

function PlaygroundContent() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const basePath = import.meta.env.BASE_URL || "/profile/";

  return (
    <div className="min-h-screen bg-[#1a1518] relative">
      <Header mode="playground" />

      {/* Aquarium scene */}
      <div className="fixed inset-0 z-0">
        {mounted && (
          <Suspense
            fallback={
              <div className="w-full h-full bg-[#1a1518] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-400/50 border-t-transparent animate-spin" />
              </div>
            }
          >
            <Scene3D />
          </Suspense>
        )}
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-[max(1rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] sm:pb-6">
          <div className="pointer-events-auto flex flex-col items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={basePath}
              className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg bg-blue-500/15 text-blue-200/80 border border-blue-400/15 text-sm sm:text-xs font-medium hover:bg-blue-500/25 active:bg-blue-500/30 transition-colors backdrop-blur-sm"
            >
              {t("nav.about")} →
            </a>
            <a
              href="https://github.com/o6ivp"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-sm sm:text-xs text-white/60 hover:border-white/20 active:bg-white/10 transition-colors"
            >
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300/50 border border-blue-400/10 font-mono">
              Rust + WebAssembly
            </span>
            <span className="text-[10px] text-white/20 hidden sm:inline">
              click the light · move cursor to attract fish
            </span>
            <span className="text-[10px] text-white/20 sm:hidden">
              tap the light · touch to attract fish
            </span>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundApp() {
  return (
    <LanguageProvider>
      <PlaygroundContent />
    </LanguageProvider>
  );
}

import { useLanguage } from "../contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
        <div className="flex-1 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t("about.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("about.description.1")}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t("about.description.2")}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t("about.description.3")}
          </p>
        </div>

        <div className="shrink-0 w-48 h-48 md:w-56 md:h-56 self-center md:self-start">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-28 h-28 md:w-32 md:h-32 text-primary/60"
              fill="currentColor"
            >
              <rect x="20" y="10" width="80" height="55" rx="4" opacity="0.3" />
              <rect x="24" y="14" width="72" height="44" rx="2" opacity="0.5" />
              <rect x="45" y="65" width="30" height="5" rx="1" opacity="0.3" />
              <rect x="35" y="70" width="50" height="3" rx="1" opacity="0.2" />
              <text x="36" y="42" fontSize="8" fontFamily="monospace" opacity="0.7">
                {"<code/>"}
              </text>
              <circle cx="90" cy="90" r="18" opacity="0.15" />
              <circle cx="90" cy="90" r="12" opacity="0.1" />
              <path d="M84 90 L88 94 L96 86" stroke="currentColor" fill="none" strokeWidth="2" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

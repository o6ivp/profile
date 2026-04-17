import { useLanguage } from "../contexts/LanguageContext";

interface ExperienceItem {
  roleKey: string;
  companyKey: string;
  periodKey: string;
  descriptionKey: string;
}

const experiences: ExperienceItem[] = [
  {
    roleKey: "experience.ante.role",
    companyKey: "experience.ante.company",
    periodKey: "experience.ante.period",
    descriptionKey: "experience.ante.description",
  },
  {
    roleKey: "experience.levitt.role",
    companyKey: "experience.levitt.company",
    periodKey: "experience.levitt.period",
    descriptionKey: "experience.levitt.description",
  },
  {
    roleKey: "experience.anw.role",
    companyKey: "experience.anw.company",
    periodKey: "experience.anw.period",
    descriptionKey: "experience.anw.description",
  },
  {
    roleKey: "experience.yst.role",
    companyKey: "experience.yst.company",
    periodKey: "experience.yst.period",
    descriptionKey: "experience.yst.description",
  },
  {
    roleKey: "experience.shinonome.role",
    companyKey: "experience.shinonome.company",
    periodKey: "experience.shinonome.period",
    descriptionKey: "experience.shinonome.description",
  },
  {
    roleKey: "experience.attendance.role",
    companyKey: "experience.attendance.company",
    periodKey: "experience.attendance.period",
    descriptionKey: "experience.attendance.description",
  },
  {
    roleKey: "experience.research.role",
    companyKey: "experience.research.company",
    periodKey: "experience.research.period",
    descriptionKey: "experience.research.description",
  },
];

const Experience = () => {
  const { t } = useLanguage();

  return (
    <section id="experience">
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 sm:mb-10">
        {t("experience.title")}
      </h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-primary/30 hidden sm:block" />

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="flex gap-6 sm:gap-8">
              {/* Year circle */}
              <div className="shrink-0 hidden sm:flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {t(exp.periodKey)}
                  </span>
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 rounded-xl bg-card border border-border p-5 sm:p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-1 sm:hidden">
                  <span className="text-xs font-semibold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full">
                    {t(exp.periodKey)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mt-1 sm:mt-0">
                  {t(exp.roleKey)}
                </h3>
                <p className="text-sm text-primary mt-0.5">
                  {t(exp.companyKey)}
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {t(exp.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

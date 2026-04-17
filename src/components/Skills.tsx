import { useLanguage } from "../contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

const SkillCard = ({
  title,
  skills,
}: {
  title: string;
  skills: string[];
}) => (
  <div className="rounded-xl bg-card border border-border p-5 sm:p-6">
    <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge
          key={skill}
          variant="secondary"
          className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/25 transition-colors text-xs px-3 py-1"
        >
          {skill}
        </Badge>
      ))}
    </div>
  </div>
);

const Skills = () => {
  const { t } = useLanguage();

  const skillGroups = [
    {
      titleKey: "skills.frontend",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "TanStack Query",
        "MUI",
        "ag-Grid",
        "ECharts",
        "Vite",
      ],
    },
    {
      titleKey: "skills.backend",
      skills: [
        "Python",
        "FastAPI",
        "Flask",
        "Go",
        "Gin",
        "Playwright",
        "Selenium",
        "OpenAPI",
      ],
    },
    {
      titleKey: "skills.data",
      skills: [
        "dbt",
        "Snowflake",
        "BigQuery",
        "Redshift",
        "Dataform",
        "Streamlit",
        "pandas",
        "polars",
        "PostgreSQL",
        "MySQL",
      ],
    },
    {
      titleKey: "skills.infrastructure",
      skills: [
        "GCP",
        "AWS",
        "Docker",
        "Terraform",
        "GitHub Actions",
        "Firebase",
        "Cloudflare",
      ],
    },
  ];

  return (
    <section id="skills">
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 sm:mb-10">
        {t("skills.title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {skillGroups.map((group) => (
          <SkillCard
            key={group.titleKey}
            title={t(group.titleKey)}
            skills={group.skills}
          />
        ))}
      </div>
    </section>
  );
};

export default Skills;

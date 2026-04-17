import { useLanguage } from "../contexts/LanguageContext";
import { Mail, Github, Linkedin } from "lucide-react";

const Contact = () => {
  const { t } = useLanguage();

  const links = [
    {
      href: "mailto:squiffer9@duck.com",
      icon: Mail,
      label: "Email",
    },
    {
      href: "https://github.com/o6ivp",
      icon: Github,
      label: "GitHub",
    },
    {
      href: "https://linkedin.com/in/daigo-yamashita-ab6235328",
      icon: Linkedin,
      label: "LinkedIn",
    },
  ];

  return (
    <section id="contact">
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
        {t("contact.title")}
      </h2>
      <p className="text-muted-foreground mb-8">{t("contact.message")}</p>
      <div className="flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
};

export default Contact;

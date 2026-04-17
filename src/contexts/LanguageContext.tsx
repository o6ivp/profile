import React, { createContext, useContext, useState } from "react";

type Language = "en" | "ja";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.experience": "Experience",
    "nav.contact": "Contact",

    "about.title": "About Me",
    "about.description.1":
      "Software engineer working across frontend, backend, and data infrastructure. Day-to-day I build BI platforms and e-commerce data systems using React, Go, Python, and dbt on Snowflake / BigQuery / Redshift.",
    "about.description.2":
      "I typically work on multiple client projects at the same time, sometimes solo, sometimes as part of a team.",
    "about.description.3":
      "Open to remote work and international collaboration.",

    "skills.title": "Skills & Technologies",
    "skills.frontend": "Frontend",
    "skills.backend": "Backend",
    "skills.data": "Data Engineering",
    "skills.infrastructure": "Infrastructure",

    "experience.title": "Experience",

    "experience.ante.role": "Data Platform Engineer (Solo)",
    "experience.ante.company": "Data Analytics Platform",
    "experience.ante.period": "2025–",
    "experience.ante.description":
      "dbt modeling, ingestion pipelines, and Streamlit dashboards on Snowflake.",

    "experience.levitt.role": "Full-Stack Developer (Team)",
    "experience.levitt.company": "Hospitality BI Platform",
    "experience.levitt.period": "2025",
    "experience.levitt.description":
      "Worked as part of a team on a hospitality BI platform — frontend, backend, scraping, Dataform, and reporting. React + FastAPI + BigQuery.",

    "experience.anw.role": "Data & Integration Engineer (Team)",
    "experience.anw.company": "E-Commerce Data Platform",
    "experience.anw.period": "2025–",
    "experience.anw.description":
      "Built data pipelines connecting EC malls, logistics systems, and analytics dashboards.",

    "experience.yst.role": "Full-Stack Developer (Solo)",
    "experience.yst.company": "Brand Analytics Platform",
    "experience.yst.period": "2025–26",
    "experience.yst.description":
      "Built a brand analytics platform from scratch — ingestion, dbt transformations, and a dashboard frontend.",

    "experience.shinonome.role": "Full-Stack Developer",
    "experience.shinonome.company": "Cloud Infrastructure Platform",
    "experience.shinonome.period": "2025",
    "experience.shinonome.description":
      "Designed and built an inquiry system end-to-end with Clean Architecture on Next.js + Go/Gin. Also handled Terraform-based infra management.",

    "experience.attendance.role": "Full-Stack Developer",
    "experience.attendance.company": "Attendance Management System",
    "experience.attendance.period": "2024",
    "experience.attendance.description":
      "Serverless shift scheduling and attendance app on AWS (Lambda, API Gateway, Cognito, DynamoDB). React frontend, Go backend.",

    "experience.research.role": "Researcher",
    "experience.research.company": "National Defense Academy — Graduation Research",
    "experience.research.period": "2023",
    "experience.research.description":
      "Built a drowsiness prevention system with Raspberry Pi, multiple sensors, and OpenCV. Real-time detection using machine learning.",

    "contact.title": "Contact",
    "contact.message":
      "Open to remote work and international collaboration. Feel free to reach out.",
  },
  ja: {
    "nav.about": "概要",
    "nav.skills": "スキル",
    "nav.experience": "経歴",
    "nav.contact": "連絡先",

    "about.title": "About Me",
    "about.description.1":
      "フロントエンド・バックエンド・データ基盤を横断して開発しています。普段はBIプラットフォームやECのデータ連携が多く、React、Go、Python、dbt（Snowflake / BigQuery / Redshift）あたりを使っています。",
    "about.description.2":
      "複数のクライアント案件を並行して進めていて、ソロのこともチームのこともあります。",
    "about.description.3": "リモートワーク・国際的な協業の機会を歓迎します。",

    "skills.title": "Skills & Technologies",
    "skills.frontend": "フロントエンド",
    "skills.backend": "バックエンド",
    "skills.data": "データエンジニアリング",
    "skills.infrastructure": "インフラ",

    "experience.title": "Experience",

    "experience.ante.role": "データ基盤エンジニア（単独）",
    "experience.ante.company": "データ分析プラットフォーム",
    "experience.ante.period": "2025–",
    "experience.ante.description":
      "dbtモデリング・取り込みパイプライン・StreamlitダッシュボードをSnowflake上で構築・運用。",

    "experience.levitt.role": "フルスタック開発者（チーム）",
    "experience.levitt.company": "ホスピタリティBIプラットフォーム",
    "experience.levitt.period": "2025",
    "experience.levitt.description":
      "ホスピタリティBIプラットフォームでFE・BE・スクレイピング・Dataform・レポートの5領域を横断して開発。React + FastAPI + BigQuery構成。",

    "experience.anw.role": "データ＆連携エンジニア（チーム）",
    "experience.anw.company": "ECデータプラットフォーム",
    "experience.anw.period": "2025–",
    "experience.anw.description":
      "ECモール・物流システム・分析ダッシュボードの間をつなぐデータパイプラインと連携基盤を構築。",

    "experience.yst.role": "フルスタック開発者（単独）",
    "experience.yst.company": "ブランド分析プラットフォーム",
    "experience.yst.period": "2025–26",
    "experience.yst.description":
      "ブランド分析プラットフォームをゼロから一人で構築。データ取り込みからdbt変換、ダッシュボードまで。",

    "experience.shinonome.role": "フルスタック開発者",
    "experience.shinonome.company": "クラウドインフラ管理プラットフォーム",
    "experience.shinonome.period": "2025",
    "experience.shinonome.description":
      "Next.js + Go/Ginのプラットフォームで、Clean Architectureに沿ったお問い合わせ機能の設計・実装。Terraformによるインフラ管理も担当。",

    "experience.attendance.role": "フルスタック開発者",
    "experience.attendance.company": "勤怠管理システム",
    "experience.attendance.period": "2024",
    "experience.attendance.description":
      "シフト生成・勤怠管理アプリをAWSサーバーレス構成（Lambda / API Gateway / Cognito / DynamoDB）で設計・開発。React + Go。",

    "experience.research.role": "リサーチャー",
    "experience.research.company": "防衛大学校 — 卒業研究",
    "experience.research.period": "2023",
    "experience.research.description":
      "Raspberry Piと複数センサー、OpenCVを使った居眠り防止システムを開発。機械学習でリアルタイム検知。",

    "contact.title": "連絡先",
    "contact.message":
      "リモートワークや国際的な協業の機会を歓迎します。お気軽にご連絡ください。",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof navigator !== "undefined" && navigator.language.startsWith("ja")) {
      return "ja";
    }
    return "en";
  });

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;

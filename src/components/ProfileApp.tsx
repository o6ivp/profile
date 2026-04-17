import { LanguageProvider } from "../contexts/LanguageContext";
import Header from "./Header";
import About from "./About";
import Skills from "./Skills";
import Experience from "./Experience";
import Contact from "./Contact";
import Footer from "./Footer";

export default function ProfileApp() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-20 sm:space-y-28 py-8 sm:py-12">
              <About />
              <Skills />
              <Experience />
              <Contact />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

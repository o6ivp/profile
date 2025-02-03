import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Research from "./components/Research";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const App = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 px-4 sm:px-6 lg:px-8">
          {/* Adjust container width */}
          <div className="max-w-7xl mx-auto">
            {/* Control spacing between sections */}
            <div className="space-y-12 sm:space-y-16 py-8 sm:py-12">
              <About />
              <Skills />
              <Projects />
              <Research />
              <Contact />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default App;

import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import CaseStudies from "./components/CaseStudies";
import Playground from "./components/Playground";
import Experience from "./components/Experience";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import CTA from "./components/CTA";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <CaseStudies />
        <Playground />
        <Experience />
        <Testimonials />
        <About />
        <CTA />
      </main>
    </>
  );
}

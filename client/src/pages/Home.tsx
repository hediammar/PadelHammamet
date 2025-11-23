import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ScrollExpandHero from '../components/home/ScrollExpandHero';
import ArenaSpecs from '../components/home/ArenaSpecs';
import FidelityExplainer from '../components/home/FidelityExplainer';
import ServicesAcademy from '../components/home/ServicesAcademy';
import Leaderboard from '../components/home/Leaderboard';
import { LogoCarousel } from '../components/ui/logo-carousel';
import heroVideo from '../assets/file.mp4';
import arveaLogo from '../assets/arvea.png';
import babolatLogo from '../assets/babolat.png';
import orcaLogo from '../assets/orca.png';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Hero Section with Scroll Expansion */}
      <ScrollExpandHero
        mediaType="video"
        mediaSrc={heroVideo}
        title="Don'tJustPlay. Level Up."
        scrollToExpand="Scroll to expand"
        textBlend={false}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Reserve your padel court in seconds. Experience the best facilities
            with our seamless booking system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/booking"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold text-lg hover:shadow-lg hover:shadow-[rgba(0,255,136,0.5)] transition-all duration-200 glow-green"
            >
              Book Now
            </Link>
            <button className="px-8 py-4 rounded-xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-xl">
              Learn More
            </button>
          </motion.div>
        </div>
      </ScrollExpandHero>

      {/* Tech Specs - The Arena */}
      <ArenaSpecs />

      {/* Fidelity Explainer */}
      <FidelityExplainer />

      {/* Services & Academy */}
      <ServicesAcademy />

      {/* Live Leaderboard */}
      <Leaderboard />

      {/* Logo Carousel */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LogoCarousel
            columnCount={2}
            logos={[
              {
                id: 1,
                name: 'Arvea',
                img: arveaLogo,
              },
              {
                id: 2,
                name: 'Babolat',
                img: babolatLogo,
              },
              {
                id: 3,
                name: 'Orca',
                img: orcaLogo,
              },
            ]}
          />
        </div>
      </section>
    </motion.div>
  );
};

export default Home;


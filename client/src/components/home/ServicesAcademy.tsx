import { motion } from 'framer-motion';
import { Award, Star, Users, Briefcase } from 'lucide-react';

const coaches = [
  {
    name: 'Haythem Salah',
    title: 'Head Coach',
    rating: 4.9,
    experience: '3+ years',
    specialty: 'Advanced Techniques',
    image: '👨‍🏫',
  },
  {
    name: 'Gadour Asmi',
    title: 'Performance Coach',
    rating: 4.8,
    experience: '3+ years',
    specialty: 'Strategy & Tactics',
    image: '👩‍🏫',
  },
 
];

const ServicesAcademy = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* The Academy Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-green">
              The Academy
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Learn from the best. Train with professional coaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coaches.map((coach, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-[var(--color-padel-green)]/30 transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center text-5xl mb-4 glow-green">
                    {coach.image}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{coach.name}</h3>
                  <p className="text-[var(--color-padel-green)] text-sm font-semibold mb-2">{coach.title}</p>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(coach.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                    <span className="text-white/60 text-sm ml-2">{coach.rating}</span>
                  </div>
                  <p className="text-white/60 text-sm mb-1">{coach.experience}</p>
                  <p className="text-white/40 text-xs">{coach.specialty}</p>
                </div>
                <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green">
                  Book Private Lesson
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="glass-strong rounded-3xl p-12 border-2 border-[var(--color-padel-green)]/30 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-padel-green)]/20 to-[var(--color-electric-blue)]/20 blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-[var(--color-dark-bg)]" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gradient-green">
                    Corporate & Private Events
                  </h2>
                </div>
                <p className="text-white/80 text-lg mb-6">
                  Perfect for team building, corporate outings, and private celebrations. 
                  Our facilities accommodate groups of all sizes with professional service.
                </p>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2 text-white/60">
                    <Users className="w-5 h-5" />
                    <span>Groups up to 50</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/60">
                    <Award className="w-5 h-5" />
                    <span>Custom Packages</span>
                  </div>
                </div>
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-semibold text-lg hover:shadow-lg hover:shadow-[var(--color-padel-green)]/50 transition-all duration-200 glow-green">
                  Inquire Now
                </button>
              </div>
              <div className="hidden md:block">
                <div className="glass rounded-2xl p-8 text-center">
                  <Users className="w-24 h-24 mx-auto text-[var(--color-padel-green)] mb-4 opacity-50" />
                  <p className="text-white/60 text-sm">Team Building Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesAcademy;


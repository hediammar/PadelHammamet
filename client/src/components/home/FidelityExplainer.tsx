import { motion } from 'framer-motion';
import { Calendar, Trophy, Gift } from 'lucide-react';

const steps = [
  {
    icon: Calendar,
    title: 'Book & Play',
    description: 'Every match earns you +100 XP',
    number: '1',
    gradient: 'from-[var(--color-padel-green)] to-[var(--color-electric-blue)]',
  },
  {
    icon: Trophy,
    title: 'Climb the Ranks',
    description: 'Unlock Pro Status & Levels',
    number: '2',
    gradient: 'from-[var(--color-electric-blue)] to-purple-500',
  },
  {
    icon: Gift,
    title: 'Redeem Rewards',
    description: 'Discounts & Exclusive Gear',
    number: '3',
    gradient: 'from-purple-500 to-[var(--color-padel-green)]',
  },
];

const FidelityExplainer = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-green">
            How to Level Up
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Earn XP, unlock rewards, and become a Padel Hammamet champion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Progress Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-padel-green)] via-[var(--color-electric-blue)] to-purple-500 opacity-30" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative z-10"
              >
                <div className="glass rounded-2xl p-8 border border-white/10 hover:border-[var(--color-padel-green)]/30 transition-all duration-300 text-center">
                  {/* Step Number Badge */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-padel-green)] to-[var(--color-electric-blue)] text-[var(--color-dark-bg)] font-bold text-2xl mb-6 glow-green">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6`}>
                    <Icon className="w-10 h-10 text-[var(--color-dark-bg)]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>

                  {/* Arrow (Mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <svg
                          className="w-6 h-6 text-[var(--color-padel-green)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FidelityExplainer;


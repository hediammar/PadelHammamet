import { motion } from 'framer-motion';
import { Building2, Ruler, Eye, ShoppingBag, Sparkles } from 'lucide-react';

const specs = [
  {
    icon: Building2,
    title: 'Mondo Supercourt Turf',
    description: 'Professional-grade playing surface engineered for optimal performance and durability',
    size: 'large',
    gradient: 'from-[var(--color-padel-green)] to-[var(--color-electric-blue)]',
    iconGradient: 'from-emerald-400 to-cyan-400',
    glowColor: 'rgba(0, 255, 136, 0.3)',
  },
  {
    icon: Eye,
    title: 'Panoramic Glass Walls',
    description: '360° viewing experience with crystal-clear visibility from every angle',
    size: 'medium',
    gradient: 'from-[var(--color-electric-blue)] to-purple-500',
    iconGradient: 'from-cyan-400 to-purple-400',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    icon: Ruler,
    title: '12m Ceiling Height',
    description: 'Maximum playability with professional tournament-standard dimensions',
    size: 'medium',
    gradient: 'from-purple-500 to-pink-500',
    iconGradient: 'from-purple-400 to-pink-400',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    icon: ShoppingBag,
    title: 'Pro-Shop on Site',
    description: 'Premium equipment & gear available for purchase and rental',
    size: 'large',
    gradient: 'from-pink-500 to-[var(--color-padel-green)]',
    iconGradient: 'from-pink-400 to-emerald-400',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
];

const ArenaSpecs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-padel-green)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-electric-blue)]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--color-padel-green)] via-[var(--color-electric-blue)] to-purple-400 bg-clip-text text-transparent">
            The Arena
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            World-class facilities designed for the ultimate padel experience
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-transparent via-[var(--color-padel-green)] to-transparent mx-auto"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group relative"
              >
                {/* Card */}
                <div className="
                  relative h-full
                  rounded-3xl p-8
                  bg-gradient-to-br from-white/5 to-white/[0.02]
                  backdrop-blur-xl
                  border border-white/10
                  shadow-2xl
                  transition-all duration-500
                  hover:border-[var(--color-padel-green)]/40
                  hover:shadow-[0_20px_60px_-15px_rgba(0,255,136,0.3)]
                  overflow-hidden
                ">
                  {/* Animated gradient overlay on hover */}
                  <div className={`
                    absolute inset-0
                    bg-gradient-to-br ${spec.gradient}
                    opacity-0 group-hover:opacity-10
                    transition-opacity duration-500
                    rounded-3xl
                  `}></div>

                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 0 40px ${spec.glowColor}`,
                    }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon container */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`
                        w-20 h-20 rounded-2xl
                        bg-gradient-to-br ${spec.gradient}
                        flex items-center justify-center
                        mb-6
                        shadow-lg
                        group-hover:shadow-xl
                        transition-shadow duration-300
                      `}
                    >
                      <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-[var(--color-padel-green)] transition-colors duration-300">
                      {spec.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 text-base leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                      {spec.description}
                    </p>

                    {/* Decorative line */}
                    <div className="mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[var(--color-padel-green)] to-transparent transition-all duration-500"></div>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ArenaSpecs;


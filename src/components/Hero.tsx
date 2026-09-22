import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

import type { SiteContent } from '../data/siteContent';
import { useLanguage } from '../i18n';

export default function Hero({ content }: { content: SiteContent['hero'] }) {
  const { language, t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero noise-bg">
      {/* Ambient circles */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-ora-300/20 rounded-full blur-3xl float-animation" />
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-ora-400/15 rounded-full blur-3xl float-animation" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-ora-200 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-charcoal-700 tracking-wide uppercase">
                {language === 'he' ? t('newCollection') : content.eyebrow}
              </span>
            </motion.div>

 <motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.3 }}
  /* التعديل: حذفنا كلاس text-balance وكلاس tracking-tight تماماً وأضفنا w-full text-right */
  className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-palestine-bold leading-[1.5] sm:leading-[1.4] text-right w-full block overflow-visible"
>
  <span className="text-charcoal-900 block whitespace-nowrap">{content.titleLine1}</span>
  <span className="gradient-text block mt-2 whitespace-nowrap">{content.titleLine2}</span>
  <span className="text-charcoal-900 block mt-2 whitespace-nowrap">{content.titleLine3}</span>
</motion.h1>
            <motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.5 }}
  /* التعديل: تفعيل التوجيه لليمين dir="rtl" مع leading-relaxed لراحة العين وحذف التضييق */
  className="mt-6 text-base sm:text-lg text-charcoal-500 leading-relaxed max-w-xl text-right font-medium"
  dir="rtl"
>
 {language === 'he' ? t('heroDescription') : content.description}
</motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              {/* زر Explore Collection المحدث باللون الأسود والموشن التفاعلي للكروسيل */}
              <motion.a
                href="#collections"
                whileHover="hover"
                whileTap="tap"
                className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white/55 text-black font-semibold text-sm rounded-full border border-black/10 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 cursor-pointer"
              >
                <span className="!text-black">{language === 'he' ? t('browseCollection') : content.primaryButton}</span>
                
                {/* السهم يتحرك لليمين بنعومة فيزيائية عند الـ hover */}
                <motion.div
                  variants={{
                    hover: { x: 5 },
                    tap: { x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-4 h-4 !text-black" />
                </motion.div>
              </motion.a>

              {/* زر Watch Lookbook الخاص بالريلز والموشن */}
              <motion.a
                href="https://www.instagram.com/ora.limited/reels/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover="hover"
                whileTap="tap"
                className="group inline-flex items-center gap-3 py-3.5 text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors duration-300 cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute animate-ping inline-flex h-8 w-8 rounded-full bg-ora-400/40 opacity-75"></span>
                  
                  <motion.div
                    variants={{
                      hover: { scale: 1.15, rotate: 12 },
                      tap: { scale: 0.9 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="relative z-10 w-10 h-10 rounded-full border-2 border-ora-400 flex items-center justify-center bg-transparent group-hover:bg-ora-400 group-hover:border-ora-400 transition-all duration-300"
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-charcoal-700 group-hover:text-white transition-colors" />
                  </motion.div>
                </div>

                <motion.span
                  variants={{
                    hover: { x: 4, color: "#a98a6a" },
                    tap: { x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {language === 'he' ? t('lookbook') : content.secondaryButton}
                </motion.span>
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-12 flex items-center gap-8 sm:gap-12"
            >
              {[
                { value: '1k+', label: language === 'he' ? t('happyCustomers') : 'Happy Customers' },
                { value: '50+', label: language === 'he' ? t('uniqueDesigns') : 'Unique Designs' },
                { value: '4.9★', label: language === 'he' ? t('averageRating') : 'Average Rating' },
              ].map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="text-xl sm:text-2xl font-bold text-charcoal-900">{stat.value}</div>
                  <div className="text-xs text-charcoal-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Hero Images */}
          <div className="relative flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-72 sm:w-80 lg:w-96 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-charcoal-900/20">
                <img
                  src={content.image}
                  alt="ORA Fashion - Premium contemporary streetwear"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/30 to-transparent" />
              </div>

              {/* Secondary Image */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="absolute -left-16 sm:-left-20 bottom-12 w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-ora-50"
              >
                <img
                  src={content.secondaryImage}
                  alt="ORA Fashion - Elegant studio lookbook"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
                className="absolute -right-4 sm:right-0 top-8 glass rounded-2xl px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                    <span className="text-white text-xs">✦</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">Premium Quality</div>
                    <div className="text-[10px] text-charcoal-400">100% Organic Fabrics</div>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-charcoal-400 uppercase">Scroll Down</span>
      </motion.div>
    </section>
  );
}
import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import type { SiteContent } from '../data/siteContent';
import { useLanguage } from '../i18n';

// مصفوفة مميزات علامة ORA التجارية
const featuresData = [
  {
    id: '01',
    title: 'أقمشة فاخرة مستدامة',
    description: 'ننتقي خاماتنا بعناية من مصادر مستدامة لنضمن لكِ راحة تدوم طويلاً، مع الحفاظ على مرونة النسيج والـمظهر العصري المتقن.'
  },
  {
    id: '02',
    title: 'تصميم يحمل هوية',
    description: 'تخرج قطعنا عن النمطية والتقليد؛ حيث يحمل كل تصميم حكاية فريدة وتفاصيل فنية تبرز حضورك الواثق والمتميز.'
  },
  {
    id: '03',
    title: 'صديقة لأقصى الأدلة',
    description: 'حلول عملية ومستدامة تلائم تفاصيل يومك المزدحم، لتتحركي بخطى مريحة وثابتة تجمع بين الأناقة المطلقة والعملية الجذابة.'
  }
];

export default function Features({ content }: { content: SiteContent['story'] }) {
  const { ref, inView } = useScrollReveal(0.05);
  const { language, t } = useLanguage();
  const featureTitleKeys = ['featureTitle1', 'featureTitle2', 'featureTitle3'];
  const featureDescriptionKeys = ['featureDescription1', 'featureDescription2', 'featureDescription3'];

  return (
    <section id="features" ref={ref} dir={language === 'en' ? 'ltr' : 'rtl'} className="py-24 bg-[#faf8f5]/88 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* القسم الأيمن — معرض الصور الجمالي المتداخل لـ ORA */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-80 sm:w-96 aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
              <img 
                src={content.image}
                alt="ORA Fashion detail" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* الصورة الفرعية المتداخلة بالأمام */}
            <motion.div 
              initial={{ opacity: 0, x: 40, y: 30 }}
              animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -bottom-10 right-4 lg:-right-8 w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#faf8f5]"
            >
              <img 
                src={content.secondaryImage}
                alt="ORA Studio lookbook" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* القسم الأيسر — النصوص والعناوين المحدثة باللون الزيتي المكتوب #2E3220 */}
          <div className={language === 'en' ? 'text-left' : 'text-right'} dir={language === 'en' ? 'ltr' : 'rtl'}>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="text-xs font-bold uppercase tracking-widest text-[#a98a6a]"
            >
            {language === 'ar' ? content.eyebrow : t('storyEyebrow')}
            </motion.span>
            
      <motion.h2 
  initial={{ opacity: 0, y: 20 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ delay: 0.1 }}
  /* قمنا بتصغير الأحجام قليلاً وإضافة leading-tight لمنع تداخل الحروف */
  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-2 mb-4 text-[#2E3220] leading-tight"
>
  {language === 'ar' ? content.title : t('storyTitle')} <br />
  <span className="gradient-text">{language === 'ar' ? content.highlight : t('storyHighlight')}</span>
</motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base leading-relaxed mb-12 text-[#2E3220]/75"
            >
              {language === 'ar' ? content.description : t('storyDescription')}
            </motion.p>

            {/* مصفوفة المميزات الرأسية */}
            <div className="space-y-8">
              {content.features.map((feat, index) => (
                <motion.div 
                  key={`${feat.title}-${index}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-start gap-4 group"
                >
                  {/* الدائرة الرقمية أو الأيقونة الملونة */}
                  <div className="w-10 h-10 rounded-full border border-[#2E3220]/20 flex items-center justify-center font-bold text-xs shrink-0 text-[#2E3220] group-hover:bg-[#2E3220] group-hover:text-white transition-all duration-300">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* النصوص الفرعية بلونك المحدد [#2E3220] */}
                  <div>
                    <h3 className="font-bold text-base mb-1 transition-colors text-[#2E3220] group-hover:text-[#a98a6a]">{language === 'ar' ? feat.title : t(featureTitleKeys[index] || 'featureTitle1')}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#2E3220]/70">
                      {language === 'ar' ? feat.description : t(featureDescriptionKeys[index] || 'featureDescription1')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
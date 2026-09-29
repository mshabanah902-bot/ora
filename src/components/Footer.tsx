const myLogo = new URL('/my-logo.png', import.meta.url)
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../i18n';
export default function Footer() {
  // روابط حساباتك الشخصية الرسمية والمحدثة بدقة
  const instagramUrl = "https://www.instagram.com/ora.limited?igsi=MWYybnhkb3Z0bmQ5cQ%3D%3D&utm_source=qr";
  const facebookUrl = "https://www.facebook.com/share/1JcJAo8Eut/?mibextid=wwXIfr";
  const tiktokUrl = "https://www.tiktok.com/@ora.limited?_r=1&_t=ZS-993Xbdraj5O"; 
  const { language, t } = useLanguage();
  const [policy, setPolicy] = useState<'delivery' | 'exchange' | 'returns' | null>(null);
  useEffect(() => {
    const openPolicy = (event: Event) => {
      const requested = (event as CustomEvent<string>).detail;
      if (requested === 'delivery' || requested === 'exchange' || requested === 'returns') setPolicy(requested);
    };
    document.addEventListener('ora:open-policy', openPolicy);
    return () => document.removeEventListener('ora:open-policy', openPolicy);
  }, []);
  const policyContent = {
    delivery: { title: t('shippingPolicy'), text: t('shippingPolicyText') },
    exchange: { title: t('exchangePolicy'), text: t('exchangePolicyText') },
    returns: { title: t('returnPolicy'), text: t('returnPolicyText') },
  };

  return (
    <footer className="bg-[#2E3220]/95 py-10 w-full">
      {/* الحاوية الرئيسية في المنتصف تماماً */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-6">
        
        <img src={myLogo.toString()} alt="ORA Logo" className="h-20 w-auto object-contain" />

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <button type="button" onClick={() => setPolicy('delivery')} className="hover:text-ora-300">{t('shippingPolicy')}</button>
          <button type="button" onClick={() => setPolicy('exchange')} className="hover:text-ora-300">{t('exchangePolicy')}</button>
          <button type="button" onClick={() => setPolicy('returns')} className="hover:text-ora-300">{t('returnPolicy')}</button>
        </div>

        {/* قسم أيقونات التواصل الاجتماعي الثلاثة في المنتصف */}
        <div className="flex items-center justify-center gap-4 mt-2">
          
          {/* 1. أيقونة إنستغرام */}
          <a 
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/40 text-white hover:text-ora-400 hover:border-ora-400 transition-all duration-300 hover:-translate-y-1"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect width="20" height="20" x="2" y="2" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          {/* 2. أيقونة فيسبوك */}
          <a 
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/40 text-white hover:text-ora-400 hover:border-ora-400 transition-all duration-300 hover:-translate-y-1"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.67.33-1 1-1Z" />
            </svg>
          </a>

          {/* 3. أيقونة تيك توك المحدثة بالرابط الجديد */}
          <a 
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/40 text-white hover:text-ora-400 hover:border-ora-400 transition-all duration-300 hover:-translate-y-1"
            aria-label="TikTok"
          >
            {/* كود مخصص لأيقونة تيك توك لتظهر بشكل متناسق ودائري */}
            <svg 
              className="w-5 h-5 fill-current" 
              viewBox="0 0 24 24" 
              xmlns="http://w3.org"
            >
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.03 1.63 4.14 1.13 1.2 2.7 1.91 4.33 2.01v3.83c-1.39-.07-2.77-.52-3.92-1.33-.31-.22-.61-.47-.88-.74v6.62c0 1.95-.53 3.88-1.55 5.48-1.57 2.44-4.32 3.94-7.23 3.96-2.88.02-5.63-1.42-7.14-3.87-1.48-2.39-1.52-5.45-.11-7.88 1.34-2.32 3.82-3.81 6.51-3.92V12.3c-1.12.08-2.2.66-2.85 1.57-.73 1.02-.74 2.41-.05 3.44.64.97 1.76 1.58 2.94 1.54 1.24-.04 2.37-.8 2.83-1.95.14-.37.21-.76.21-1.16V0h.15z"/>
            </svg>
          </a>

        </div>

        {/* حقوق النشر والتأليف أسفل الصفحة */}
        <p className="text-xs text-white/40 mt-4">
          &copy; {new Date().getFullYear()} ORA. {t('rights')}
        </p>

      </div>
      {policy && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" onClick={() => setPolicy(null)}>
        <div role="dialog" aria-modal="true" aria-labelledby="policy-title" dir={language === 'en' ? 'ltr' : 'rtl'} className="w-full max-w-md rounded-xl bg-[#faf8f5] p-6 text-start text-charcoal-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 id="policy-title" className="text-xl font-bold">{policyContent[policy].title}</h2><button type="button" onClick={() => setPolicy(null)} aria-label={t('close')} className="rounded-full p-2 hover:bg-ora-100"><X size={19} /></button></div>
          <p className="leading-8 text-charcoal-600">{policyContent[policy].text}</p>
        </div>
      </div>}
    </footer>
  );
}
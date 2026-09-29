const myLogo = new URL('/my-logo.png', import.meta.url).href;
import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, X, ArrowRight } from 'lucide-react';
import type { Product as StoreProduct } from '../data/products';
import type { WishlistItem } from '../App';
import { translateProductColor, useLanguage } from '../i18n';

const navLinks = [
  { key: 'collections', href: '#collections' },
  { key: 'arrivals', href: '#products' },
  { key: 'about', href: '#features' },
];

const policyLinks = [
  { id: 'delivery', label: 'Shipping Policy' },
  { id: 'exchange', label: 'Exchange Policy' },
  { id: 'returns', label: 'Return Policy' },
] as const;

type SearchResult = {
  id: number;
  name: string;
  nameAr: string;
  color: string;
  image: string;
};

export default function Navbar({ products, onCartOpen, cartCount, wishlist, onToggleWishlist }: { products: StoreProduct[]; onCartOpen: () => void; cartCount: number; wishlist: WishlistItem[]; onToggleWishlist: (product: StoreProduct, color: string, size: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  // حالات شريط البحث التفاعلي الجديد
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(0);
  const [wishlistPulse, setWishlistPulse] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const pulseCart = () => setCartPulse((count) => count + 1);
    const pulseWishlist = () => setWishlistPulse((count) => count + 1);
    document.addEventListener('ora:cart-added', pulseCart);
    document.addEventListener('ora:wishlist-added', pulseWishlist);
    return () => {
      document.removeEventListener('ora:cart-added', pulseCart);
      document.removeEventListener('ora:wishlist-added', pulseWishlist);
    };
  }, []);

  // إغلاق القائمة عند النقر خارج صندوق البحث لحفظ انسيابية التصفح
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && event.target instanceof Node && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // دالة المعالجة والمطابقة الفورية بناءً على الاسم العربي، الإنجليزي، أو اللون
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const normalizedQuery = query.toLocaleLowerCase();
    const filtered = products.flatMap((product) => {
      const colors = product.colors?.length ? product.colors : [{ name: product.colorName || '', image: product.image }];
      return colors.map((color) => ({ id: product.id, name: product.name, nameAr: product.nameAr, color: color.name, image: color.image || product.image }))
        .filter((item) => [item.name, item.nameAr, item.color, product.category].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)));
    });
    setSearchResults(filtered);
  };
  const cycleLanguage = () => {
    const languages = ['ar', 'en', 'he'] as const;
    setLanguage(languages[(languages.indexOf(language) + 1) % languages.length]);
  };
  const languageLabel = language === 'ar' ? 'ع' : language === 'en' ? 'EN' : 'עב';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#faf8f5] shadow-lg shadow-black/10 py-2 sm:py-3' : 'bg-[#2E3220] py-2 sm:py-5'
        }`}
      >
        <div className={`border-b px-4 py-1.5 transition-colors duration-300 sm:px-6 lg:px-8 ${scrolled ? 'border-charcoal-200/70' : 'border-white/10'}`}>
          <div className={`mx-auto flex max-w-7xl items-center justify-center gap-3 overflow-x-auto whitespace-nowrap text-[10px] transition-colors duration-300 sm:gap-5 sm:text-xs ${scrolled ? 'text-black' : 'text-white/85'}`} dir="ltr">
            {policyLinks.map((policy) => <button type="button" key={policy.id} onClick={() => document.dispatchEvent(new CustomEvent('ora:open-policy', { detail: policy.id }))} className="shrink-0 transition-colors hover:text-ora-500">{policy.label}</button>)}
          </div>
        </div>
        <div dir={language === 'en' ? 'ltr' : 'rtl'} className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-500 ${
          scrolled ? 'text-charcoal-900' : 'text-white'
        }`}>
          
<a href="#home" aria-label={t('home')}><img src={myLogo} alt="ORA Logo" className={`h-12 w-auto max-w-[92px] object-contain transition-[filter] duration-500 sm:h-20 sm:max-w-[120px] ${scrolled ? 'ora-logo-scrolled' : ''}`} /></a>
          {/* روابط التصفح للشاشات الكبيرة */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 line-draw pb-1 ${
                  scrolled ? 'text-charcoal-900 hover:text-ora-600' : 'text-white hover:text-ora-400'
                }`}
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          {/* الأزرار اليمنى شاملة صندوق البحث التفاعلي والذكي */}
          <div className="flex items-center gap-1 sm:gap-3 relative" ref={searchRef}>
            
            {/* حاوية البحث التفاعلية الممتدة */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('searchPlaceholder')}
                    dir={language === 'en' ? 'ltr' : 'rtl'}
                    className="max-w-[58vw] px-4 py-1.5 ms-2 text-sm bg-charcoal-100/90 text-charcoal-900 placeholder-charcoal-400 border border-charcoal-200 rounded-full focus:outline-none focus:ring-1 focus:ring-ora-500 shadow-sm"
                  />
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if(searchOpen) { setSearchQuery(''); setSearchResults([]); }
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300"
                aria-label={t('searchAria')}
              >
                {searchOpen ? <X className="w-4 h-4 text-ora-600" /> : <Search className="w-4 h-4" />}
              </button>

              {/* القائمة الصغيرة المنبثقة لعرض صور وفئات البحث التفاعلي */}
              <AnimatePresence>
                {searchOpen && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute top-12 left-0 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-charcoal-100 overflow-hidden z-50 p-2"
                  >
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {searchResults.map((item, index) => (
                        <a
                          key={index}
                          href="#products"
                          onClick={() => {
                            document.dispatchEvent(new CustomEvent('ora:select-product', { detail: item.id }));
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-ora-100/60 transition-colors duration-200 group"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-16 object-cover rounded-lg shadow-sm border border-charcoal-100"
                          />
                          <div className="flex-1 text-right" dir={language === 'en' ? 'ltr' : 'rtl'}>
                            <div className="text-sm font-bold text-charcoal-900 group-hover:text-ora-700 transition-colors">
                              {language === 'ar' ? item.nameAr : item.name}
                            </div>
                            <div className="text-xs text-charcoal-400 mt-0.5">
                              {t('color')}: {translateProductColor(item.color, language)}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-charcoal-300 group-hover:text-ora-500 transform rotate-180 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button data-wishlist-target onClick={() => setWishlistOpen((open) => !open)} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300" aria-label={t('wishlist')}>
                <motion.span key={wishlistPulse} initial={{ scale: 1, rotate: 0 }} animate={wishlistPulse ? { scale: [1, 1.55, 0.78, 1.18, 1], rotate: [0, -24, 16, -8, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.82, ease: 'easeOut' }}>
                  <Heart className={`w-4 h-4 ${wishlist.length ? 'fill-red-500 text-red-500' : ''}`} />
                </motion.span>
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </button>
              <AnimatePresence>
                {wishlistOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed top-20 inset-x-3 mx-auto w-auto max-w-sm max-h-[calc(100dvh-6rem)] overflow-y-auto lg:top-24 lg:left-auto lg:right-4 lg:mx-0 lg:w-80 lg:max-w-none rounded-xl bg-white p-3 text-[#1e1f22] shadow-xl border border-charcoal-100 z-[70]" dir={language === 'en' ? 'ltr' : 'rtl'}>
                  <h3 className="font-bold text-[#1e1f22] mb-2">{t('wishlist')}</h3>
                  {!wishlist.length ? <p className="text-sm text-[#60646c] py-5 text-center">{t('emptyWishlist')}</p> : <div className="max-h-72 overflow-y-auto">{wishlist.map((product, index) => <div key={product.id}><div className="flex items-center gap-2 rounded-xl p-1.5 text-[#1e1f22] hover:bg-ora-100"><img src={product.image} alt={product.name} className="w-10 h-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-bold text-sm text-[#1e1f22] truncate">{language === 'ar' ? product.nameAr : product.name}</p><p className="text-xs text-[#60646c]">{t('color')}: {product.selectedColor || product.colorName}</p><p className="text-xs text-[#60646c]">{t('size')}: {product.selectedSize || '—'}</p><p className="text-xs font-bold text-[#1e1f22] mt-1">{t('price')}: ₪{product.price}</p></div><button onClick={() => onToggleWishlist(product, product.selectedColor || product.colorName, product.selectedSize || '')} className="p-2 text-red-500 hover:scale-110 transition-transform" aria-label={t('removeWishlist')}><Heart size={16} className="fill-current" /></button></div>{index < wishlist.length - 1 && <div className="h-px w-full my-3 bg-[#a98a6a]" aria-hidden="true" />}</div>)}</div>}
                </motion.div>}
              </AnimatePresence>
            </div>

            <button onClick={cycleLanguage} className="h-9 min-w-9 rounded-full border border-current/30 px-2 text-[10px] font-bold hover:bg-charcoal-100/20 transition-colors" aria-label={`${t('changeLanguage')}: ${languageLabel}`} title={t('changeLanguage')}>{languageLabel}</button>

            {/* زر سلة التسوق */}
            <button
              data-cart-target
              onClick={onCartOpen}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300"
              aria-label={t('openCart')}
            >
              <motion.span key={`cart-pulse-${cartPulse}`} initial={{ y: 0, rotate: 0, scale: 1 }} animate={cartPulse ? { y: [0, -12, 0, -4, 0], rotate: [0, -22, 18, -8, 0], scale: [1, 1.38, 0.95, 1.12, 1] } : { y: 0, rotate: 0, scale: 1 }} transition={{ duration: 0.82, ease: 'easeOut' }}>
                <ShoppingBag className="w-5 h-5" />
              </motion.span>
              <motion.span key={`cart-count-${cartCount}`} initial={{ scale: 0.65 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }} className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 ${scrolled ? 'bg-black' : 'bg-ora-600'} text-white text-[10px] font-bold rounded-full flex items-center justify-center`}>{cartCount}</motion.span>
            </button>
            
          </div>
        </div>
      </motion.nav>
    </>
  );
}
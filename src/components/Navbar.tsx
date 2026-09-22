const myLogo = new URL('/my-logo.png', import.meta.url).href;
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, X, ArrowRight } from 'lucide-react';
import type { Product as StoreProduct } from '../data/products';
import type { WishlistItem } from '../App';
import { useLanguage } from '../i18n';

const navLinks = [
  { label: 'Collections', href: '#collections' },
  { label: 'New Arrivals', href: '#products' },
  { label: 'About', href: '#features' },
];

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
  const { language, setLanguage, t } = useLanguage();
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-lg shadow-black/5 py-2 sm:py-3' : 'bg-[#2E3220] py-2 sm:py-5'
        }`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-500 ${
          scrolled ? 'text-charcoal-900' : 'text-white'
        }`}>
          
<img src={myLogo} alt="ORA Logo" className="h-14 sm:h-20 w-auto max-w-[120px] object-contain" />
          {/* روابط التصفح للشاشات الكبيرة */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 line-draw pb-1 ${
                  scrolled ? 'text-charcoal-900 hover:text-ora-600' : 'text-white hover:text-ora-400'
                }`}
              >
                {language === 'he' ? (link.label === 'Collections' ? t('collections') : link.label === 'New Arrivals' ? t('arrivals') : t('about')) : link.label}
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
                    placeholder={language === 'he' ? t('searchPlaceholder') : 'ابحث باسم الموديل أو اللون...'}
                    dir="rtl"
                    className="px-4 py-1.5 ml-2 text-sm bg-charcoal-100/90 text-charcoal-900 placeholder-charcoal-400 border border-charcoal-200 rounded-full focus:outline-none focus:ring-1 focus:ring-ora-500 shadow-sm"
                  />
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if(searchOpen) { setSearchQuery(''); setSearchResults([]); }
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300"
                aria-label={language === 'he' ? t('searchAria') : 'Search'}
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
                          <div className="flex-1 text-right" dir="rtl">
                            <div className="text-sm font-bold text-charcoal-900 group-hover:text-ora-700 transition-colors">
                              {item.nameAr} ({item.name})
                            </div>
                            <div className="text-xs text-charcoal-400 mt-0.5">
                              لون: {item.color}
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
              <button onClick={() => setWishlistOpen((open) => !open)} className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300" aria-label={language === 'he' ? t('wishlist') : 'المفضلة'}>
                <Heart className={`w-4 h-4 ${wishlist.length ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </button>
              <AnimatePresence>
                {wishlistOpen && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed top-20 left-3 right-3 w-auto max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-6rem)] overflow-y-auto lg:absolute lg:top-12 lg:left-auto lg:right-0 lg:w-80 lg:max-w-none lg:max-h-none rounded-2xl bg-white p-3 text-[#1e1f22] shadow-xl border border-charcoal-100 z-[70]" dir="rtl">
                  <h3 className="font-bold text-[#1e1f22] mb-2">{language === 'he' ? 'מועדפים' : 'المفضلة'}</h3>
                  {!wishlist.length ? <p className="text-sm text-[#60646c] py-5 text-center">{language === 'he' ? t('emptyWishlist') : 'لم تضف أي منتج بعد'}</p> : <div className="max-h-72 overflow-y-auto">{wishlist.map((product, index) => <div key={product.id}><div className="flex items-center gap-2 rounded-xl p-1.5 text-[#1e1f22] hover:bg-ora-100"><img src={product.image} alt={product.name} className="w-10 h-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-bold text-sm text-[#1e1f22] truncate">{product.nameAr}</p><p className="text-xs text-[#60646c]">{t('color')}: {product.selectedColor || product.colorName}</p><p className="text-xs text-[#60646c]">{t('size')}: {product.selectedSize || '—'}</p><p className="text-xs font-bold text-[#1e1f22] mt-1">{t('price')}: ₪{product.price}</p></div><button onClick={() => onToggleWishlist(product, product.selectedColor || product.colorName, product.selectedSize || '')} className="p-2 text-red-500 hover:scale-110 transition-transform" aria-label={language === 'he' ? t('removeWishlist') : 'إزالة من المفضلة'}><Heart size={16} className="fill-current" /></button></div>{index < wishlist.length - 1 && <div className="h-px w-full my-3 bg-[#a98a6a]" aria-hidden="true" />}</div>)}</div>}
                </motion.div>}
              </AnimatePresence>
            </div>

            <button onClick={() => setLanguage(language === 'ar' ? 'he' : 'ar')} className="w-9 h-9 rounded-full border border-current/30 text-xs font-bold hover:bg-charcoal-100/20 transition-colors" aria-label="تغيير اللغة">{language === 'ar' ? 'א' : 'ع'}</button>

            {/* زر سلة التسوق */}
            <button
              onClick={onCartOpen}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-charcoal-100/20 transition-colors duration-300"
              aria-label={language === 'he' ? t('openCart') : 'فتح السلة'}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-ora-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
            </button>
            
          </div>
        </div>
      </motion.nav>
    </>
  );
}
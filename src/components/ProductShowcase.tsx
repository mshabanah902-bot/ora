import { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import type { Product } from '../data/products';
import type { WishlistItem } from '../App';
import { useLanguage } from '../i18n';

const getColorHex = (name: string) => {
  const color = name.trim().toLocaleLowerCase();
  const colors: Record<string, string> = {
    'ابيض': '#f5f2ed', 'أبيض': '#f5f2ed', 'white': '#f5f2ed',
    'اسود': '#171717', 'أسود': '#171717', 'black': '#171717',
    'كحلي': '#1d2d4b', 'navy': '#1d2d4b',
    'زيتي': '#65705a', 'olive': '#65705a',
    'بني': '#795548', 'brown': '#795548',
    'بيج': '#d6c2a5', 'beige': '#d6c2a5',
    'عنابي': '#7f1d32', 'burgundy': '#7f1d32',
    'احمر': '#b91c1c', 'أحمر': '#b91c1c', 'red': '#b91c1c',
    'ازرق': '#2563eb', 'أزرق': '#2563eb', 'blue': '#2563eb',
    'اخضر': '#15803d', 'أخضر': '#15803d', 'green': '#15803d',
    'رمادي': '#6b7280', 'gray': '#6b7280', 'grey': '#6b7280',
    'موف': '#8b5cf6', 'بنفسجي': '#7c3aed', 'purple': '#7c3aed',
    'وردي': '#ec4899', 'pink': '#ec4899',
    'برتقالي': '#ea580c', 'orange': '#ea580c',
    'اصفر': '#eab308', 'أصفر': '#eab308', 'yellow': '#eab308',
    'ذهبي': '#c59b52', 'gold': '#c59b52',
    'فضي': '#a8a29e', 'silver': '#a8a29e',
    'موكا': '#92745f', 'mocha': '#92745f',
  };
  return colors[color] || '#a98a6a';
};

const getProductSizes = (product: Product) => product.sizes?.length
  ? product.sizes
  : [{ name: 'One Size', available: true }];

const getProductCategory = (product: Product) => {
  return product.name?.trim() || '';
};

// تم استخدام 'any' لتجاوز خطأ التايب سكربت المزعج
function ProductCard({ product, index, onAdd, liked, onToggleWishlist, selected, onSelect }: { product: Product; index: number; onAdd: (product: Product, color: string, size: string) => void; liked: boolean; onToggleWishlist: (product: Product, color: string, size: string) => void; selected: boolean; onSelect: (productId: number) => void }) {  const { language, t } = useLanguage();
  const sizes = getProductSizes(product);
  
  const rawColors = (product as any).colors;
  const colors = rawColors?.length ? rawColors : product.images.map((item: any) => ({ name: item.color, available: true, image: item.img }));
  
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const activeColor = colors.find((item: any) => item.name === selectedColor) || colors[0];
  
  const colorImages = activeColor?.images?.length
    ? activeColor.images
    : activeColor?.image
      ? [activeColor.image]
      : product.images.filter((item: any) => item.color === selectedColor).map((item: any) => item.img);

  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => setImageIndex(0), [selectedColor]);
  
  useEffect(() => {
    if (colorImages.length < 2) return;
    const timer = window.setInterval(() => setImageIndex((current) => (current + 1) % colorImages.length), 3000);
    return () => window.clearInterval(timer);
  }, [colorImages.length, selectedColor]);

  const colorImage = colorImages[imageIndex] || product.image;
  const discountPercentage = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const sizesForColor = (selected = selectedColor) => {
    const selectedColorObj = colors.find((item: any) => item.name === selected);
    return sizes.map((item) => ({
      ...item,
      available: selectedColorObj?.sizeAvailability?.[item.name] ?? (selectedColorObj?.available && item.available)
    }));
  };

  const [size, setSize] = useState(sizesForColor()[0]?.name || '');
  const colorSizes = sizesForColor();
  const productAvailable = Boolean(activeColor?.available && colorSizes.some((item) => item.available));

  const isSelectedColorAvailable = Boolean(activeColor?.available);
  const isSelectedSizeAvailable = Boolean(colorSizes.find((item) => item.name === size)?.available);
  const canAddToCart = Boolean(size && productAvailable && isSelectedColorAvailable && isSelectedSizeAvailable);

  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`group scroll-mt-32 ${selected ? 'ring-2 ring-ora-300 rounded-2xl p-1 shadow-lg shadow-ora-200/40' : ''}`}>
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ora-100 mb-4">
        <img src={colorImage} alt={`${product.name} - ${activeColor?.name || ''}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-[10px] font-bold rounded-full">{product.badge}</span>
        <span className={`absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full ${productAvailable ? 'availability-available' : 'availability-unavailable'}`}>
          {productAvailable ? 'متوفر' : 'غير متوفر'}
        </span>
        <button onClick={() => onToggleWishlist(product, selectedColor, size)} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center transition-all hover:scale-110" aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between mb-1">
          <button type="button" onClick={() => onSelect(product.id)} className="text-right font-semibold text-sm text-charcoal-900 hover:text-ora-700 transition-colors cursor-pointer">
            {product.name}
          </button>
          <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{product.rating}</span>
        </div>
        <button type="button" onClick={() => onSelect(product.id)} className="block text-xs text-charcoal-400 mb-2 text-right hover:text-ora-600 transition-colors cursor-pointer">
          {product.nameAr} - لون {activeColor?.name || ''}
        </button>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">₪{product.price}</span>
            {product.originalPrice > product.price && <span className="text-xs text-charcoal-400 line-through">₪{product.originalPrice}</span>}
            {discountPercentage > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">خصم {discountPercentage}%</span>}
          </div>
          <button 
            disabled={!canAddToCart} 
            onClick={() => onAdd(product, selectedColor, size)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E3220] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-ora-700 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />{language === 'he' ? t('addToCart') : 'أضف للسلة'}
          </button>
        </div>

        <div className="mt-3">
          <span className="text-xs text-charcoal-500">{language === 'he' ? t('availableSizes') : 'النمر المتوفرة:'}</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {colorSizes.map((item) => (
              <button 
                key={item.name} 
                disabled={!item.available} 
                onClick={() => setSize(item.name)} 
                className={`relative size-option min-w-8 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${size === item.name && item.available ? 'bg-ora-200 border border-ora-600' : 'bg-gray-100'} disabled:opacity-60`} 
                aria-label={`${language === 'he' ? t('size') : 'نمرة'} ${item.name}`}
              >
                <span className={item.available ? '' : 'line-through text-gray-400'}>{item.name}</span>
                {!item.available && (
                  <span className="absolute -top-1.5 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center leading-none">×</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 mt-3">
          {colors.map((item: any) => { 
            const hasAnySizeAvailable = sizes.some((sizeItem: any) => 
              item.sizeAvailability?.[sizeItem.name] ?? (item.available && sizeItem.available)
            );
            const selected = selectedColor === item.name; 
            
            return (
              <button 
                key={item.name} 
                onClick={() => { 
                  setSelectedColor(item.name); 
                  const nextSizes = sizesForColor(item.name);
                  setSize(nextSizes.find((entry) => entry.available)?.name || ''); 
                }} 
                className={`relative w-7 h-7 rounded-full transition-transform hover:scale-110 ${selected ? 'ring-2 ring-offset-2 ring-[#c59b52] scale-110' : 'border border-gray-200'} ${!hasAnySizeAvailable ? 'opacity-60 grayscale' : ''}`} 
                style={{ backgroundColor: getColorHex(item.name) }} 
                aria-label={`لون ${item.name}`} 
                title={item.name} 
              >
                {!hasAnySizeAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center text-red-600 font-bold text-xs bg-black/30 rounded-full">×</span>
                )}
              </button>
            ); 
          })}
        </div>
      </div>
    </motion.div>
  );
}

// تم استخدام 'any' هنا أيضاً لتجاوز الأخطاء
export default function ProductShowcase({ products: initialProducts, onAdd, wishlist, onToggleWishlist }: { products: Product[]; onAdd: any; wishlist: WishlistItem[]; onToggleWishlist: any }) {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const cloudProducts = initialProducts;

  const categories = useMemo(() => {
    const baseCategories = ['الكل', 'ATHER', 'NASAQ', 'SAHAB', 'WAQAR', 'OFUQ', 'TAYF'];
    const dynamicCategories = (cloudProducts || []).map(getProductCategory).filter(Boolean);
    return Array.from(new Set([...baseCategories, ...dynamicCategories]));
  }, [cloudProducts]);

  const { ref, inView } = useScrollReveal(0.05);
  const { language, t } = useLanguage();

  useEffect(() => {
    const selectCollection = (event: Event) => {
      const title = (event as CustomEvent<string>).detail;
      setActiveCategory(title || 'الكل');
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-collection', selectCollection);
    return () => document.removeEventListener('ora:select-collection', selectCollection);
  }, []);

  useEffect(() => {
    const selectProduct = (event: Event) => {
      const productId = Number((event as CustomEvent<number>).detail);
      const product = cloudProducts.find((item) => Number(item.id) === productId);
      if (!product) return;
      setActiveCategory('الكل');
      setSelectedProductId(productId);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-product', selectProduct);
    return () => document.removeEventListener('ora:select-product', selectProduct);
  }, [cloudProducts]);
  
  const visible = (activeCategory === 'الكل' ? cloudProducts : cloudProducts.filter((product) => getProductCategory(product) === activeCategory))
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id));

  useEffect(() => {
    if (!selectedProductId) return;
    const timer = window.setTimeout(() => {
      const target = document.querySelector(`[data-product-id="${selectedProductId}"]`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedProductId]);

  return (
    <section id="products" ref={ref} className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-12">
          <span className="text-xs font-semibold text-ora-600 mb-3 block">{language === 'he' ? t('curated') : 'Curated For You'}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">{language === 'he' ? t('collection') : <>تصفح <span className="gradient-text">التشكيلة</span></>}</h2>
        </motion.div>
        
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === category ? 'bg-ora-200 shadow-md' : 'bg-ora-100/60 hover:bg-ora-200'}`}>
              {language === 'he' && category === 'الكل' ? t('all') : category}
            </button>
          ))}
        </div>

<AnimatePresence mode="wait">
          <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {visible.map((product, index) => (
              <div key={product.id || index} data-product-id={product.id}>
                <ProductCard 
                  product={product} 
                  index={index} 
                  onAdd={onAdd} 
                  liked={wishlist.some((item) => item.id === product.id)} 
                  onToggleWishlist={onToggleWishlist} 
                  selected={selectedProductId === product.id}
                  onSelect={setSelectedProductId} 
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
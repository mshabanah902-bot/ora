import { useEffect, useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import type { Product } from '../data/products';
import type { WishlistItem } from '../App';
import { normalizeProductType, translateProductBadge, translateProductColor, translateProductType, useLanguage } from '../i18n';

const getColorHex = (name: string) => {
  const color = name.trim().toLocaleLowerCase().replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه');
  const colors: Record<string, string> = {
    'ابيض': '#f5f2ed', 'أبيض': '#f5f2ed', 'white': '#f5f2ed',
    'اسود': '#171717', 'أسود': '#171717', 'black': '#171717',
    'كحلي': '#1d2d4b', 'navy': '#1d2d4b',
    'زيتي': '#65705a', 'olive': '#65705a',
    'بني غامق': '#4b2e24', 'بني داكن': '#4b2e24', 'dark brown': '#4b2e24', 'dark-brown': '#4b2e24', 'chocolate': '#4b2e24',
    'بني فاتح': '#a47551', 'light brown': '#a47551', 'light-brown': '#a47551', 'كاراميل': '#b9825b', 'caramel': '#b9825b',
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
  if (colors[color]) return colors[color];
  if (color.includes('بني') || color.includes('brown')) return '#795548';
  if (color.includes('موكا') || color.includes('mocha')) return '#92745f';
  return '#a98a6a';
};

const getProductSizes = (product: Product) => product.sizes?.length
  ? product.sizes
  : [{ name: 'One Size', available: true }];

const getProductCategory = (product: Product) => {
  return product.name?.trim() || '';
};

const hasAvailableVariant = (product: Product) => {
  const sizes = getProductSizes(product);
  return product.colors.some((color) => color.available && sizes.some((size) => color.sizeAvailability?.[size.name] ?? size.available));
};

// تم استخدام 'any' لتجاوز خطأ التايب سكربت المزعج
function ProductCard({ product, index, onAdd, liked, onToggleWishlist, selected, onSelect }: { product: Product; index: number; onAdd: (product: Product, color: string, size: string) => void; liked: boolean; onToggleWishlist: (product: Product, color: string, size: string) => void; selected: boolean; onSelect: (productId: number) => void }) {  const { language, t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: '0px 0px -8% 0px' });
  const sizes = getProductSizes(product);
  
  const rawColors = (product as any).colors;
  const colorOptions = rawColors?.length ? rawColors : product.images.map((item: any) => ({ name: item.color, available: true, image: item.img }));
  const colors = [...colorOptions].sort((first: any, second: any) => {
    const firstAvailable = first.available && sizes.some((size) => first.sizeAvailability?.[size.name] ?? size.available);
    const secondAvailable = second.available && sizes.some((size) => second.sizeAvailability?.[size.name] ?? size.available);
    return Number(secondAvailable) - Number(firstAvailable);
  });
  
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
      available: Boolean(selectedColorObj?.available && (selectedColorObj?.sizeAvailability?.[item.name] ?? item.available))
    })).sort((first, second) => Number(second.available) - Number(first.available));
  };

  const [size, setSize] = useState(sizesForColor()[0]?.name || '');
  const colorSizes = sizesForColor();
  const productAvailable = Boolean(activeColor?.available && colorSizes.some((item) => item.available));

  const isSelectedColorAvailable = Boolean(activeColor?.available);
  const isSelectedSizeAvailable = Boolean(colorSizes.find((item) => item.name === size)?.available);
  const canAddToCart = Boolean(size && productAvailable && isSelectedColorAvailable && isSelectedSizeAvailable);

  return (
    <motion.div ref={cardRef} dir={language === 'en' ? 'ltr' : 'rtl'} layout initial={{ opacity: 0, y: 22 }} animate={cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }} transition={{ duration: 0.36, delay: Math.min(index * 0.035, 0.18) }} className={`group scroll-mt-32 ${selected ? 'ring-2 ring-ora-300 rounded-2xl p-1 shadow-lg shadow-ora-200/40' : ''}`}>
      <div role="button" tabIndex={0} onClick={() => onSelect(product.id)} onKeyDown={(event) => event.key === 'Enter' && onSelect(product.id)} aria-label={`تفاصيل ${product.nameAr}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ora-100 mb-4 cursor-pointer">
        <img src={colorImage} alt={`${language === 'ar' ? product.nameAr : product.name} - ${activeColor?.name || ''}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-[10px] font-bold rounded-full">{product.originalPrice > product.price && !product.badge ? t('salesLabel') : translateProductBadge(product.badge || 'ORA', language)}</span>
        {product.season && <span className="absolute top-3 right-14 px-3 py-1 bg-white/90 text-[10px] font-bold rounded-full">{t(product.season)}</span>}
        <span className={`absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full ${productAvailable ? 'availability-available' : 'availability-unavailable'}`}>
          {productAvailable ? t('inStock') : t('outOfStock')}
        </span>
        <button onClick={(event) => { event.stopPropagation(); onToggleWishlist(product, selectedColor, size); }} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 shadow-md flex items-center justify-center transition-all hover:scale-110" aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between mb-1">
          <button type="button" onClick={() => onSelect(product.id)} className="text-start font-semibold text-sm text-charcoal-900 hover:text-ora-700 transition-colors cursor-pointer">
            {language === 'ar' ? product.nameAr : product.name}
          </button>
          <span className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{product.rating}</span>
        </div>
        <button type="button" onClick={() => onSelect(product.id)} className="block text-xs text-charcoal-400 mb-2 text-start hover:text-ora-600 transition-colors cursor-pointer">
          {language === 'ar' ? `${product.name} - ${t('color')} ${translateProductColor(activeColor?.name || '', language)}` : `${t('color')} ${translateProductColor(activeColor?.name || '', language)}`}
        </button>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold">₪{product.price}</span>
            {product.originalPrice > product.price && <span className="text-xs text-charcoal-400 line-through">₪{product.originalPrice}</span>}
            {discountPercentage > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{language === 'en' ? `${discountPercentage}% ${t('discount')}` : `${t('discount')} ${discountPercentage}%`}</span>}
          </div>
          <button 
            disabled={!canAddToCart} 
            onClick={() => onAdd(product, selectedColor, size)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E3220] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-ora-700 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />{t('addToCart')}
          </button>
        </div>

        <div className="mt-3">
            <span className="text-xs text-charcoal-500">{t('sizesLabel')}</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {colorSizes.map((item) => (
              <button 
                key={item.name} 
                disabled={!item.available} 
                onClick={() => setSize(item.name)} 
                className={`relative size-option min-w-8 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${size === item.name && item.available ? 'bg-ora-200 border border-ora-600' : 'bg-gray-100'} disabled:opacity-60`} 
                aria-label={`${t('size')} ${item.name}`}
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
                aria-label={`${t('color')} ${translateProductColor(item.name, language)}`}
                title={translateProductColor(item.name, language)}
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
  const [activeType, setActiveType] = useState<'all' | NonNullable<Product['productType']>>('all');
  const [activeSeason, setActiveSeason] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const cloudProducts = initialProducts;
  const { ref, inView } = useScrollReveal(0.05);
  const { language, t } = useLanguage();

  const categories = useMemo(() => {
    const dynamicCategories = cloudProducts
      .filter((product) => getProductCategory(product))
      .map((product) => [getProductCategory(product), language === 'ar' ? product.nameAr?.trim() || getProductCategory(product) : getProductCategory(product)] as const);
    return [
      { value: 'الكل', label: t('all') },
      ...Array.from(new Map(dynamicCategories)).map(([value, label]) => ({ value, label })),
    ];
  }, [cloudProducts, language, t]);

  const typeOptions = useMemo(() => {
    const dynamicTypes = [...new Set(cloudProducts.map((product) => product.productType?.trim()).filter((type): type is string => Boolean(type)))];
    const known = [
      { value: 'sets', label: t('typeSets') },
      { value: 'tops', label: t('typeTops') },
      { value: 'shirts', label: t('typeShirts') },
    ];
    const custom = dynamicTypes
      .filter((type) => !known.some((item) => item.value === normalizeProductType(type)))
      .map((type) => ({ value: normalizeProductType(type), label: translateProductType(type, language) }));
    return [{ value: 'all', label: t('allTypes') }, ...known, ...custom];
  }, [cloudProducts, language, t]);

  useEffect(() => {
    const selectCollection = (event: Event) => {
      const title = (event as CustomEvent<string>).detail;
      setActiveCategory(title || 'الكل');
      setActiveType('all');
      setActiveSeason(null);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-collection', selectCollection);
    return () => document.removeEventListener('ora:select-collection', selectCollection);
  }, []);

  useEffect(() => {
    const selectSeason = (event: Event) => {
      setActiveCategory('الكل');
      setActiveType('all');
      setActiveSeason((event as CustomEvent<string>).detail);
      setSelectedProductId(null);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-season', selectSeason);
    const selectProductType = (event: Event) => {
      setActiveCategory('الكل');
      setActiveType((event as CustomEvent<string>).detail);
      setActiveSeason(null);
      setSelectedProductId(null);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-product-type', selectProductType);
    return () => {
      document.removeEventListener('ora:select-season', selectSeason);
      document.removeEventListener('ora:select-product-type', selectProductType);
    };
  }, []);

  useEffect(() => {
    const selectProduct = (event: Event) => {
      const productId = Number((event as CustomEvent<number>).detail);
      const product = cloudProducts.find((item) => Number(item.id) === productId);
      if (!product) return;
      setActiveCategory('الكل');
      setActiveType('all');
      setActiveSeason(null);
      setSelectedProductId(productId);
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('ora:select-product', selectProduct);
    return () => document.removeEventListener('ora:select-product', selectProduct);
  }, [cloudProducts]);
  
  const visible = cloudProducts.filter((product) =>
    (!activeSeason || product.season === activeSeason)
    && (activeType === 'all' || normalizeProductType(product.productType || '') === activeType)
    && (activeCategory === 'الكل' || getProductCategory(product) === activeCategory)
  )
    .slice()
    .sort((a, b) => {
      const stockOrder = Number(hasAvailableVariant(b)) - Number(hasAvailableVariant(a));
      if (stockOrder) return stockOrder;
      return a.displayOrder !== undefined && b.displayOrder !== undefined
        ? a.displayOrder - b.displayOrder
        : Number(b.id) - Number(a.id);
    });

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
    <section id="products" ref={ref} className="py-20 sm:py-28 bg-white/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="mb-12">
          <span className="text-xs font-semibold text-ora-600 mb-3 block">{t('curated')}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">{t('collection')}</h2>
        </motion.div>
        
        <div className="mb-5" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <p className="filter-rail-label">{t('productTypeFilter')}</p>
          <div className="filter-rail" aria-label={t('productTypeFilter')}>
            {typeOptions.map((type) => (
              <button key={type.value} type="button" onClick={() => { setActiveType(type.value); setActiveCategory('الكل'); setActiveSeason(null); setSelectedProductId(null); }} className={`filter-chip ${activeType === type.value ? 'filter-chip-active' : ''}`} aria-pressed={activeType === type.value}>
                {type.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-10" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <p className="filter-rail-label">{t('productNameFilter')}</p>
          <div className="filter-rail" aria-label={t('productNameFilter')}>
            {categories.map((category) => (
              <button key={category.value} type="button" onClick={() => { setActiveCategory(category.value); setActiveType('all'); setActiveSeason(null); setSelectedProductId(null); }} className={`filter-chip ${activeCategory === category.value ? 'filter-chip-active' : ''}`} aria-pressed={activeCategory === category.value}>
                {category.label}
              </button>
            ))}
          </div>
        </div>

<AnimatePresence mode="wait">
          <motion.div key={`${activeType}:${activeCategory}:${activeSeason || ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
            {!visible.length && <p className="col-span-full py-12 text-center text-charcoal-500">{t('noProducts')}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
      {selectedProductId !== null && cloudProducts.find((product) => product.id === selectedProductId) && (
        <ProductDetails
          key={selectedProductId}
          product={cloudProducts.find((product) => product.id === selectedProductId)!}
          liked={wishlist.some((item) => item.id === selectedProductId)}
          onClose={() => setSelectedProductId(null)}
          onAdd={onAdd}
          onToggleWishlist={onToggleWishlist}
        />
      )}
    </section>
  );
}

function ProductDetails({ product, liked, onClose, onAdd, onToggleWishlist }: {
  product: Product;
  liked: boolean;
  onClose: () => void;
  onAdd: (product: Product, color: string, size: string) => void;
  onToggleWishlist: (product: Product, color: string, size: string) => void;
}) {
  const { language, t } = useLanguage();
  const sizes = getProductSizes(product);
  const colorOptions = product.colors?.length ? product.colors : product.images.map((item) => ({ name: item.color, image: item.img, available: true }));
  const colors = [...colorOptions].sort((first, second) => {
    const firstAvailable = first.available && sizes.some((size) => first.sizeAvailability?.[size.name] ?? size.available);
    const secondAvailable = second.available && sizes.some((size) => second.sizeAvailability?.[size.name] ?? size.available);
    return Number(secondAvailable) - Number(firstAvailable);
  });
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name || '');
  const [imageIndex, setImageIndex] = useState(0);
  const activeColor = colors.find((color) => color.name === selectedColor) || colors[0];
  const images = activeColor?.images?.length ? activeColor.images : activeColor?.image ? [activeColor.image] : [product.image];
  const colorSizes = sizes.map((size) => ({
    ...size,
    available: Boolean(activeColor?.available && (activeColor?.sizeAvailability?.[size.name] ?? size.available)),
  })).sort((first, second) => Number(second.available) - Number(first.available));
  const canAdd = Boolean(activeColor?.available && colorSizes.some((size) => size.name === selectedSize && size.available));

  useEffect(() => setImageIndex(0), [selectedColor]);

  return <AnimatePresence>
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div role="dialog" aria-modal="true" aria-label={`${t('detailsLabel')}: ${language === 'ar' ? product.nameAr : product.name}`} dir={language === 'en' ? 'ltr' : 'rtl'} className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-[#faf8f5] shadow-2xl md:grid-cols-2" initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, scale: 0.98 }}>
        <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow" aria-label={t('close')}><span aria-hidden="true">×</span></button>
        <div className="bg-ora-100">
          <img src={images[imageIndex] || product.image} alt={language === 'ar' ? product.nameAr : product.name} className="aspect-[4/4.4] w-full object-cover md:h-full md:aspect-auto" />
          {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-3">{images.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setImageIndex(index)} className={`h-16 w-14 shrink-0 overflow-hidden rounded-md border-2 ${imageIndex === index ? 'border-ora-600' : 'border-transparent'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div className="flex flex-col p-5 sm:p-8">
          <span className="text-xs font-semibold text-ora-700">{translateProductBadge(product.badge || 'ORA', language)}</span>
          <h2 className="mt-2 text-2xl font-extrabold">{language === 'ar' ? product.nameAr : product.name}</h2>
          {language === 'ar' && <p className="text-sm text-charcoal-500">{product.name}</p>}
          <div className="mt-4 flex items-center gap-3"><b className="text-xl">₪{product.price}</b>{product.originalPrice > product.price && <><del className="text-sm text-charcoal-400">₪{product.originalPrice}</del><span className="text-xs font-bold text-red-700">{t('salesLabel')}</span></>}</div>
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold">{t('color')}: {translateProductColor(selectedColor, language)}</p>
            <div className="flex flex-wrap gap-2">{colors.map((color) => {
              const hasAvailableSize = Boolean(color.available && sizes.some((size) => color.sizeAvailability?.[size.name] ?? size.available));
              return <button type="button" key={color.name} disabled={!hasAvailableSize} onClick={() => { setSelectedColor(color.name); setSelectedSize(sizes.find((size) => color.sizeAvailability?.[size.name] ?? (color.available && size.available))?.name || ''); }} className={`rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${selectedColor === color.name ? 'border-ora-700 bg-ora-100' : 'border-charcoal-200 bg-white'}`} aria-pressed={selectedColor === color.name}>{translateProductColor(color.name, language)}</button>;
            })}</div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">{t('size')}</p>
            <div className="flex flex-wrap gap-2">{colorSizes.map((size) => <button type="button" key={size.name} disabled={!size.available} onClick={() => setSelectedSize(size.name)} className={`size-option min-w-11 rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${!size.available ? 'line-through' : ''} ${selectedSize === size.name ? 'size-option-selected' : ''}`} aria-pressed={selectedSize === size.name}>{size.name}</button>)}</div>
          </div>
          <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-7">
            <button type="button" disabled={!canAdd} onClick={() => { onAdd(product, selectedColor, selectedSize); onClose(); }} className="flex items-center justify-center gap-2 rounded-lg bg-[#2E3220] px-4 py-3 font-bold text-white disabled:opacity-40"><ShoppingBag size={18} /> {t('addToCart')}</button>
            <button type="button" onClick={() => onToggleWishlist(product, selectedColor, selectedSize)} className={`flex h-12 w-12 items-center justify-center rounded-lg border border-ora-200 bg-white ${liked ? 'text-red-600' : 'text-charcoal-700'}`} aria-label={liked ? t('removeWishlist') : t('wishlist')}><Heart size={19} className={liked ? 'fill-current' : ''} /></button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>;
}
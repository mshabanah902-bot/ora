import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, Leaf, ShoppingBag, Snowflake, Star, Sun, Tag } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Product } from '../data/products';
import { normalizeProductType, translateProductColor, translateProductType, useLanguage } from '../i18n';

const seasons = [
  { id: 'winter', titleKey: 'winter', subtitleKey: 'winterSubtitle', Icon: Snowflake },
  { id: 'summer', titleKey: 'summer', subtitleKey: 'summerSubtitle', Icon: Sun },
  { id: 'autumn', titleKey: 'autumn', subtitleKey: 'autumnSubtitle', Icon: Leaf },
] as const;

function selectSeason(season: string) {
  document.dispatchEvent(new CustomEvent('ora:select-season', { detail: season }));
}

function selectProduct(productId: number) {
  document.dispatchEvent(new CustomEvent('ora:select-product', { detail: productId }));
}

function getOfferColorHex(name: string) {
  const color = name.toLowerCase();
  if (color.includes('أبيض') || color.includes('ابيض') || color.includes('white')) return '#f5f2ed';
  if (color.includes('أسود') || color.includes('اسود') || color.includes('black')) return '#171717';
  if (color.includes('كحلي') || color.includes('navy')) return '#1d2d4b';
  if (color.includes('أحمر') || color.includes('عنابي') || color.includes('red') || color.includes('burgundy')) return '#8a2436';
  if (color.includes('زيتي') || color.includes('olive') || color.includes('أخضر') || color.includes('اخضر')) return '#65705a';
  if (color.includes('رمادي') || color.includes('gray') || color.includes('grey')) return '#848484';
  if (color.includes('بيج') || color.includes('beige')) return '#d6c2a5';
  if (color.includes('بني') || color.includes('brown') || color.includes('موكا')) return '#795548';
  return '#a98a6a';
}

export function SeasonalSections({ products }: { products: Product[] }) {
  const { language, t } = useLanguage();
  return (
    <section aria-label={t('seasonsTitle')} className="relative overflow-hidden bg-[#faf8f5]/88 py-16 sm:py-20" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="mb-2 block text-xs font-semibold text-ora-700">{t('seasonsKicker')}</span>
          <h2 className="seasonal-word-spacing text-3xl font-extrabold text-black sm:text-4xl">{t('seasonsTitle')}</h2>
          <span className="mt-2 block text-sm text-charcoal-600">{t('seasonsHint')}</span>
        </div>
        <div className="category-rail" aria-label={t('seasonsTitle')}>
          {seasons.map(({ id, titleKey, subtitleKey, Icon }, index) => {
            const seasonalProducts = products.filter((product) => product.season === id);
            const image = seasonalProducts[0]?.image || products[index]?.image;
            const title = t(titleKey);
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => selectSeason(id)}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.08 }}
                className="category-tile group"
              >
                {image && <img src={image} alt={t('seasonPieceAlt').replace('{season}', title)} className="category-tile-image" loading="lazy" />}
                <span className="category-tile-blur" />
                <span className="category-tile-icon"><Icon size={24} strokeWidth={1.7} /></span>
                <span className="category-tile-copy seasonal-word-spacing">
                  <span className="category-tile-title">{language === 'ar' ? `ملابس ${title}` : title}</span>
                  <span className="category-tile-description">{t(subtitleKey)}</span>
                  <span className="category-tile-action">{t('seasonalCta')} {language === 'en' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</span>
                </span>
                <span className="category-tile-count">{seasonalProducts.length} {t('seasonalCount')}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const standardTypes = [
  { value: 'sets', labelKey: 'typeSets' },
  { value: 'tops', labelKey: 'typeTops' },
  { value: 'shirts', labelKey: 'typeShirts' },
] as const;

export function ProductTypeSections({ products }: { products: Product[] }) {
  const { language, t } = useLanguage();
  const customTypes = [...new Set(products.map((product) => product.productType?.trim()).filter((type): type is string => Boolean(type)))]
    .filter((type) => !standardTypes.some((standard) => standard.value === normalizeProductType(type)))
    .map((type) => ({ value: normalizeProductType(type), label: translateProductType(type, language) }));
  const groups = [
    ...standardTypes.map((type) => ({ value: type.value, label: t(type.labelKey) })),
    ...customTypes,
  ];

  return (
    <section aria-label={t('typesTitle')} className="relative overflow-hidden bg-[#faf8f5]/88 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center" dir="auto">
          <span className="mb-2 block text-xs font-semibold text-ora-700">{t('typesKicker')}</span>
          <h2 className="seasonal-word-spacing text-3xl font-extrabold text-black sm:text-4xl">{t('typesTitle')}</h2>
        </div>
        <div className="category-rail" aria-label={t('typesTitle')}>
          {groups.map(({ value, label }, index) => {
            const items = products.filter((product) => normalizeProductType(product.productType || '') === value);
            const image = items[0]?.image || products[index % Math.max(products.length, 1)]?.image;
            return (
              <motion.button key={value} type="button" onClick={() => document.dispatchEvent(new CustomEvent('ora:select-product-type', { detail: value }))} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.35, delay: index * 0.05 }} className="category-tile group" dir="auto">
                {image && <img src={image} alt="" className="category-tile-image" loading="lazy" />}
                <span className="category-tile-blur" />
                <span className="category-tile-copy seasonal-word-spacing">
                  <span className="category-tile-title">{label}</span>
                  <span className="category-tile-action">{t('seasonalCta')} {language === 'en' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</span>
                </span>
                <span className="category-tile-count">{items.length} {t('seasonalCount')}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type OfferProductCardProps = {
  product: Product;
  liked: boolean;
  onSelect: (productId: number) => void;
  onAdd: (product: Product, color: string, size: string) => void;
  onToggleWishlist: (product: Product, color: string, size: string) => void;
};

function OfferProductCard({ product, liked, onSelect, onAdd, onToggleWishlist }: OfferProductCardProps) {
  const { language, t } = useLanguage();
  const colorOptions: Product['colors'] = product.colors?.length
    ? product.colors
    : product.images.map((image) => ({ name: image.color, image: image.img, available: true }));
  const sizes = product.sizes?.length ? product.sizes : [{ name: 'One Size', available: true }];
  const colors = [...colorOptions].sort((first, second) => {
    const firstAvailable = first.available && sizes.some((size) => first.sizeAvailability?.[size.name] ?? size.available);
    const secondAvailable = second.available && sizes.some((size) => second.sizeAvailability?.[size.name] ?? size.available);
    return Number(secondAvailable) - Number(firstAvailable);
  });
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState('');
  const activeColor = colors.find((color) => color.name === selectedColor) || colors[0];
  const sizeOptions = sizes.map((size) => ({
    ...size,
    available: Boolean(activeColor?.available && (activeColor?.sizeAvailability?.[size.name] ?? size.available)),
  })).sort((first, second) => Number(second.available) - Number(first.available));
  const currentImage = activeColor?.images?.[0] || activeColor?.image || product.image;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const canAdd = Boolean(selectedSize && sizeOptions.some((size) => size.name === selectedSize && size.available));

  useEffect(() => {
    setSelectedSize(sizeOptions.find((size) => size.available)?.name || '');
  }, [selectedColor]);

  return (
    <article className="offer-item" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white/10">
        <button type="button" onClick={() => onSelect(product.id)} className="h-full w-full" aria-label={`${t('detailsLabel')}: ${language === 'ar' ? product.nameAr : product.name}`}>
          <img src={currentImage} alt={language === 'ar' ? product.nameAr : product.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
        </button>
        <span className="absolute right-2 top-2 rounded-full bg-red-700 px-2.5 py-1 text-[10px] font-bold">{language === 'en' ? `${discount}% ${t('discount')}` : `${t('discount')} ${discount}%`}</span>
        <button type="button" onClick={() => onToggleWishlist(product, selectedColor, selectedSize)} className={`offer-favorite absolute left-2 top-2 flex h-11 w-11 items-center justify-center rounded-full ${liked ? 'text-red-300' : ''}`} aria-label={liked ? t('removeWishlist') : t('wishlist')}>
          <Heart size={21} className={liked ? 'fill-current' : ''} />
        </button>
      </div>
      <div className="seasonal-word-spacing pt-3">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => onSelect(product.id)} className="truncate text-start text-sm font-bold text-white hover:text-ora-300">{language === 'ar' ? product.nameAr : product.name}</button>
          <span className="flex shrink-0 items-center gap-1 text-xs text-white/70"><Star size={12} className="fill-amber-400 text-amber-400" />{product.rating}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm"><b>₪{product.price}</b><del className="text-xs text-white/55">₪{product.originalPrice}</del></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {colors.map((color) => {
            const hasAvailableSize = Boolean(color.available && sizes.some((size) => color.sizeAvailability?.[size.name] ?? size.available));
            return <button key={color.name} type="button" disabled={!hasAvailableSize} onClick={() => setSelectedColor(color.name)} className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] disabled:cursor-not-allowed disabled:opacity-40 ${selectedColor === color.name ? 'border-ora-300 bg-white/15' : 'border-white/20 bg-white/5'}`} aria-label={`${t('color')} ${translateProductColor(color.name, language)}`} aria-pressed={selectedColor === color.name}><span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/60" style={{ backgroundColor: getOfferColorHex(color.name) }} />{translateProductColor(color.name, language)}</button>;
          })}
        </div>
        <p className="mt-3 text-[11px] text-white/65">{t('chooseSize')}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {sizeOptions.map((size) => <button key={size.name} type="button" disabled={!size.available} onClick={() => setSelectedSize(size.name)} className={`min-w-9 rounded-md border px-2 py-1 text-[11px] disabled:opacity-35 ${!size.available ? 'line-through' : ''} ${selectedSize === size.name ? 'border-ora-300 bg-ora-500 text-white' : 'border-white/20 bg-white/5'}`} aria-pressed={selectedSize === size.name}>{size.name}</button>)}
        </div>
        <button type="button" disabled={!canAdd} onClick={() => onAdd(product, selectedColor, selectedSize)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-bold text-[#2e3220] transition hover:bg-ora-200 disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag size={16} /> {t('addToCart')}</button>
      </div>
    </article>
  );
}

export function SpecialOffers({ products, onAdd, likedProductIds, onToggleWishlist }: { products: Product[]; onAdd: (product: Product, color: string, size: string) => void; likedProductIds: number[]; onToggleWishlist: (product: Product, color: string, size: string) => void }) {
  const { language, t } = useLanguage();
  const offers = products.filter((product) => product.originalPrice > product.price);
  if (!offers.length) return null;

  return (
    <section aria-label={t('offersTitle')} className="overflow-hidden bg-[#2e3220]/94 py-14 text-white sm:py-16" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <div className="mx-auto mb-8 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <span className="seasonal-word-spacing mb-2 block text-xs font-semibold text-ora-300">{t('offersKicker')}</span>
          <h2 className="seasonal-word-spacing flex items-center gap-2 text-3xl font-extrabold sm:text-4xl"><Tag size={26} className="text-ora-300" /> {t('offersTitle')}</h2>
        </div>
        <span className="hidden text-sm text-white/65 sm:block">{t('offersHint')}</span>
      </div>
      <div className="offers-viewport">
        <div className="offers-track" style={{ '--offer-duration': `${Math.max(28, offers.length * 8)}s` } as CSSProperties}>
          {[0, 1].map((copy) => offers.map((product) => <OfferProductCard key={`${copy}-${product.id}`} product={product} liked={likedProductIds.includes(product.id)} onSelect={selectProduct} onAdd={onAdd} onToggleWishlist={onToggleWishlist} />))}
        </div>
      </div>
    </section>
  );
}

export function AutumnLeaves() {
  return (
    <div className="autumn-leaf-layer" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => <Leaf key={index} className={`autumn-leaf autumn-leaf-${index + 1}`} strokeWidth={1.9} />)}
    </div>
  );
}
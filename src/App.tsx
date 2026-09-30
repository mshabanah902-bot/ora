import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collections from './components/Collections';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductShowcase from './components/ProductShowcase';
import { AutumnLeaves, ProductTypeSections, SeasonalSections, SpecialOffers } from './components/SeasonalSections';
import CartDrawer, { type CartItem } from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import { defaultProductSeasons, defaultProducts, type Product } from './data/products';
import { loadProducts, loadSiteContent, saveProducts as persistProducts, saveSiteContent as persistSiteContent } from './lib/api';
import { defaultSiteContent, type SiteContent } from './data/siteContent';

export type WishlistItem = Product & { selectedColor: string; selectedSize: string };

const normalizeProducts = (items: unknown): Product[] => {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item): item is Partial<Product> => Boolean(item && typeof item === 'object'))
    .map((product, index) => {
      const images = Array.isArray(product.images)
        ? product.images.filter((image): image is { color: string; img: string } => Boolean(image?.img))
        : [];
      const colors = Array.isArray(product.colors)
        ? product.colors.filter((color): color is Product['colors'][number] => Boolean(color?.name))
        : images.map((image) => ({ name: image.color, available: true, image: image.img }));
      const image = product.image || images[0]?.img || colors[0]?.image || '';

      return {
        ...product,
        id: Number(product.id),
        name: String(product.name || `Product ${product.id || ''}`).trim(),
        nameAr: String(product.nameAr || product.name || '').trim(),
        category: String(product.category || product.name || '').trim(),
        season: product.season ?? defaultProductSeasons[Number(product.id)] ?? (['winter', 'summer', 'autumn'] as const)[index % 3],
        image,
        images: images.length ? images : image ? [{ color: product.colorName || '', img: image }] : [],
        colors,
        sizes: Array.isArray(product.sizes) && product.sizes.length
          ? product.sizes
          : [{ name: 'One Size', available: true }],
      } as Product;
    })
    .filter((product) => Number.isFinite(product.id) && product.image);
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or restricted webviews.
  }
}

const mergeSiteContent = (value: Partial<SiteContent> | null | undefined): SiteContent => ({
  ...defaultSiteContent,
  ...(value && typeof value === 'object' ? value : {}),
  shopSections: {
    seasons: { ...defaultSiteContent.shopSections.seasons, ...(value?.shopSections?.seasons || {}) },
    types: { ...defaultSiteContent.shopSections.types, ...(value?.shopSections?.types || {}) },
  },
  hero: { ...defaultSiteContent.hero, ...(value?.hero && typeof value.hero === 'object' ? value.hero : {}) },
  story: {
    ...defaultSiteContent.story,
    ...(value?.story && typeof value.story === 'object' ? value.story : {}),
    features: Array.isArray(value?.story?.features) && value.story.features.length
      ? value.story.features
      : defaultSiteContent.story.features,
  },
  collections: Array.isArray(value?.collections) && value.collections.length
    ? value.collections
    : defaultSiteContent.collections,
});

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = normalizeProducts(readStored<unknown>('ora-products-cache', defaultProducts));
    return cached.length ? cached : [...defaultProducts].sort((a, b) => b.id - a.id);
  });
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>('ora-cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => readStored<WishlistItem[]>('ora-wishlist', []));
  const [siteContent, setSiteContent] = useState<SiteContent>(() => mergeSiteContent(readStored<Partial<SiteContent>>('ora-site-content-cache', {})));
  useEffect(() => {
    writeStored('ora-cart', cart);
  }, [cart]);
  useEffect(() => {
    writeStored('ora-wishlist', wishlist);
  }, [wishlist]);
  useEffect(() => {
    writeStored('ora-products-cache', products);
  }, [products]);
  useEffect(() => {
    writeStored('ora-site-content-cache', siteContent);
  }, [siteContent]);
  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryAttempt = 0;
    let loading = false;

    const refresh = async () => {
      if (!active || loading) return;
      loading = true;
      const [productsResult, contentResult] = await Promise.allSettled([loadProducts(), loadSiteContent()]);
      loading = false;
      if (!active) return;

      if (productsResult.status === 'fulfilled') {
        const catalog = normalizeProducts(productsResult.value);
        const hasDisplayOrder = catalog.length > 0 && catalog.every((product) => Number.isFinite(product.displayOrder));
        const restored = catalog
          .sort((a, b) => hasDisplayOrder
            ? (a.displayOrder || 0) - (b.displayOrder || 0)
            : Number(b.id) - Number(a.id))
          .map((product, index) => ({ ...product, displayOrder: hasDisplayOrder ? product.displayOrder : index }));
        setProducts(restored);
      }

      if (contentResult.status === 'fulfilled') {
        setSiteContent(mergeSiteContent(contentResult.value));
      }

      if (productsResult.status === 'rejected' || contentResult.status === 'rejected') {
        retryAttempt += 1;
        const delay = Math.min(1000 * 2 ** (retryAttempt - 1), 30000);
        retryTimer = setTimeout(() => void refresh(), delay);
        return;
      }

      retryAttempt = 0;
    };

    const refreshWhenAvailable = () => {
      if (!navigator.onLine || document.visibilityState !== 'visible') return;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = undefined;
      retryAttempt = 0;
      void refresh();
    };

    window.addEventListener('online', refreshWhenAvailable);
    window.addEventListener('focus', refreshWhenAvailable);
    document.addEventListener('visibilitychange', refreshWhenAvailable);
    void refresh();

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener('online', refreshWhenAvailable);
      window.removeEventListener('focus', refreshWhenAvailable);
      document.removeEventListener('visibilitychange', refreshWhenAvailable);
    };
  }, []);
  const addToCart = (product: Product, selectedColor: string, selectedSize: string) => {
    const selectedColorData = product.colors?.find((color) => color.name === selectedColor);
    const selectedSizeData = product.sizes?.find((size) => size.name === selectedSize);
    const colorAvailable = selectedColorData?.available ?? true;
    const sizeAvailable = selectedColorData?.sizeAvailability?.[selectedSize]
      ?? (colorAvailable && (selectedSizeData?.available ?? true));
    if (!selectedColor || !selectedSize || !colorAvailable || !sizeAvailable) return;

    const lineId = `${product.id}:${selectedColor}:${selectedSize}`;
    const selectedImage = selectedColorData?.image || product.image;
    setCart((items) => {
      const existing = items.find((item) => item.lineId === lineId);
      return existing
        ? items.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, image: selectedImage, quantity: 1, selectedColor, selectedSize, lineId }];
    });
    document.dispatchEvent(new Event('ora:cart-added'));
  };
  const changeQuantity = (lineId: string, delta: number) => setCart((items) => items.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  const saveProducts = async (next: Product[] = products) => {
    const ordered = normalizeProducts(next).map((product, index) => ({ ...product, displayOrder: index }));
    const saved = await persistProducts(ordered);
    const savedOrdered = normalizeProducts(saved).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    setProducts(savedOrdered);
  };
  const saveSiteContent = async (next: SiteContent) => {
    const merged = mergeSiteContent(next);
    setSiteContent(merged);
    await persistSiteContent(merged);
  };
  const toggleWishlist = (product: Product, selectedColor: string, selectedSize: string) => {
    const isAdding = !wishlist.some((item) => item.id === product.id);
    setWishlist((current) => current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, { ...product, selectedColor, selectedSize }]);
    if (isAdding) document.dispatchEvent(new Event('ora:wishlist-added'));
  };
  return (
    <div className="min-h-screen relative isolate">
      <AutumnLeaves />
      <div className="relative z-[1]">
      <Navbar products={products} onCartOpen={() => setCartOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
      <Hero content={siteContent.hero} />
      <SeasonalSections products={products} copy={siteContent.shopSections.seasons} />
      <ProductTypeSections products={products} copy={siteContent.shopSections.types} />
      <SpecialOffers products={products} onAdd={addToCart} likedProductIds={wishlist.map((item) => item.id)} onToggleWishlist={toggleWishlist} />
      <Collections collections={siteContent.collections} onSelectCollection={(title) => {
        document.dispatchEvent(new CustomEvent('ora:select-collection', { detail: title }));
      }} />
      <ProductShowcase products={products} onAdd={addToCart} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
      <Benefits content={siteContent.story} />      <Footer />
      <button onClick={() => setCartOpen(true)} className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#2E3220] text-white shadow-xl flex items-center justify-center hover:scale-110 hover:bg-ora-700 transition-all duration-300" aria-label="فتح السلة">
        <ShoppingBag className="w-6 h-6" />
        <span className="absolute -top-1 -left-1 bg-ora-600 text-white text-xs font-bold min-w-6 h-6 px-1 rounded-full flex items-center justify-center">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </button>
      <CartDrawer open={cartOpen} items={cart} onClose={() => setCartOpen(false)} onChange={changeQuantity} onClear={() => setCart([])} />
      <AdminPanel products={products} onSave={saveProducts} siteContent={siteContent} onSaveSiteContent={saveSiteContent} />
      </div>
    </div>
  );
}

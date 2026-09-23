import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collections from './components/Collections';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductShowcase from './components/ProductShowcase';
import CartDrawer, { type CartItem } from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import { defaultProducts, type Product } from './data/products';
import { loadProducts, loadSiteContent, saveProducts as persistProducts, saveSiteContent as persistSiteContent } from './lib/api';
import { defaultSiteContent, type SiteContent } from './data/siteContent';

export type WishlistItem = Product & { selectedColor: string; selectedSize: string };
const normalizeProducts = (items: Product[]) => items.map((product) => ({ ...product, category: product.name.trim() }));

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

const mergeSiteContent = (value: Partial<SiteContent> | null | undefined): SiteContent => ({
  ...defaultSiteContent,
  ...value,
  hero: { ...defaultSiteContent.hero, ...(value?.hero || {}) },
  story: {
    ...defaultSiteContent.story,
    ...(value?.story || {}),
    features: value?.story?.features || defaultSiteContent.story.features,
  },
  collections: value?.collections?.length ? value.collections : defaultSiteContent.collections,
});

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => normalizeProducts(readStored<Product[]>('ora-products', defaultProducts)));
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>('ora-cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => readStored<WishlistItem[]>('ora-wishlist', []));
  const [siteContent, setSiteContent] = useState<SiteContent>(() => mergeSiteContent(readStored<Partial<SiteContent>>('ora-site-content', {})));
  useEffect(() => {
    void loadProducts().then((data) => {
      const storedProducts = readStored<Product[]>('ora-products', []);
      const productsById = new Map(data.map((product) => [product.id, product]));
      storedProducts.forEach((product) => {
        if (!productsById.has(product.id)) productsById.set(product.id, product);
      });
      const source = productsById.size ? [...productsById.values()] : defaultProducts;
      const ordered = normalizeProducts([...source].sort((a, b) => Number(b.id) - Number(a.id)));
      setProducts(ordered);
      localStorage.setItem('ora-products', JSON.stringify(ordered));
      if (ordered.length > data.length) void persistProducts(ordered).catch(() => undefined);
    }).catch(() => undefined);
    void loadSiteContent().then((data) => {
      const merged = mergeSiteContent(data);
      setSiteContent(merged);
      localStorage.setItem('ora-site-content', JSON.stringify(merged));
    }).catch(() => undefined);
  }, []);
  useEffect(() => { localStorage.setItem('ora-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('ora-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
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
  };
  const changeQuantity = (lineId: string, delta: number) => setCart((items) => items.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  const saveProducts = async (next: Product[]) => {
    if (!next.length) throw new Error('لا يمكن حفظ قائمة منتجات فارغة');
    const ordered = normalizeProducts([...next].sort((a, b) => Number(b.id) - Number(a.id)));
    const saved = await persistProducts(ordered);
    const savedOrdered = normalizeProducts([...saved].sort((a, b) => Number(b.id) - Number(a.id)));
    setProducts(savedOrdered);
    localStorage.setItem('ora-products', JSON.stringify(savedOrdered));
  };
  const saveSiteContent = async (next: SiteContent) => {
    const merged = mergeSiteContent(next);
    await persistSiteContent(merged);
    setSiteContent(merged);
    localStorage.setItem('ora-site-content', JSON.stringify(merged));
  };
  const toggleWishlist = (product: Product, selectedColor: string, selectedSize: string) => setWishlist((current) => {
    const next = current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, { ...product, selectedColor, selectedSize }];
    return next;
  });
  return (
    <div className="min-h-screen">
      <Navbar products={products} onCartOpen={() => setCartOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
      <Hero content={siteContent.hero} />
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
  );
}

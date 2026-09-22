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
import { apiUrl } from './lib/api';
import { defaultSiteContent, type SiteContent } from './data/siteContent';

export type WishlistItem = Product & { selectedColor: string; selectedSize: string };
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
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('ora-wishlist') || '[]'); } catch { return []; }
  });
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  useEffect(() => {
    const saved = localStorage.getItem('ora-products');
    if (saved) try { setProducts(JSON.parse(saved)); } catch { localStorage.removeItem('ora-products'); }
    fetch(apiUrl('/api/products')).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => Array.isArray(data) && data.length > 0 && setProducts(data)).catch(() => undefined);
    const savedContent = localStorage.getItem('ora-site-content');
    if (savedContent) try { setSiteContent(mergeSiteContent(JSON.parse(savedContent))); } catch { localStorage.removeItem('ora-site-content'); }
    fetch(apiUrl('/api/settings')).then((response) => response.ok ? response.json() : Promise.reject()).then((data) => data && setSiteContent(mergeSiteContent(data))).catch(() => undefined);
  }, []);
  const addToCart = (product: Product) => { setCart((items) => { const existing = items.find((item) => item.id === product.id); return existing ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }]; }); };
  const changeQuantity = (id: number, delta: number) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  const saveProducts = (next: Product[]) => { setProducts(next); localStorage.setItem('ora-products', JSON.stringify(next)); };
  const saveSiteContent = (next: SiteContent) => { const merged = mergeSiteContent(next); setSiteContent(merged); localStorage.setItem('ora-site-content', JSON.stringify(merged)); };
  const toggleWishlist = (product: Product, selectedColor: string, selectedSize: string) => setWishlist((current) => {
    const next = current.some((item) => item.id === product.id)
      ? current.filter((item) => item.id !== product.id)
      : [...current, { ...product, selectedColor, selectedSize }];
    localStorage.setItem('ora-wishlist', JSON.stringify(next));
    return next;
  });
  return (
    <div className="min-h-screen">
      <Navbar onCartOpen={() => setCartOpen(true)} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
      <Hero content={siteContent.hero} />
      <Collections collections={siteContent.collections} />
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

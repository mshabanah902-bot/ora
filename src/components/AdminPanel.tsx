import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ClipboardList, Download, GripVertical, ImagePlus, LockKeyhole, Plus, Settings, Trash2, X } from 'lucide-react';
import type { Product } from '../data/products';
import type { SiteContent } from '../data/siteContent';
import { deleteAllOrders as deleteAllOrdersFromApi, deleteOrder as deleteOrderFromApi, loadOrders as loadOrdersFromApi, updateOrderStatus as updateOrderStatusInApi } from '../lib/api';
type OrderItem = { id: number; name: string; color: string; size?: string; price: number; quantity: number };
type OrderStatus = 'new' | 'cancelled' | 'postponed' | 'delivered' | 'exchanged';
type Order = {
  id: number;
  customer: { name: string; phone: string; address: string };
  region: string;
  items: OrderItem[];
  subtotal?: number;
  discount?: number;
  promoCode?: string;
  deliveryFee?: number;
  total: number;
  status?: OrderStatus;
  createdAt: string;
};

type Tab = 'products' | 'orders' | 'settings';
const productBadgeOptions = ['', 'جديد', 'الأكثر مبيعًا', 'مميز', 'حصري', 'عرض خاص', 'الأكثر طلبًا'];
const productSeasons: { value: NonNullable<Product['season']>; label: string }[] = [
  { value: '', label: 'بدون موسم' },
  { value: 'winter', label: 'شتوي' },
  { value: 'summer', label: 'صيفي' },
  { value: 'autumn', label: 'خريفي' },
];

export default function AdminPanel({ products, onSave, siteContent, onSaveSiteContent }: { products: Product[]; onSave: (products?: Product[]) => Promise<void>; siteContent: SiteContent; onSaveSiteContent: (content: SiteContent) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [draft, setDraft] = useState<Product[]>(products);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [contentDraft, setContentDraft] = useState<SiteContent>(siteContent);
  const [saveError, setSaveError] = useState('');
  const [productsSaving, setProductsSaving] = useState(false);
  const savingProductsRef = useRef(false);

  const login = async () => {
    if (isLoggingIn) return;
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const loadedOrders = await loadOrdersFromApi(password) as Order[];
      setOrders(loadedOrders);
      setAdminPassword(password);
      setAuthenticated(true);
      setDraft(products);
      setContentDraft(siteContent);
      setSaveError('');
    } catch (error) {
      const unauthorized = error instanceof Error && error.message.endsWith(': 401');
      setLoginError(unauthorized ? 'كلمة المرور غير صحيحة.' : 'تعذر الاتصال بخدمة الإدارة. تحقق من إعداد رابط API وحاول مجددًا.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      setOrders(await loadOrdersFromApi(adminPassword) as Order[]);
    } catch {
      setSaveError('تعذر تحميل الطلبات. تحقق من اتصال خدمة الإدارة.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // تعريف دالة قراءة الصور بشكل مستقل وصحيح
  const readImages = (files: FileList | null, onRead: (images: string[]) => void) => {
    if (!files?.length) return;
    Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => optimizeImage(String(reader.result)).then(resolve).catch(() => resolve(String(reader.result)));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(onRead).catch(() => undefined);
  };

const save = async (productsToSave?: Product[]) => {
  if (savingProductsRef.current) return;
  savingProductsRef.current = true;
  setProductsSaving(true);
    setSaveError('');
    try {
      await onSave(productsToSave || draft);
    } catch (error) {
      console.error('تعذر حفظ المنتجات في Supabase', error);
      setSaveError('تعذر حفظ المنتجات في قاعدة البيانات. حاول مرة أخرى.');
      throw error;
    } finally {
      savingProductsRef.current = false;
      setProductsSaving(false);
    }
    if (!productsToSave) setOpen(false);
  };
  const saveContent = async () => {
    setSaveError('');
    try {
      await onSaveSiteContent(contentDraft);
    } catch (error) {
      console.error('تعذر حفظ محتوى الموقع في Supabase', error);
      setSaveError('تعذر حفظ محتوى الموقع في قاعدة البيانات. حاول مرة أخرى.');
      return;
    }
    setOpen(false);
  };  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 left-5 z-40 w-12 h-12 rounded-full bg-[#2E3220] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform" aria-label="لوحة الإدارة">
        <Settings size={19} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-[70]" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} dir="rtl" className="fixed top-0 left-0 z-[71] h-full w-full max-w-lg bg-[#faf8f5] shadow-2xl p-6 overflow-y-auto">
              <button onClick={() => setOpen(false)} className="absolute top-5 left-5" aria-label="إغلاق"><X /></button>
              {!authenticated ? (
                <div className="min-h-full flex flex-col justify-center items-center text-center">
                  <LockKeyhole className="mb-4 text-ora-700" size={36} />
                  <h2 className="text-2xl font-bold mb-2">لوحة إدارة ORA</h2>
                  <p className="text-sm text-charcoal-500 mb-5">أدخل كلمة المرور للمتابعة</p>
                  <input autoFocus value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }} onKeyDown={(e) => e.key === 'Enter' && void login()} type="password" placeholder="كلمة المرور" className="field max-w-xs" aria-invalid={Boolean(loginError)} aria-describedby={loginError ? 'admin-login-error' : undefined} />
                  {loginError && <p id="admin-login-error" role="alert" className="mt-3 max-w-xs text-sm text-red-700">{loginError}</p>}
                  <button type="button" onClick={() => void login()} disabled={isLoggingIn} className="mt-3 px-8 py-3 rounded-xl bg-[#2E3220] text-white disabled:cursor-wait disabled:opacity-60">{isLoggingIn ? 'جارٍ التحقق...' : 'دخول'}</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">لوحة الإدارة</h2>
                  {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button onClick={() => setTab('products')} className={`py-3 rounded-xl font-semibold transition-all ${tab === 'products' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>المنتجات</button>
                    <button onClick={() => { setTab('orders'); void loadOrders(); }} className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${tab === 'orders' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}><ClipboardList size={17} /> الطلبات</button>
                    <button onClick={() => setTab('settings')} className={`py-3 rounded-xl font-semibold transition-all ${tab === 'settings' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>المحتوى</button>
                  </div>
                  {tab === 'products' ? <ProductsTab draft={draft} update={update} onDraftChange={setDraft} onSave={save} saving={productsSaving} readImages={readImages} /> : tab === 'orders' ? <OrdersTab orders={orders} loading={ordersLoading} password={adminPassword} onOrdersChange={setOrders} onError={setSaveError} /> : <ContentTab draft={contentDraft} update={setContentDraft} onSave={saveContent} />}
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  function update(index: number, change: Partial<Product>) {
    setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item));
  }
}

function ProductsTab({ draft, update, onDraftChange, onSave, saving, readImages }: { draft: Product[]; update: (index: number, change: Partial<Product>) => void; onDraftChange: Dispatch<SetStateAction<Product[]>>; onSave: (products?: Product[]) => Promise<void>; saving: boolean; readImages: (files: FileList | null, onRead: (images: string[]) => void) => void }) {
  const [newProduct, setNewProduct] = useState<Product>(() => createEmptyProduct(1));
  const [productSection, setProductSection] = useState<'add' | 'existing'>('add');
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  const nextId = useMemo(() => draft.reduce((highest, product) => Math.max(highest, product.id), 0) + 1, [draft]);

  const reorderProducts = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= draft.length || to >= draft.length) return;
    onDraftChange((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedProductIndex(null);
  };

  const updateNewProduct = (change: Partial<Product>) => setNewProduct((current) => ({ ...current, ...change }));
  const updateNewSizes = (sizes: Product['sizes']) => updateNewProduct({ sizes });
  const updateNewColors = (colors: Product['colors']) => updateNewProduct({
    colors,
    images: colors.flatMap((color) => (color.images?.length ? color.images : [color.image]).filter(Boolean).map((image) => ({ color: color.name, img: image }))),
    image: colors.find((color) => color.image)?.image || newProduct.image,
  });
  const addProduct = async () => {
    if (saving || !newProduct.name.trim() || !newProduct.nameAr.trim() || !newProduct.colors.some((color) => color.name.trim() && color.image)) return;
    const colors = newProduct.colors
      .filter((color) => color.name.trim() && color.image)
      .map((color) => ({ ...color, name: color.name.trim(), images: color.images?.length ? color.images : [color.image] }));
    const sizes = newProduct.sizes.filter((size) => size.name.trim());
    const images = colors.flatMap((color) => color.images!.map((image) => ({ color: color.name, img: image })));
    const product = {
      ...newProduct,
      category: newProduct.name.trim(),
      id: nextId,
      sizes,
      colors,
      images,
      colorName: colors[0].name,
      image: colors[0].image,
    };
    const nextProducts = [product, ...draft];
    try {
      await onSave(nextProducts);
      onDraftChange(nextProducts);
    } catch {
      return;
    }
    setNewProduct(createEmptyProduct(nextId + 1));
  };

  const deleteProduct = async (product: Product) => {
    if (saving || !window.confirm(`هل تريد حذف المنتج ${product.nameAr || product.name}؟`)) return;
    const nextProducts = draft.filter((item) => item.id !== product.id);
    try {
      await onSave(nextProducts);
      onDraftChange(nextProducts);
    } catch {
      return;
    }
  };

  return <>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <button type="button" onClick={() => setProductSection('add')} className={`py-3 rounded-xl font-bold ${productSection === 'add' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>+ إضافة منتج</button>
      <button type="button" onClick={() => setProductSection('existing')} className={`py-3 rounded-xl font-bold ${productSection === 'existing' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>المنتجات الموجودة ({draft.length})</button>
    </div>
    {productSection === 'add' && <div className="bg-ora-100 rounded-2xl p-4 shadow-sm border border-ora-200">
      <div className="flex items-center gap-2 mb-1"><Plus size={19} className="text-ora-700" /><h3 className="font-bold text-lg">إضافة منتج جديد</h3></div>
      <p className="text-xs text-charcoal-500 mb-4">أضف المنتج هنا بشكل مستقل، ثم اضغط حفظ المنتجات بعد الانتهاء.</p>
      <div className="grid grid-cols-2 gap-2">
        <input className="field" value={newProduct.name} onChange={(e) => updateNewProduct({ name: e.target.value })} placeholder="اسم المنتج" />
        <input className="field" value={newProduct.nameAr} onChange={(e) => updateNewProduct({ nameAr: e.target.value })} placeholder="الاسم بالعربي" />
        <input className="field" type="number" value={newProduct.price || ''} onChange={(e) => updateNewProduct({ price: Number(e.target.value) })} placeholder="السعر" />
        <input className="field" type="number" value={newProduct.originalPrice || ''} onChange={(e) => updateNewProduct({ originalPrice: Number(e.target.value) })} placeholder="السعر قبل الخصم" />
        <select className="field" value={newProduct.badge} onChange={(e) => updateNewProduct({ badge: e.target.value })} aria-label="تصنيف المنتج">
          {productBadgeOptions.map((badge) => <option key={badge} value={badge}>{badge || 'بدون شارة'}</option>)}
        </select>
        <select className="field" value={newProduct.season || ''} onChange={(e) => updateNewProduct({ season: e.target.value as Product['season'] })} aria-label="موسم المنتج">
          {productSeasons.map((season) => <option key={season.value} value={season.value}>{season.label}</option>)}
        </select>
        <input className="field" value={newProduct.productType || ''} onChange={(e) => updateNewProduct({ productType: e.target.value })} placeholder="نوع المنتج، مثال: أطقم" aria-label="نوع المنتج" />
      </div>
      <div className="mt-4 border-t border-ora-200 pt-3">
        <p className="font-bold text-sm mb-2">المقاسات والنمر</p>
        <div className="space-y-2">{newProduct.sizes.map((size, sizeIndex) => <div key={`new-size-${sizeIndex}`} className="flex gap-2 items-center">
          <input className="field" value={size.name} onChange={(e) => updateNewSizes(newProduct.sizes.map((item, index) => index === sizeIndex ? { ...item, name: e.target.value } : item))} placeholder="مثال: M أو 38" />
          <button type="button" onClick={() => updateNewSizes(newProduct.sizes.map((item, index) => index === sizeIndex ? { ...item, available: !item.available } : item))} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${size.available ? 'availability-available' : 'availability-unavailable'}`}>{size.available ? 'متوفر' : 'غير متوفر'}</button>
          <button type="button" aria-label="حذف النمرة" onClick={() => updateNewSizes(newProduct.sizes.filter((_, index) => index !== sizeIndex))} className="p-2 text-red-500"><Trash2 size={15} /></button>
        </div>)}</div>
        <button type="button" onClick={() => updateNewSizes([...newProduct.sizes, { name: '', available: true }])} className="mt-2 text-xs text-ora-700">+ إضافة نمرة</button>
      </div>
      <div className="mt-4 border-t border-ora-200 pt-3">
        <p className="font-bold text-sm mb-2">الألوان — صورة مستقلة لكل لون</p>
        <div className="space-y-3">{newProduct.colors.map((color, colorIndex) => <div key={`new-color-${colorIndex}`} className="rounded-xl bg-white p-2">
          <div className="flex gap-2 items-center">
            <input className="field" value={color.name} onChange={(e) => updateNewColors(newProduct.colors.map((item, index) => index === colorIndex ? { ...item, name: e.target.value } : item))} placeholder="اسم اللون" />
            <button type="button" aria-label="حذف اللون" onClick={() => updateNewColors(newProduct.colors.filter((_, index) => index !== colorIndex))} className="p-2 text-red-500"><Trash2 size={15} /></button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-charcoal-500 cursor-pointer"><ImagePlus size={16} /> رفع صورة هذا اللون
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => readImages(e.target.files, (images) => updateNewColors(newProduct.colors.map((item, index) => index === colorIndex ? { ...item, image: images[0] || item.image, images } : item)))} />
          </label>
          {color.images?.length ? <div className="mt-2 flex gap-2 flex-wrap">{color.images.map((image) => <img key={image} src={image} alt={color.name || 'صورة اللون'} className="w-14 h-16 rounded-lg object-cover" />)}</div> : color.image && <img src={color.image} alt={color.name || 'صورة اللون'} className="mt-2 w-14 h-16 rounded-lg object-cover" />}
        </div>)}</div>
        <button type="button" onClick={() => updateNewColors([...newProduct.colors, { name: '', available: true, image: '', sizeAvailability: Object.fromEntries(newProduct.sizes.map((size) => [size.name, true])) }])} className="mt-2 text-xs text-ora-700">+ إضافة لون</button>
      </div>
<button 
  type="button" 
  onClick={addProduct} 
  disabled={saving || !newProduct.name.trim() || !newProduct.nameAr.trim() || !newProduct.colors.some((color) => color.name.trim() && color.image)}
  className="w-full mt-4 py-3 rounded-xl bg-[#2E3220] text-white font-bold shadow-md hover:bg-black transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
>
  {saving ? 'جارٍ الحفظ...' : 'إضافة المنتج للقائمة'}
</button>    </div>}
    {productSection === 'existing' && <div className="space-y-4">{draft.map((product, index) => {
      const sizes = product.sizes?.length ? product.sizes : [{ name: 'One Size', available: true }];
      const colors = product.colors?.length ? product.colors : product.images.map((item) => ({ name: item.color, available: true, image: item.img, images: [item.img], sizeAvailability: Object.fromEntries(sizes.map((size) => [size.name, size.available])) }));
      const setSizes = (next: Product['sizes']) => update(index, { sizes: next });
      const setColors = (next: Product['colors']) => update(index, { colors: next, images: next.flatMap((item) => (item.images?.length ? item.images : [item.image]).filter(Boolean).map((image) => ({ color: item.name, img: image }))) });
      return <div key={product.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) reorderProducts(from, index); }} className={`bg-white rounded-2xl p-4 shadow-sm transition-opacity ${draggedProductIndex === index ? 'opacity-50' : ''}`}>
        <div className="mb-3 flex items-center justify-between border-b border-ora-100 pb-2">
          <button type="button" draggable onDragStart={(event) => { setDraggedProductIndex(index); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); }} onDragEnd={() => setDraggedProductIndex(null)} aria-label={`اسحب لتغيير ترتيب ${product.nameAr || product.name}`} title="اسحب لتغيير الترتيب" className="cursor-grab touch-none rounded-md p-2 text-charcoal-500 active:cursor-grabbing"><GripVertical size={19} /></button>
          <div className="flex gap-1">
            <button type="button" disabled={index === 0} onClick={() => reorderProducts(index, index - 1)} aria-label="تحريك المنتج للأعلى" className="rounded-md p-2 text-charcoal-600 hover:bg-ora-100 disabled:opacity-30"><ChevronUp size={18} /></button>
            <button type="button" disabled={index === draft.length - 1} onClick={() => reorderProducts(index, index + 1)} aria-label="تحريك المنتج للأسفل" className="rounded-md p-2 text-charcoal-600 hover:bg-ora-100 disabled:opacity-30"><ChevronDown size={18} /></button>
            <button type="button" disabled={saving} onClick={() => void deleteProduct(product)} aria-label={`حذف المنتج ${product.nameAr || product.name}`} title="حذف المنتج" className="rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2"><input className="field" value={product.name} onChange={(e) => update(index, { name: e.target.value, category: e.target.value.trim() })} placeholder="اسم المنتج" /><input className="field" value={product.nameAr} onChange={(e) => update(index, { nameAr: e.target.value })} placeholder="الاسم بالعربي" /><input className="field" type="number" value={product.price || ''} onChange={(e) => update(index, { price: Number(e.target.value) })} placeholder="السعر بعد الخصم" /><input className="field" type="number" value={product.originalPrice || ''} onChange={(e) => update(index, { originalPrice: Number(e.target.value) })} placeholder="السعر قبل الخصم (اختياري)" /><select className="field" value={product.badge} onChange={(e) => update(index, { badge: e.target.value })} aria-label={`تصنيف ${product.name}`}>
          {product.badge && !productBadgeOptions.includes(product.badge) && <option value={product.badge}>{product.badge}</option>}
          {productBadgeOptions.map((badge) => <option key={badge} value={badge}>{badge || 'بدون شارة'}</option>)}
        </select></div>
        <label className="block text-xs text-charcoal-500 mt-3">نوع المنتج<input className="field mt-1" value={product.productType || ''} onChange={(e) => update(index, { productType: e.target.value })} placeholder="مثال: أطقم، بلايز، قمصان" /></label>
        <label className="block text-xs text-charcoal-500 mt-3">الموسم<select className="field mt-1" value={product.season || ''} onChange={(e) => update(index, { season: e.target.value as Product['season'] })}>{productSeasons.map((season) => <option key={season.value} value={season.value}>{season.label}</option>)}</select></label>
        <label className="block text-xs text-charcoal-500 mt-3">صورة عامة للمقاسات<input type="file" accept="image/*" className="field mt-1 text-xs" onChange={(e) => readImage(e.target.files?.[0], (image) => update(index, { image }))} /></label>
        <div className="mt-4 border-t pt-3"><p className="font-bold text-sm mb-2">المقاسات والنمر — متوفر / غير متوفر</p><div className="space-y-2">{sizes.map((size, sizeIndex) => <div key={`${size.name}-${sizeIndex}`} className="flex gap-2 items-center"><input className="field" value={size.name} onChange={(e) => setSizes(sizes.map((item, i) => i === sizeIndex ? { ...item, name: e.target.value } : item))} placeholder="مثال: M أو 38" /><button onClick={() => setSizes(sizes.map((item, i) => i === sizeIndex ? { ...item, available: !item.available } : item))} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${size.available ? 'availability-available' : 'availability-unavailable'}`}>{size.available ? 'متوفر' : 'غير متوفر'}</button></div>)}</div><button onClick={() => setSizes([...sizes, { name: '', available: true }])} className="mt-2 text-xs text-ora-700">+ إضافة نمرة</button></div>
        <div className="mt-4 border-t pt-3"><p className="font-bold text-sm mb-2">الألوان والصور والتوفر حسب النمرة</p><div className="space-y-3">{colors.map((color, colorIndex) => <div key={`${color.name}-${colorIndex}`} className="rounded-xl bg-ora-50 p-2"><div className="flex gap-2 items-center"><input className="field" value={color.name} onChange={(e) => setColors(colors.map((item, i) => i === colorIndex ? { ...item, name: e.target.value } : item))} placeholder="اسم اللون" /><button onClick={() => setColors(colors.map((item, i) => i === colorIndex ? { ...item, available: !item.available } : item))} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${color.available ? 'availability-available' : 'availability-unavailable'}`}>{color.available ? 'اللون متوفر' : 'اللون غير متوفر'}</button></div><div className="mt-2 flex flex-wrap gap-1.5">{sizes.map((size) => { const available = color.sizeAvailability?.[size.name] ?? (color.available && size.available); return <button key={size.name} onClick={() => setColors(colors.map((item, i) => i === colorIndex ? { ...item, sizeAvailability: { ...item.sizeAvailability, [size.name]: !available }, available: true } : item))} className={`rounded-lg px-2 py-1 text-xs ${available ? 'availability-available' : 'availability-unavailable'}`}>{size.name}: {available ? 'متوفر' : 'غير متوفر'}</button>; })}</div><label className="mt-2 flex items-center gap-2 text-xs text-charcoal-500 cursor-pointer"><ImagePlus size={16} /> رفع صور هذا اللون (اختياري)<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => readImages(e.target.files, (images) => setColors(colors.map((item, i) => i === colorIndex ? { ...item, image: images[0] || item.image, images: images.length ? images : item.images } : item)))} /></label>{(color.images?.length ? color.images : color.image ? [color.image] : []).map((image) => <img key={image} src={image} alt={color.name} className="mt-2 mr-2 inline-block w-14 h-16 rounded-lg object-cover" />)}</div>)}</div><button onClick={() => setColors([...colors, { name: '', available: true, image: product.image, images: product.image ? [product.image] : [], sizeAvailability: Object.fromEntries(sizes.map((size) => [size.name, true])) }])} className="mt-2 text-xs text-ora-700">+ إضافة لون</button></div>
      </div>;
    })}</div>}
    <button disabled={saving} onClick={() => void onSave()} className="w-full mt-6 py-4 rounded-xl bg-[#2E3220] text-white font-bold transition-opacity disabled:cursor-wait disabled:opacity-60">{saving ? 'جارٍ الحفظ...' : 'حفظ تعديلات المنتجات'}</button>
  </>;
}

function createEmptyProduct(id: number): Product {
  return {
    id,
    name: '',
    nameAr: '',
    category: '',
    productType: '',
    colorName: '',
    price: 0,
    originalPrice: 0,
    rating: 5,
    reviews: 0,
    badge: '',
    season: '',
    image: '',
    images: [],
    sizes: [{ name: '', available: true }],
    colors: [{ name: '', available: true, image: '', images: [] }],
  };
}

function readImage(file: File | undefined, onRead: (image: string) => void) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => optimizeImage(String(reader.result)).then(onRead).catch(() => onRead(String(reader.result)));
  reader.readAsDataURL(file);
}

function optimizeImage(dataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 1400;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/webp', 0.82));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function ContentTab({ draft, update, onSave }: { draft: SiteContent; update: (content: SiteContent) => void; onSave: () => void }) {
  const setHero = (change: Partial<SiteContent['hero']>) => update({ ...draft, hero: { ...draft.hero, ...change } });
  const setStory = (change: Partial<SiteContent['story']>) => update({ ...draft, story: { ...draft.story, ...change } });
  const setSeasonCopy = (change: Partial<SiteContent['shopSections']['seasons']>) => update({ ...draft, shopSections: { ...draft.shopSections, seasons: { ...draft.shopSections.seasons, ...change } } });
  const setTypeCopy = (change: Partial<SiteContent['shopSections']['types']>) => update({ ...draft, shopSections: { ...draft.shopSections, types: { ...draft.shopSections.types, ...change } } });
  const setCollection = (index: number, change: Partial<SiteContent['collections'][number]>) => update({ ...draft, collections: draft.collections.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item) });
  const imageField = (label: string, value: string, onChange: (value: string) => void) => <label className="block text-xs text-charcoal-500">{label}<input className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="رابط الصورة أو ارفع صورة" /><input type="file" accept="image/*" className="field mt-1 text-xs" onChange={(e) => readImage(e.target.files?.[0], onChange)} />{value && <img src={value} alt={label} className="mt-2 h-32 w-full rounded-xl object-cover" />}</label>;
  return <div className="space-y-5">
    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-lg">محتوى الهيرو</h3>
      <input className="field" value={draft.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} placeholder="النص الصغير" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2"><input className="field" value={draft.hero.titleLine1} onChange={(e) => setHero({ titleLine1: e.target.value })} placeholder="السطر الأول" /><input className="field" value={draft.hero.titleLine2} onChange={(e) => setHero({ titleLine2: e.target.value })} placeholder="السطر الثاني" /><input className="field" value={draft.hero.titleLine3} onChange={(e) => setHero({ titleLine3: e.target.value })} placeholder="السطر الثالث" /></div>
      <textarea className="field min-h-24 resize-y" value={draft.hero.description} onChange={(e) => setHero({ description: e.target.value })} placeholder="وصف الهيرو" />
      <div className="grid grid-cols-2 gap-2"><input className="field" value={draft.hero.primaryButton} onChange={(e) => setHero({ primaryButton: e.target.value })} placeholder="زر المجموعة" /><input className="field" value={draft.hero.secondaryButton} onChange={(e) => setHero({ secondaryButton: e.target.value })} placeholder="زر الفيديو" /></div>
      {imageField('الصورة الرئيسية', draft.hero.image, (image) => setHero({ image }))}
      {imageField('الصورة الثانوية', draft.hero.secondaryImage, (secondaryImage) => setHero({ secondaryImage }))}
    </div>
    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-lg">قسم ما قبل الفوتر</h3>
      <input className="field" value={draft.story.eyebrow} onChange={(e) => setStory({ eyebrow: e.target.value })} placeholder="العنوان الصغير" />
      <div className="grid grid-cols-2 gap-2"><input className="field" value={draft.story.title} onChange={(e) => setStory({ title: e.target.value })} placeholder="العنوان" /><input className="field" value={draft.story.highlight} onChange={(e) => setStory({ highlight: e.target.value })} placeholder="العنوان المميز" /></div>
      <textarea className="field min-h-24 resize-y" value={draft.story.description} onChange={(e) => setStory({ description: e.target.value })} placeholder="وصف القسم" />
      {imageField('الصورة الرئيسية للقسم', draft.story.image, (image) => setStory({ image }))}
      {imageField('الصورة الثانوية للقسم', draft.story.secondaryImage, (secondaryImage) => setStory({ secondaryImage }))}
      {draft.story.features.map((feature, index) => <div key={index} className="rounded-xl bg-ora-50 p-3 space-y-2"><input className="field" value={feature.title} onChange={(e) => setStory({ features: draft.story.features.map((item, i) => i === index ? { ...item, title: e.target.value } : item) })} placeholder={`عنوان الميزة ${index + 1}`} /><textarea className="field min-h-20 resize-y" value={feature.description} onChange={(e) => setStory({ features: draft.story.features.map((item, i) => i === index ? { ...item, description: e.target.value } : item) })} placeholder="تفاصيل الميزة" /></div>)}
    </div>
    <div className="rounded-2xl border border-ora-200 bg-ora-50/70 p-4 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-lg">نصوص تشكيلات الموسم</h3>
        <p className="text-xs text-charcoal-500">تظهر هذه النصوص في قسم الموسم مستقلة عن إعدادات الهيرو والمجموعات.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="field" value={draft.shopSections.seasons.kicker} onChange={(e) => setSeasonCopy({ kicker: e.target.value })} placeholder="العنوان الصغير" />
        <input className="field" value={draft.shopSections.seasons.title} onChange={(e) => setSeasonCopy({ title: e.target.value })} placeholder="عنوان القسم" />
        <input className="field" value={draft.shopSections.seasons.hint} onChange={(e) => setSeasonCopy({ hint: e.target.value })} placeholder="الوصف أسفل العنوان" />
        <input className="field" value={draft.shopSections.seasons.action} onChange={(e) => setSeasonCopy({ action: e.target.value })} placeholder="نص زر التصفح" />
        <input className="field" value={draft.shopSections.seasons.countSuffix} onChange={(e) => setSeasonCopy({ countSuffix: e.target.value })} placeholder="كلمة عدد القطع" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-ora-200 pt-3">
        <input className="field" value={draft.shopSections.seasons.winterTitle} onChange={(e) => setSeasonCopy({ winterTitle: e.target.value })} placeholder="عنوان الشتوي" />
        <input className="field" value={draft.shopSections.seasons.winterDescription} onChange={(e) => setSeasonCopy({ winterDescription: e.target.value })} placeholder="وصف الشتوي" />
        <input className="field" value={draft.shopSections.seasons.summerTitle} onChange={(e) => setSeasonCopy({ summerTitle: e.target.value })} placeholder="عنوان الصيفي" />
        <input className="field" value={draft.shopSections.seasons.summerDescription} onChange={(e) => setSeasonCopy({ summerDescription: e.target.value })} placeholder="وصف الصيفي" />
        <input className="field" value={draft.shopSections.seasons.autumnTitle} onChange={(e) => setSeasonCopy({ autumnTitle: e.target.value })} placeholder="عنوان الخريفي" />
        <input className="field" value={draft.shopSections.seasons.autumnDescription} onChange={(e) => setSeasonCopy({ autumnDescription: e.target.value })} placeholder="وصف الخريفي" />
      </div>
    </div>
    <div className="rounded-2xl border border-ora-200 bg-ora-50/70 p-4 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold text-lg">نصوص أنواع القطع</h3>
        <p className="text-xs text-charcoal-500">إعداد مستقل لعنوان بطاقات الأطقم والبلايز والقمصان وزرها.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="field" value={draft.shopSections.types.kicker} onChange={(e) => setTypeCopy({ kicker: e.target.value })} placeholder="العنوان الصغير" />
        <input className="field" value={draft.shopSections.types.title} onChange={(e) => setTypeCopy({ title: e.target.value })} placeholder="عنوان القسم" />
        <input className="field" value={draft.shopSections.types.action} onChange={(e) => setTypeCopy({ action: e.target.value })} placeholder="نص زر التصفح" />
        <input className="field" value={draft.shopSections.types.countSuffix} onChange={(e) => setTypeCopy({ countSuffix: e.target.value })} placeholder="كلمة عدد القطع" />
      </div>
    </div>
    <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-bold text-lg">ORA Collections</h3>
      <p className="text-xs text-charcoal-500">غيّر اسم الكوليكشن والصورة والوصف الذي يظهر على البطاقات.</p>
      {draft.collections.map((collection, index) => <div key={index} className="rounded-xl bg-ora-50 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input className="field" value={collection.title} onChange={(e) => setCollection(index, { title: e.target.value })} placeholder="الاسم الإنجليزي" />
          <input className="field" value={collection.titleAr} onChange={(e) => setCollection(index, { titleAr: e.target.value })} placeholder="الاسم العربي" />
        </div>
        <input className="field" value={collection.subtitle} onChange={(e) => setCollection(index, { subtitle: e.target.value })} placeholder="وصف الكوليكشن" />
        <input className="field" value={collection.items} onChange={(e) => setCollection(index, { items: e.target.value })} placeholder="المقاسات الظاهرة، مثال: S-M-L-XL" />
        {imageField(`صورة الكوليكشن ${index + 1}`, collection.image, (image) => setCollection(index, { image }))}
      </div>)}
    </div>
    <button onClick={onSave} className="w-full py-4 rounded-xl bg-[#2E3220] text-white font-bold">حفظ محتوى الموقع</button>
  </div>;
}

const orderStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'جديد' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'postponed', label: 'مؤجل' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'exchanged', label: 'مبدل' },
];

function englishDigits(value: string | number) {
  return String(value).replace(/[٠-٩۰-۹]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit) >= 0 ? '٠١٢٣٤٥٦٧٨٩'.indexOf(digit) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function formatOrderNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatOrderMoney(value: number) {
  return `₪${formatOrderNumber(value)}`;
}

function getOrderAmounts(order: Order) {
  const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discount || 0;
  const deliveryFee = order.deliveryFee ?? Math.max(0, order.total - subtotal + discount);
  return { subtotal, discount, deliveryFee };
}

function OrdersTab({ orders, loading, password, onOrdersChange, onError }: { orders: Order[]; loading: boolean; password: string; onOrdersChange: Dispatch<SetStateAction<Order[]>>; onError: (message: string) => void }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState('');
  const categories = useMemo(() => [...new Set(orders.flatMap((order) => order.items.map((item) => item.name)))], [orders]);
  const filtered = useMemo(() => orders.filter((order) => {
    const date = new Date(order.createdAt);
    const matchesMonth = !month || order.createdAt.slice(0, 7) === month;
    const matchesDay = !day || order.createdAt.slice(0, 10) === day;
    const matchesCategory = !category || order.items.some((item) => item.name === category);
    return date.toString() !== 'Invalid Date' && matchesMonth && matchesDay && matchesCategory;
  }), [orders, month, day, category]);

  const download = () => {
    const headers = ['التاريخ', 'الاسم', 'الهاتف', 'الموقع', 'المنطقة', 'حالة الطلب', 'تفاصيل المنتجات', 'مجموع المنتجات', 'كود الخصم', 'قيمة الخصم', 'رسوم التوصيل', 'الإجمالي'];
    const rows = filtered.map((order) => {
      const amounts = getOrderAmounts(order);
      return [
        formatOrderDate(order.createdAt),
        order.customer.name,
        englishDigits(order.customer.phone),
        order.customer.address,
        order.region,
        orderStatusOptions.find((status) => status.value === (order.status || 'new'))?.label || 'جديد',
        order.items.map((item) => `${item.name} - ${item.color}${item.size ? ` - ${item.size}` : ''} × ${englishDigits(item.quantity)} @ ${formatOrderMoney(item.price)} = ${formatOrderMoney(item.price * item.quantity)}`).join(' | '),
        formatOrderMoney(amounts.subtotal),
        order.promoCode || '-',
        formatOrderMoney(amounts.discount),
        formatOrderMoney(amounts.deliveryFee),
        formatOrderMoney(order.total),
      ];
    });
    const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `ora-orders-${month || day || 'all'}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const changeStatus = async (order: Order, status: OrderStatus) => {
    onError('');
    try {
      await updateOrderStatusInApi(order.id, status, password);
      onOrdersChange((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
    } catch {
      onError('تعذر تحديث حالة الطلب. حاول مرة أخرى.');
    }
  };

  const removeOrder = async (order: Order) => {
    if (!window.confirm(`هل تريد حذف طلب ${order.customer.name}؟`)) return;
    onError('');
    try {
      await deleteOrderFromApi(order.id, password);
      onOrdersChange((current) => current.filter((item) => item.id !== order.id));
    } catch {
      onError('تعذر حذف الطلب. حاول مرة أخرى.');
    }
  };

  const removeAllOrders = async () => {
    if (!orders.length || !window.confirm(`سيتم حذف جميع الطلبات (${formatOrderNumber(orders.length)}). هل تريد المتابعة؟`)) return;
    onError('');
    try {
      await deleteAllOrdersFromApi(password);
      onOrdersChange([]);
    } catch {
      onError('تعذر حذف الطلبات. حاول مرة أخرى.');
    }
  };

  return <div>
    <div className="grid grid-cols-2 gap-2 mb-3"><label className="text-xs text-charcoal-500">حسب الشهر<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field mt-1" /></label><label className="text-xs text-charcoal-500">حسب اليوم<input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="field mt-1" /></label></div>
    <label className="text-xs text-charcoal-500">حسب الصنف<select value={category} onChange={(e) => setCategory(e.target.value)} className="field mt-1"><option value="">كل الأصناف</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-2 mt-4">
      <button onClick={download} disabled={!filtered.length} className="py-3 rounded-xl bg-ora-700 text-white font-bold flex gap-2 justify-center items-center text-xs sm:text-sm hover:bg-[#2e3220] disabled:opacity-40"><Download size={17} /> تنزيل ملف Excel</button>
      <button onClick={() => void removeAllOrders()} disabled={!orders.length} className="py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold flex gap-2 justify-center items-center text-xs sm:text-sm hover:bg-red-100 disabled:opacity-40"><Trash2 size={17} /> حذف كل الطلبات</button>
    </div>
    {loading ? <p className="text-center py-10 text-charcoal-500">جاري تحميل الطلبات...</p> : !filtered.length ? <p className="text-center py-10 text-charcoal-500">لا توجد طلبات مطابقة</p> : <div className="space-y-3 mt-5">{filtered.map((order) => {
      const amounts = getOrderAmounts(order);
      const status = order.status || 'new';
      return <article key={order.id} className="bg-white rounded-2xl p-4 shadow-sm text-sm">
        <div className="flex items-start justify-between gap-3 font-bold"><span className="min-w-0">{order.customer.name}</span><span className="shrink-0">{formatOrderMoney(order.total)}</span></div>
        <p className="text-xs text-charcoal-500 mt-1">{formatOrderDate(order.createdAt)}</p>
        <p className="mt-2">{englishDigits(order.customer.phone)} · {order.region}</p>
        <p className="text-charcoal-500">{order.customer.address}</p>
        <div className="mt-3 space-y-2 border-t border-ora-100 pt-3">
          {order.items.map((item, index) => <div key={`${item.id}-${item.size}-${index}`} className="flex justify-between gap-3 text-xs">
            <span className="min-w-0">{item.name}{item.color ? ` · ${item.color}` : ''}{item.size ? ` · ${item.size}` : ''} × {englishDigits(item.quantity)} <span className="text-charcoal-500">({formatOrderMoney(item.price)} للقطعة)</span></span>
            <b className="shrink-0">{formatOrderMoney(item.price * item.quantity)}</b>
          </div>)}
        </div>
        <div className="mt-3 space-y-1 border-t border-ora-100 pt-3 text-xs">
          <div className="flex justify-between"><span>مجموع المنتجات</span><span>{formatOrderMoney(amounts.subtotal)}</span></div>
          {amounts.discount ? <div className="flex justify-between text-green-700"><span>الخصم{order.promoCode ? ` (${order.promoCode})` : ''}</span><span>-{formatOrderMoney(amounts.discount)}</span></div> : order.promoCode ? <div className="flex justify-between"><span>كود الخصم</span><span>{order.promoCode}</span></div> : null}
          <div className="flex justify-between"><span>رسوم التوصيل</span><span>{formatOrderMoney(amounts.deliveryFee)}</span></div>
          <div className="flex justify-between border-t border-ora-100 pt-2 font-bold"><span>الإجمالي</span><span>{formatOrderMoney(order.total)}</span></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor={`order-status-${order.id}`} className="shrink-0 text-xs font-semibold">حالة الطلب</label>
          <select id={`order-status-${order.id}`} value={status} onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)} className="field min-w-0 flex-1 py-2 text-xs">
            {orderStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={() => void removeOrder(order)} aria-label={`حذف طلب ${order.customer.name}`} title="حذف الطلب" className="shrink-0 rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"><Trash2 size={17} /></button>
        </div>
      </article>;
    })}</div>}
  </div>;
}
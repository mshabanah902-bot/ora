import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Download, ImagePlus, LockKeyhole, Plus, Settings, Trash2, X } from 'lucide-react';
import type { Product } from '../data/products';
import type { SiteContent } from '../data/siteContent';
import { loadOrders as loadOrdersFromSupabase } from '../lib/api';
type OrderItem = { id: number; name: string; color: string; price: number; quantity: number };
type Order = {
  customer: { name: string; phone: string; address: string };
  region: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

type Tab = 'products' | 'orders' | 'settings';

export default function AdminPanel({ products, onSave, siteContent, onSaveSiteContent }: { products: Product[]; onSave: (products?: Product[]) => Promise<void>; siteContent: SiteContent; onSaveSiteContent: (content: SiteContent) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('products');
  const [draft, setDraft] = useState<Product[]>(products);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [contentDraft, setContentDraft] = useState<SiteContent>(siteContent);

  const login = async () => {
    if (password !== 'ora123') return;
    setAuthenticated(true);
    setDraft(products);
    setContentDraft(siteContent);
    await loadOrders();
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      setOrders(await loadOrdersFromSupabase() as unknown as Order[]);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // تعريف دالة قراءة الصور بشكل مستقل وصحيح
  const readImages = (files: FileList | null, onRead: (images: string[]) => void) => {
    if (!files?.length) return;
    Promise.all(Array.from(files).map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }))).then(onRead).catch(() => undefined);
  };

const save = async (productsToSave?: Product[]) => {
    try {
      await onSave(productsToSave || draft);
    } catch {
      return;
    }
    if (!productsToSave) setOpen(false);
  };
  const saveContent = async () => {
    try { await onSaveSiteContent(contentDraft); } catch { return; }
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
                  <input autoFocus value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} type="password" placeholder="كلمة المرور" className="field max-w-xs" />
                  <button onClick={login} className="mt-3 px-8 py-3 rounded-xl bg-[#2E3220] text-white">دخول</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">لوحة الإدارة</h2>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button onClick={() => setTab('products')} className={`py-3 rounded-xl font-semibold transition-all ${tab === 'products' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>المنتجات</button>
                    <button onClick={() => { setTab('orders'); void loadOrders(); }} className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${tab === 'orders' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}><ClipboardList size={17} /> الطلبات</button>
                    <button onClick={() => setTab('settings')} className={`py-3 rounded-xl font-semibold transition-all ${tab === 'settings' ? 'bg-[#2E3220] text-white' : 'bg-white'}`}>المحتوى</button>
                  </div>
                  {tab === 'products' ? <ProductsTab draft={draft} update={update} onDraftChange={setDraft} onSave={save} readImages={readImages} /> : tab === 'orders' ? <OrdersTab orders={orders} loading={ordersLoading} /> : <ContentTab draft={contentDraft} update={setContentDraft} onSave={saveContent} />}
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

function ProductsTab({ draft, update, onDraftChange, onSave, readImages }: { draft: Product[]; update: (index: number, change: Partial<Product>) => void; onDraftChange: Dispatch<SetStateAction<Product[]>>; onSave: (products?: Product[]) => Promise<void>; readImages: (files: FileList | null, onRead: (images: string[]) => void) => void }) {
  const [newProduct, setNewProduct] = useState<Product>(() => createEmptyProduct(1));
  const [productSection, setProductSection] = useState<'add' | 'existing'>('add');
  const nextId = useMemo(() => draft.reduce((highest, product) => Math.max(highest, product.id), 0) + 1, [draft]);

  const updateNewProduct = (change: Partial<Product>) => setNewProduct((current) => ({ ...current, ...change }));
  const updateNewSizes = (sizes: Product['sizes']) => updateNewProduct({ sizes });
  const updateNewColors = (colors: Product['colors']) => updateNewProduct({
    colors,
    images: colors.flatMap((color) => (color.images?.length ? color.images : [color.image]).filter(Boolean).map((image) => ({ color: color.name, img: image }))),
    image: colors.find((color) => color.image)?.image || newProduct.image,
  });
  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.nameAr.trim() || !newProduct.colors.some((color) => color.name.trim() && color.image)) return;
    const product = { ...newProduct, id: nextId, image: newProduct.colors.find((color) => color.image)?.image || newProduct.image };
    const nextProducts = [...draft, product];
    onDraftChange(nextProducts);
    void onSave(nextProducts);
    setNewProduct(createEmptyProduct(nextId + 1));
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
        <input className="field" value={newProduct.category} onChange={(e) => updateNewProduct({ category: e.target.value })} placeholder="الصنف" />
        <input className="field" value={newProduct.badge} onChange={(e) => updateNewProduct({ badge: e.target.value })} placeholder="شارة المنتج (اختياري)" />
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
  disabled={!newProduct.name.trim() || !newProduct.nameAr.trim() || !newProduct.colors.some((color) => color.name.trim() && color.image)} 
  className="w-full mt-4 py-3 rounded-xl bg-[#2E3220] text-white font-bold shadow-md hover:bg-black transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
>
  إضافة المنتج للقائمة
</button>    </div>}
    {productSection === 'existing' && <div className="space-y-4">{draft.map((product, index) => {
      const sizes = product.sizes?.length ? product.sizes : [{ name: 'One Size', available: true }];
      const colors = product.colors?.length ? product.colors : product.images.map((item) => ({ name: item.color, available: true, image: item.img, sizeAvailability: Object.fromEntries(sizes.map((size) => [size.name, size.available])) }));
      const setSizes = (next: Product['sizes']) => update(index, { sizes: next });
      const setColors = (next: Product['colors']) => update(index, { colors: next, images: next.map((item) => ({ color: item.name, img: item.image })) });
      return <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2"><input className="field" value={product.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="اسم المنتج" /><input className="field" value={product.nameAr} onChange={(e) => update(index, { nameAr: e.target.value })} placeholder="الاسم بالعربي" /><input className="field" type="number" value={product.price} onChange={(e) => update(index, { price: Number(e.target.value) })} placeholder="السعر" /><input className="field" value={product.category} onChange={(e) => update(index, { category: e.target.value })} placeholder="الصنف" /></div>
        <label className="block text-xs text-charcoal-500 mt-3">صورة عامة للمقاسات<input type="file" accept="image/*" className="field mt-1 text-xs" onChange={(e) => readImage(e.target.files?.[0], (image) => update(index, { image }))} /></label>
        <div className="mt-4 border-t pt-3"><p className="font-bold text-sm mb-2">المقاسات والنمر — متوفر / غير متوفر</p><div className="space-y-2">{sizes.map((size, sizeIndex) => <div key={`${size.name}-${sizeIndex}`} className="flex gap-2 items-center"><input className="field" value={size.name} onChange={(e) => setSizes(sizes.map((item, i) => i === sizeIndex ? { ...item, name: e.target.value } : item))} placeholder="مثال: M أو 38" /><button onClick={() => setSizes(sizes.map((item, i) => i === sizeIndex ? { ...item, available: !item.available } : item))} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${size.available ? 'availability-available' : 'availability-unavailable'}`}>{size.available ? 'متوفر' : 'غير متوفر'}</button></div>)}</div><button onClick={() => setSizes([...sizes, { name: '', available: true }])} className="mt-2 text-xs text-ora-700">+ إضافة نمرة</button></div>
        <div className="mt-4 border-t pt-3"><p className="font-bold text-sm mb-2">الألوان والصور والتوفر حسب النمرة</p><div className="space-y-3">{colors.map((color, colorIndex) => <div key={`${color.name}-${colorIndex}`} className="rounded-xl bg-ora-50 p-2"><div className="flex gap-2 items-center"><input className="field" value={color.name} onChange={(e) => setColors(colors.map((item, i) => i === colorIndex ? { ...item, name: e.target.value } : item))} placeholder="اسم اللون" /><button onClick={() => setColors(colors.map((item, i) => i === colorIndex ? { ...item, available: !item.available } : item))} className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${color.available ? 'availability-available' : 'availability-unavailable'}`}>{color.available ? 'اللون متوفر' : 'اللون غير متوفر'}</button></div><div className="mt-2 flex flex-wrap gap-1.5">{sizes.map((size) => { const available = color.sizeAvailability?.[size.name] ?? (color.available && size.available); return <button key={size.name} onClick={() => setColors(colors.map((item, i) => i === colorIndex ? { ...item, sizeAvailability: { ...item.sizeAvailability, [size.name]: !available }, available: true } : item))} className={`rounded-lg px-2 py-1 text-xs ${available ? 'availability-available' : 'availability-unavailable'}`}>{size.name}: {available ? 'متوفر' : 'غير متوفر'}</button>; })}</div><label className="mt-2 flex items-center gap-2 text-xs text-charcoal-500 cursor-pointer"><ImagePlus size={16} /> رفع صورة هذا اللون<input type="file" accept="image/*" className="hidden" onChange={(e) => readImage(e.target.files?.[0], (image) => setColors(colors.map((item, i) => i === colorIndex ? { ...item, image } : item)))} /></label>{color.image && <img src={color.image} alt={color.name} className="mt-2 w-14 h-16 rounded-lg object-cover" />}</div>)}</div><button onClick={() => setColors([...colors, { name: '', available: true, image: product.image, sizeAvailability: Object.fromEntries(sizes.map((size) => [size.name, true])) }])} className="mt-2 text-xs text-ora-700">+ إضافة لون</button></div>
      </div>;
    })}</div>}
    <button onClick={() => void onSave()} className="w-full mt-6 py-4 rounded-xl bg-[#2E3220] text-white font-bold">حفظ تعديلات المنتجات</button>
  </>;
}

function createEmptyProduct(id: number): Product {
  return {
    id,
    name: '',
    nameAr: '',
    category: '',
    colorName: '',
    price: 0,
    originalPrice: 0,
    rating: 5,
    reviews: 0,
    badge: '',
    image: '',
    images: [],
    sizes: [{ name: '', available: true }],
    colors: [{ name: '', available: true, image: '', images: [] }],
  };
}

function readImage(file: File | undefined, onRead: (image: string) => void) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onRead(String(reader.result));
  reader.readAsDataURL(file);
}

function ContentTab({ draft, update, onSave }: { draft: SiteContent; update: (content: SiteContent) => void; onSave: () => void }) {
  const setHero = (change: Partial<SiteContent['hero']>) => update({ ...draft, hero: { ...draft.hero, ...change } });
  const setStory = (change: Partial<SiteContent['story']>) => update({ ...draft, story: { ...draft.story, ...change } });
  const setCollection = (index: number, change: Partial<SiteContent['collections'][number]>) => update({ ...draft, collections: draft.collections.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item) });
  const imageField = (label: string, value: string, onChange: (value: string) => void) => <label className="block text-xs text-charcoal-500">{label}<input className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)} placeholder="رابط الصورة أو ارفع صورة" /><input type="file" accept="image/*" className="field mt-1 text-xs" onChange={(e) => readImage(e.target.files?.[0], onChange)} /></label>;
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

function OrdersTab({ orders, loading }: { orders: Order[]; loading: boolean }) {
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
    const headers = ['التاريخ', 'الاسم', 'الهاتف', 'الموقع', 'المنطقة', 'الأصناف', 'الإجمالي'];
    const rows = filtered.map((order) => [
      new Date(order.createdAt).toLocaleString('ar-PS'),
      order.customer.name,
      order.customer.phone,
      order.customer.address,
      order.region,
      order.items.map((item) => `${item.name} - ${item.color} × ${item.quantity}`).join(' | '),
      `₪${order.total}`,
    ]);
const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `ora-orders-${month || day || 'all'}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <div>
    <div className="grid grid-cols-2 gap-2 mb-3"><label className="text-xs text-charcoal-500">حسب الشهر<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field mt-1" /></label><label className="text-xs text-charcoal-500">حسب اليوم<input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="field mt-1" /></label></div>
    <label className="text-xs text-charcoal-500">حسب الصنف<select value={category} onChange={(e) => setCategory(e.target.value)} className="field mt-1"><option value="">كل الأصناف</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    <button onClick={download} disabled={!filtered.length} className="w-full mt-4 py-3 rounded-xl bg-ora-600 text-white font-bold flex gap-2 justify-center items-center disabled:opacity-40"><Download size={17} /> تنزيل الطلبات كملف Excel</button>
    {loading ? <p className="text-center py-10 text-charcoal-500">جاري تحميل الطلبات...</p> : !filtered.length ? <p className="text-center py-10 text-charcoal-500">لا توجد طلبات مطابقة</p> : <div className="space-y-3 mt-5">{filtered.slice().reverse().map((order, index) => <div key={`${order.createdAt}-${index}`} className="bg-white rounded-2xl p-4 shadow-sm text-sm"><div className="flex justify-between font-bold"><span>{order.customer.name}</span><span>₪{order.total}</span></div><p className="text-xs text-charcoal-500 mt-1">{new Date(order.createdAt).toLocaleString('ar-PS')}</p><p className="mt-2">{order.customer.phone} · {order.region}</p><p className="text-charcoal-500">{order.items.map((item) => `${item.name} × ${item.quantity}`).join('، ')}</p></div>)}</div>}
  </div>;
}
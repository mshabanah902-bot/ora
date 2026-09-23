import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import type { Product } from '../data/products';
import { saveOrder } from '../lib/api';
import { useLanguage } from '../i18n';

export type CartItem = Product & { quantity: number; selectedColor: string; selectedSize: string; lineId: string };
const delivery = { الضفة: 20, القدس: 30, الداخل: 70 };
const getSelectedSize = (item: CartItem) => item.selectedSize || item.lineId.split(':').slice(2).join(':') || 'غير محددة';

export default function CartDrawer({ open, items, onClose, onChange, onClear }: { open: boolean; items: CartItem[]; onClose: () => void; onChange: (lineId: string, delta: number) => void; onClear: () => void }) {
  const { language, t } = useLanguage();
  const [region, setRegion] = useStateRegion();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + delivery[region];
  const confirmOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address || !items.length) return;
    const order = { customer, region, items: items.map((item) => ({ id: item.id, name: item.name, color: item.selectedColor, size: getSelectedSize(item), price: item.price, quantity: item.quantity })), total };
    try { await saveOrder(order); } catch { return; }
    const text = [
      'طلب جديد من ORA',
      `الاسم: ${customer.name}`,
      `الهاتف: ${customer.phone}`,
      `الموقع: ${customer.address}`,
      `المنطقة: ${region}`,
      ...items.map((item) => `المنتج: ${item.name} | اللون: ${item.selectedColor} | النمرة: ${getSelectedSize(item)} | الكمية: ${item.quantity} | المجموع: ₪${item.price * item.quantity}`),
      `التوصيل: ₪${delivery[region]}`,
      `الإجمالي: ₪${total}`,
    ].join('\n');
    window.location.href = `https://wa.me/970595203078?text=${encodeURIComponent(text)}`;
    onClear(); onClose();
  };
  return <AnimatePresence>{open && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" /><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26 }} dir="rtl" className="fixed top-0 right-0 h-full w-full max-w-md bg-[#faf8f5] z-[61] shadow-2xl p-5 sm:p-7 overflow-y-auto">
    <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">{language === 'he' ? t('cart') : 'سلة المشتريات'}</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-ora-100"><X /></button></div>
    {!items.length ? <p className="text-center py-16 text-charcoal-500">{language === 'he' ? 'הסל ריק כרגע' : 'السلة فارغة حاليًا'}</p> : <><div className="space-y-4">{items.map((item) => <div key={item.lineId} className="flex gap-3 items-center bg-white rounded-2xl p-3 shadow-sm"><img src={item.image} className="w-16 h-20 object-cover rounded-xl" /><div className="flex-1"><b>{item.name}</b><p className="text-xs text-charcoal-500">اللون: {item.selectedColor}</p><p className="text-xs text-charcoal-500">النمرة: {getSelectedSize(item)}</p><p className="text-xs text-charcoal-500">₪{item.price}</p><div className="flex items-center gap-2 mt-2"><button onClick={() => onChange(item.lineId, -1)} className="p-1 rounded-full bg-ora-100"><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => onChange(item.lineId, 1)} className="p-1 rounded-full bg-ora-100"><Plus size={14} /></button></div></div><button onClick={() => onChange(item.lineId, -item.quantity)} className="text-red-400"><Trash2 size={17} /></button></div>)}</div>
      <div className="mt-8"><p className="text-xs font-light text-charcoal-500 mb-3">{language === 'he' ? t('delivery') : 'رسوم التوصيل حسب المنطقة'}</p><div className="grid grid-cols-3 gap-2">{Object.entries(delivery).map(([name, price]) => <button key={name} onClick={() => setRegion(name as keyof typeof delivery)} className={`rounded-xl border py-3 text-sm transition-all ${region === name ? 'border-ora-600 bg-ora-100 shadow-md' : 'border-charcoal-200 bg-white'}`}><span className="block">{language === 'he' ? ({ الضفة: t('westBank'), القدس: t('jerusalem'), الداخل: t('inside') }[name as keyof typeof delivery]) : name}</span><b>₪{price}</b></button>)}</div>
        <div className="space-y-3 mt-5"><input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder={language === 'he' ? t('name') : 'الاسم الكامل'} className="field" /><input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder={language === 'he' ? t('phone') : 'رقم الهاتف'} type="tel" className="field" /><textarea value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder={language === 'he' ? t('address') : 'الموقع / العنوان'} className="field min-h-20 resize-none" /></div>
        <div className="flex justify-between font-bold text-lg mt-5 border-t pt-4"><span>{language === 'he' ? t('total') : 'الإجمالي'}</span><span>₪{total}</span></div><button disabled={!customer.name || !customer.phone || !customer.address} onClick={confirmOrder} className="w-full mt-4 py-4 rounded-xl bg-[#2E3220] text-white font-bold disabled:opacity-40 hover:bg-ora-800 transition-all">{language === 'he' ? t('confirm') : 'تأكيد الطلب عبر واتساب'}</button>
      </div></>}
  </motion.aside></>}</AnimatePresence>;
}

function useStateRegion() {
  const [region, setRegion] = useState<keyof typeof delivery>('الضفة');
  return [region, setRegion] as const;
}

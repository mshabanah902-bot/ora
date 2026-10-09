import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import AnimatedActionButton from './AnimatedActionButton';
import type { Product } from '../data/products';
import { saveOrder } from '../lib/api';
import { translateProductColor, useLanguage } from '../i18n';
import { getOptimizedImageUrl } from '../lib/imageUrl';

export type CartItem = Product & { quantity: number; selectedColor: string; selectedSize: string; lineId: string };
const delivery = { الضفة: 20, القدس: 30, الداخل: 70 };
const getSelectedSize = (item: CartItem) => item.selectedSize || item.lineId.split(':').slice(2).join(':') || 'غير محددة';

export default function CartDrawer({ open, items, onClose, onChange, onClear }: { open: boolean; items: CartItem[]; onClose: () => void; onChange: (lineId: string, delta: number) => void; onClear: () => void }) {
  const { language, t } = useLanguage();
  const [region, setRegion] = useStateRegion();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = subtotal - discount + delivery[region];
  const applyCoupon = () => {
    if (couponInput.trim().toLocaleLowerCase() === 'ora.10') {
      setCouponApplied(true);
      setCouponMessage(t('couponSuccess'));
    } else {
      setCouponApplied(false);
      setCouponMessage(t('couponInvalid'));
    }
  };
  const confirmOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address || !items.length) return false;
    const order = { customer, region, items: items.map((item) => ({ id: item.id, name: item.name, color: item.selectedColor, size: getSelectedSize(item), price: item.price, quantity: item.quantity })), subtotal, discount, promoCode: couponApplied ? 'ora.10' : '', deliveryFee: delivery[region], total };
    try { await saveOrder(order); } catch { return false; }
    const regionName = { الضفة: t('westBank'), القدس: t('jerusalem'), الداخل: t('inside') }[region];
    const text = [
      t('orderHeading'),
      `${t('name')}: ${customer.name}`,
      `${t('phone')}: ${customer.phone}`,
      `${t('address')}: ${customer.address}`,
      `${t('region')}: ${regionName}`,
      ...items.map((item) => `${t('productLabel')}: ${language === 'ar' ? item.nameAr : item.name} | ${t('color')}: ${translateProductColor(item.selectedColor, language)} | ${t('size')}: ${getSelectedSize(item)} | ${t('quantity')}: ${item.quantity} | ${t('lineTotal')}: ₪${item.price * item.quantity}`),
      `${t('subtotal')}: ₪${subtotal}`,
      ...(couponApplied ? [`ora.10 | ${t('couponDiscount')}: ₪${discount}`] : []),
      `${t('deliveryFee')}: ₪${delivery[region]}`,
      `${t('total')}: ₪${total}`,
    ].join('\n');
    return `https://wa.me/970595203078?text=${encodeURIComponent(text)}`;
  };
  return <AnimatePresence>{open && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60]" /><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26 }} dir={language === 'en' ? 'ltr' : 'rtl'} className="fixed top-0 right-0 h-full w-full max-w-md bg-[#faf8f5] z-[61] shadow-2xl p-5 sm:p-7 overflow-y-auto">
    <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">{t('cart')}</h2><button onClick={onClose} className="p-2 rounded-full hover:bg-ora-100" aria-label={t('close')}><X /></button></div>
    {!items.length ? <p className="text-center py-16 text-charcoal-500">{t('emptyCart')}</p> : <><div className="space-y-4">{items.map((item) => <div key={item.lineId} className="flex gap-3 items-center bg-white rounded-xl p-3 shadow-sm"><img src={getOptimizedImageUrl(item.image, 240)} alt={language === 'ar' ? item.nameAr : item.name} className="w-16 h-20 shrink-0 object-cover rounded-lg" loading="lazy" decoding="async" /><div className="min-w-0 flex-1"><b className="block truncate">{language === 'ar' ? item.nameAr : item.name}</b><p className="text-xs text-charcoal-500">{t('color')}: {translateProductColor(item.selectedColor, language)}</p><p className="text-xs text-charcoal-500">{t('size')}: {getSelectedSize(item)}</p><p className="text-xs text-charcoal-500">₪{item.price}</p><div className="flex items-center gap-2 mt-2"><button aria-label={t('decreaseQuantity')} onClick={() => onChange(item.lineId, -1)} className="p-1 rounded-full bg-ora-100"><Minus size={14} /></button><span>{item.quantity}</span><button aria-label={t('increaseQuantity')} onClick={() => onChange(item.lineId, 1)} className="p-1 rounded-full bg-ora-100"><Plus size={14} /></button></div></div><button aria-label={t('removeItem')} onClick={() => onChange(item.lineId, -item.quantity)} className="shrink-0 text-red-400"><Trash2 size={17} /></button></div>)}</div>
      <div className="mt-8"><p className="text-xs font-light text-charcoal-500 mb-3">{t('delivery')}</p><div className="grid grid-cols-3 gap-2">{Object.entries(delivery).map(([name, price]) => <button key={name} onClick={() => setRegion(name as keyof typeof delivery)} className={`rounded-lg border py-3 text-sm transition-all ${region === name ? 'border-ora-600 bg-ora-100 shadow-md' : 'border-charcoal-200 bg-white'}`}><span className="block">{({ الضفة: t('westBank'), القدس: t('jerusalem'), الداخل: t('inside') }[name as keyof typeof delivery])}</span><b>₪{price}</b></button>)}</div>
        <div className="space-y-3 mt-5"><input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder={t('name')} className="field" /><input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder={t('phone')} type="tel" className="field" /><textarea value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder={t('address')} className="field min-h-20 resize-none" /></div>
        <div className="mt-5 flex gap-2"><input value={couponInput} onChange={(e) => { setCouponInput(e.target.value); setCouponApplied(false); setCouponMessage(''); }} placeholder={t('couponPlaceholder')} className="field min-w-0" /><button type="button" onClick={applyCoupon} className="shrink-0 rounded-lg border border-ora-600 px-4 text-sm font-bold text-ora-800 hover:bg-ora-100">{t('applyCoupon')}</button></div>
        {couponMessage && <p className={`mt-2 text-sm ${couponApplied ? 'text-green-700' : 'text-red-600'}`} role="status">{couponMessage}</p>}
        <div className="mt-5 space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>{t('subtotal')}</span><span>₪{subtotal}</span></div>{couponApplied && <div className="flex justify-between text-green-700"><span>{t('couponDiscount')}</span><span>-₪{discount}</span></div>}<div className="flex justify-between text-charcoal-500"><span>{t('deliveryFee')}</span><span>₪{delivery[region]}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold"><span>{t('total')}</span><span>₪{total}</span></div></div><AnimatedActionButton disabled={!customer.name || !customer.phone || !customer.address} onAction={confirmOrder} onSuccess={(result) => { if (typeof result !== 'string') return; window.location.href = result; onClear(); onClose(); }} icon={<ShoppingBag size={18} />} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2E3220] py-4 font-bold text-white transition-all hover:bg-ora-800 disabled:opacity-40">{t('confirm')}</AnimatedActionButton>
      </div></>}
  </motion.aside></>}</AnimatePresence>;
}

function useStateRegion() {
  const [region, setRegion] = useState<keyof typeof delivery>('الضفة');
  return [region, setRegion] as const;
}

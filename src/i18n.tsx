import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'ar' | 'he';
type Dictionary = Record<string, string>;
const he: Dictionary = {
  collections: 'קולקציות', arrivals: 'פריטים חדשים', about: 'אודות', search: 'חיפוש', wishlist: 'מועדפים',
  cart: 'סל קניות', addToCart: 'הוספה לסל', all: 'הכול', availableSizes: 'מידות זמינות', color: 'צבע',
  size: 'מידה', price: 'מחיר', explore: 'גילוי', emptyWishlist: 'עדיין לא הוספת פריטים למועדפים',
  delivery: 'דמי משלוח לפי אזור', name: 'שם מלא', phone: 'מספר טלפון', address: 'מיקום / כתובת',
  confirm: 'אישור הזמנה בוואטסאפ', total: 'סה״כ', oneSize: 'מידה אחת', orderCart: 'סל הקניות',
  browseWorld: 'גלו את העולם שלנו', browseCollection: 'גלו את הקולקציה', newCollection: 'קולקציית ORA החדשה',
  heroDescription: 'ORA משלבת פשטות מודרנית עם אומנות מדויקת; כל פריט הוא ביטוי ייחודי שנוצר עבור אנשים שהולכים בביטחון ובמטרה.',
  designStory: 'סיפור העיצוב', notJustClothes: 'לא רק בגדים', details: 'אלה הפרטים',
  curated: 'נבחר במיוחד עבורכם', collection: 'הקולקציה', lookbook: 'ספר המראות',
  searchPlaceholder: 'חפשו לפי דגם או צבע...', searchAria: 'חיפוש', removeWishlist: 'הסרה מהמועדפים',
  openCart: 'פתיחת הסל', happyCustomers: 'לקוחות מרוצים', uniqueDesigns: 'עיצובים ייחודיים',
  averageRating: 'דירוג ממוצע', exploreCollection: 'גלו את הקולקציה', rights: 'כל הזכויות שמורות',
  westBank: 'הגדה המערבית', jerusalem: 'ירושלים', inside: 'הפנים',
};

const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({
  language: 'ar', setLanguage: () => undefined, t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const setLanguage = (next: Language) => { setLanguageState(next); };
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === 'he' ? 'rtl' : 'rtl'; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => language === 'he' ? he[key] || key : key }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useLanguage = () => useContext(Context);

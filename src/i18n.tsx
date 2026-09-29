import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'ar' | 'en' | 'he';
type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  ar: {
    home: 'الرئيسية', collections: 'المجموعات', arrivals: 'المنتجات', about: 'من نحن', search: 'بحث', wishlist: 'المفضلة', cart: 'سلة المشتريات', addToCart: 'أضف للسلة', all: 'الكل',
    availableSizes: 'النمر المتوفرة', color: 'اللون', size: 'النمرة', price: 'السعر', emptyWishlist: 'لم تضف أي منتج بعد', delivery: 'رسوم التوصيل حسب المنطقة', name: 'الاسم الكامل', phone: 'رقم الهاتف', address: 'الموقع / العنوان', confirm: 'تأكيد الطلب عبر واتساب', total: 'الإجمالي', oneSize: 'مقاس واحد',
    browseWorld: 'تصفح عالمنا', browseCollection: 'تصفح المجموعة', newCollection: 'مجموعة ORA الجديدة', heroDescription: 'تجمع أورا بين البساطة العصرية والحرفية المتقنة؛ فكل قطعة صُممت لمن يمضون في حياتهم بخطوات واثقة وهادفة.',
    designStory: 'قصة التصميم', notJustClothes: 'ليست مجرد ملابس', details: 'إنها التفاصيل', curated: 'اختيرت لك بعناية', collection: 'التشكيلة', lookbook: 'شاهدوا الإطلالات', searchPlaceholder: 'ابحث باسم المنتج أو اللون...', searchAria: 'بحث', removeWishlist: 'إزالة من المفضلة', openCart: 'فتح السلة', happyCustomers: 'زبائن سعداء', uniqueDesigns: 'تصميم مميز', averageRating: 'التقييم', exploreCollection: 'تصفح التشكيلة', rights: 'جميع الحقوق محفوظة', westBank: 'الضفة', jerusalem: 'القدس', inside: 'الداخل',
    shippingPolicy: 'سياسة التوصيل', exchangePolicy: 'سياسة التبديل', returnPolicy: 'سياسة الترجيع', close: 'إغلاق', changeLanguage: 'تغيير اللغة',
    seasonsKicker: 'اختاري إطلالتك', seasonsTitle: 'تشكيلات المواسم', seasonsHint: 'قطع مختارة لكل فصل', winter: 'شتوي', summer: 'صيفي', autumn: 'خريفي', winterSubtitle: 'دفء وأناقة لأيام الشتاء', summerSubtitle: 'إطلالات خفيفة لأيام الصيف', autumnSubtitle: 'ألوان هادئة وتفاصيل دافئة', seasonalCount: 'قطع', seasonalCta: 'تصفحي القطع', seasonPieceAlt: 'قطعة من مجموعة {season}',
    typesKicker: 'تسوقي حسب النوع', typesTitle: 'أنواع القطع', typeSets: 'الأطقم', typeTops: 'البلايز', typeShirts: 'القمصان', allTypes: 'كل الأنواع',
    offersKicker: 'اختيارات ORA', offersTitle: 'العروض الخاصة', offersHint: 'أسعار مخفضة على قطع مختارة', discount: 'خصم', productTypeFilter: 'نوع القطعة', productNameFilter: 'اسم المنتج', noProducts: 'لا توجد منتجات مصنفة بهذا الاختيار حالياً',
    inStock: 'متوفر', outOfStock: 'غير متوفر', sizesLabel: 'النمر المتوفرة:', selectColor: 'اختاري اللون', chooseSize: 'اختاري النمرة', detailsLabel: 'تفاصيل المنتج',
    salesLabel: 'عرض خاص', newTag: 'جديد', bestSeller: 'الأكثر مبيعًا', limitedTag: 'كمية محدودة', popularTag: 'الأكثر طلبًا', exclusiveTag: 'حصري', shippingPolicyText: 'رسوم التوصيل حسب المنطقة: الضفة ₪20، القدس ₪30، الداخل ₪70. يُحسب التوصيل بشكل مستقل ولا يشمله خصم المنتجات.', exchangePolicyText: 'التبديل مسموح عند استلام الطرد فقط، مع إبلاغنا بالتبديل وقت الاستلام حصراً، وذلك إذا كانت النمرة غير مناسبة.', returnPolicyText: 'لا يُسمح بترجيع القطع عند استلام الطرد.',
    emptyCart: 'السلة فارغة حاليًا', couponPlaceholder: 'كود الخصم (اختياري)', applyCoupon: 'تطبيق', couponSuccess: 'تم تطبيق خصم 10% على المنتجات', couponInvalid: 'كود الخصم غير صحيح', subtotal: 'مجموع المنتجات', couponDiscount: 'خصم ora.10 (10%)', deliveryFee: 'التوصيل', removeItem: 'حذف المنتج', increaseQuantity: 'زيادة الكمية', decreaseQuantity: 'تقليل الكمية', productLabel: 'المنتج', quantity: 'الكمية', lineTotal: 'المجموع', orderHeading: 'طلب جديد من ORA',
    heroEyebrow: 'مجموعة ORA الجديدة', heroLine1: 'ارتدِ', heroLine2: 'جوهر', heroLine3: 'الغد', heroPrimary: 'تصفح المجموعة', heroSecondary: 'شاهدوا الإطلالات', premiumQuality: 'جودة فاخرة', organicFabrics: 'أقمشة مريحة بعناية', scrollDown: 'مرر للأسفل',
    featuredIn: 'كما ظهرت في',
    region: 'المنطقة', collectionPiece: 'قطعة مختارة من المجموعة', storyEyebrow: 'قصة التصميم', storyTitle: 'ليست مجرد ملابس', storyHighlight: 'إنها التفاصيل', storyDescription: 'شغف ممتد صُمم بعناية من خيوط عالية الجودة لتناسب خطواتك اليومية وتمنحك حضوراً مميزاً.',
    featureTitle1: 'أقمشة فاخرة مستدامة', featureDescription1: 'ننتقي خاماتنا بعناية لنضمن لك راحة تدوم ومظهراً عصرياً متقناً.', featureTitle2: 'تصميم يحمل هوية', featureDescription2: 'كل تصميم يحمل حكاية فريدة وتفاصيل تبرز حضورك المميز.', featureTitle3: 'راحة في كل يوم', featureDescription3: 'حلول عملية تلائم يومك وتجمع بين الأناقة والراحة.',
  },
  en: {
    home: 'Home', collections: 'Collections', arrivals: 'Shop', about: 'About', search: 'Search', wishlist: 'Wishlist', cart: 'Shopping bag', addToCart: 'Add to bag', all: 'All',
    availableSizes: 'Available sizes', color: 'Color', size: 'Size', price: 'Price', emptyWishlist: 'Your wishlist is empty', delivery: 'Delivery fee by area', name: 'Full name', phone: 'Phone number', address: 'Location / address', confirm: 'Place order via WhatsApp', total: 'Total', oneSize: 'One size',
    browseWorld: 'Explore our world', browseCollection: 'Explore the collection', newCollection: 'The new ORA collection', heroDescription: 'ORA pairs modern simplicity with considered craftsmanship. Every piece is made for people moving through life with confidence and purpose.',
    designStory: 'The design story', notJustClothes: 'More than clothes', details: 'It is in the details', curated: 'Curated for you', collection: 'The collection', lookbook: 'Watch the lookbook', searchPlaceholder: 'Search by style or color...', searchAria: 'Search', removeWishlist: 'Remove from wishlist', openCart: 'Open shopping bag', happyCustomers: 'Happy customers', uniqueDesigns: 'Unique designs', averageRating: 'Average rating', exploreCollection: 'Explore collection', rights: 'All rights reserved', westBank: 'West Bank', jerusalem: 'Jerusalem', inside: 'Inside',
    shippingPolicy: 'Shipping Policy', exchangePolicy: 'Exchange Policy', returnPolicy: 'Return Policy', close: 'Close', changeLanguage: 'Change language',
    seasonsKicker: 'Find your look', seasonsTitle: 'Shop by season', seasonsHint: 'Pieces for every season', winter: 'Winter', summer: 'Summer', autumn: 'Autumn', winterSubtitle: 'Warm layers for winter days', summerSubtitle: 'Light looks for sunny days', autumnSubtitle: 'Soft colors and warmer details', seasonalCount: 'pieces', seasonalCta: 'Explore pieces', seasonPieceAlt: 'A piece from the {season} collection',
    typesKicker: 'Shop by category', typesTitle: 'Clothing categories', typeSets: 'Sets', typeTops: 'Tops', typeShirts: 'Shirts', allTypes: 'All types',
    offersKicker: 'ORA picks', offersTitle: 'Special offers', offersHint: 'Reduced prices on selected pieces', discount: 'OFF', productTypeFilter: 'Product type', productNameFilter: 'Product name', noProducts: 'No products match this selection yet',
    inStock: 'In stock', outOfStock: 'Sold out', sizesLabel: 'Available sizes:', selectColor: 'Choose a color', chooseSize: 'Choose a size', detailsLabel: 'Product details',
    salesLabel: 'Special offer', newTag: 'New', bestSeller: 'Best seller', limitedTag: 'Limited', popularTag: 'Popular', exclusiveTag: 'Exclusive', shippingPolicyText: 'Delivery fees: West Bank ₪20, Jerusalem ₪30, and inside ₪70. Delivery is charged separately and is not included in product discounts.', exchangePolicyText: 'Exchanges are allowed only when the parcel is received. Notify us at delivery, and only if the size does not fit.', returnPolicyText: 'Returns are not accepted when the parcel is received.',
    emptyCart: 'Your shopping bag is empty', couponPlaceholder: 'Discount code (optional)', applyCoupon: 'Apply', couponSuccess: '10% discount applied to products', couponInvalid: 'Invalid discount code', subtotal: 'Products subtotal', couponDiscount: 'ora.10 discount (10%)', deliveryFee: 'Delivery', removeItem: 'Remove item', increaseQuantity: 'Increase quantity', decreaseQuantity: 'Decrease quantity', productLabel: 'Product', quantity: 'Qty', lineTotal: 'Line total', orderHeading: 'New ORA order',
    heroEyebrow: 'The new ORA collection', heroLine1: 'Wear', heroLine2: 'the essence', heroLine3: 'of tomorrow', heroPrimary: 'Explore the collection', heroSecondary: 'Watch the lookbook', premiumQuality: 'Premium quality', organicFabrics: 'Thoughtful, comfortable fabrics', scrollDown: 'Scroll to explore',
    featuredIn: 'As featured in',
    region: 'Area', collectionPiece: 'A signature piece from the collection', storyEyebrow: 'Our design story', storyTitle: 'More than clothing', storyHighlight: 'Made for the details', storyDescription: 'Thoughtfully crafted from quality yarns for your everyday movement, with pieces designed to make a lasting impression.',
    featureTitle1: 'Considered fabrics', featureDescription1: 'We carefully select our materials for lasting comfort and a refined, modern feel.', featureTitle2: 'Design with identity', featureDescription2: 'Every design carries its own story and thoughtful details that set it apart.', featureTitle3: 'Comfort for every day', featureDescription3: 'Practical pieces for your busy day, balancing ease with considered style.',
  },
  he: {
    home: 'ראשי', collections: 'קולקציות', arrivals: 'מוצרים', about: 'אודות', search: 'חיפוש', wishlist: 'מועדפים', cart: 'סל קניות', addToCart: 'הוספה לסל', all: 'הכול',
    availableSizes: 'מידות זמינות', color: 'צבע', size: 'מידה', price: 'מחיר', emptyWishlist: 'רשימת המועדפים ריקה', delivery: 'דמי משלוח לפי אזור', name: 'שם מלא', phone: 'מספר טלפון', address: 'מיקום / כתובת', confirm: 'אישור הזמנה בוואטסאפ', total: 'סה״כ', oneSize: 'מידה אחת',
    browseWorld: 'גלו את העולם שלנו', browseCollection: 'גלו את הקולקציה', newCollection: 'קולקציית ORA החדשה', heroDescription: 'ORA משלבת פשטות מודרנית עם אומנות מדויקת; כל פריט נוצר עבור אנשים שהולכים בביטחון ובמטרה.',
    designStory: 'סיפור העיצוב', notJustClothes: 'לא רק בגדים', details: 'אלה הפרטים', curated: 'נבחר במיוחד עבורכם', collection: 'הקולקציה', lookbook: 'צפו בלוקבוק', searchPlaceholder: 'חפשו לפי דגם או צבע...', searchAria: 'חיפוש', removeWishlist: 'הסרה מהמועדפים', openCart: 'פתיחת הסל', happyCustomers: 'לקוחות מרוצים', uniqueDesigns: 'עיצובים ייחודיים', averageRating: 'דירוג ממוצע', exploreCollection: 'גלו את הקולקציה', rights: 'כל הזכויות שמורות', westBank: 'הגדה המערבית', jerusalem: 'ירושלים', inside: 'הפנים',
    shippingPolicy: 'מדיניות משלוחים', exchangePolicy: 'מדיניות החלפה', returnPolicy: 'מדיניות החזרות', close: 'סגירה', changeLanguage: 'שינוי שפה',
    seasonsKicker: 'מצאו את הלוק שלכם', seasonsTitle: 'קולקציות עונתיות', seasonsHint: 'פריטים לכל עונה', winter: 'חורף', summer: 'קיץ', autumn: 'סתיו', winterSubtitle: 'שכבות חמימות לימי החורף', summerSubtitle: 'מראות קלילים לימי הקיץ', autumnSubtitle: 'גוונים רגועים ופרטים חמימים', seasonalCount: 'פריטים', seasonalCta: 'לצפייה בפריטים', seasonPieceAlt: 'פריט מקולקציית {season}',
    typesKicker: 'קנייה לפי קטגוריה', typesTitle: 'קטגוריות פריטים', typeSets: 'סטים', typeTops: 'חולצות', typeShirts: 'חולצות מכופתרות', allTypes: 'כל הסוגים',
    offersKicker: 'הבחירות של ORA', offersTitle: 'מבצעים מיוחדים', offersHint: 'מחירים מוזלים על פריטים נבחרים', discount: 'הנחה', productTypeFilter: 'סוג הפריט', productNameFilter: 'שם המוצר', noProducts: 'אין כרגע פריטים בקטגוריה הזו',
    inStock: 'במלאי', outOfStock: 'אזל מהמלאי', sizesLabel: 'מידות זמינות:', selectColor: 'בחירת צבע', chooseSize: 'בחירת מידה', detailsLabel: 'פרטי המוצר',
    salesLabel: 'מבצע מיוחד', newTag: 'חדש', bestSeller: 'רב מכר', limitedTag: 'מלאי מוגבל', popularTag: 'פופולרי', exclusiveTag: 'בלעדי', shippingPolicyText: 'דמי משלוח: הגדה המערבית ₪20, ירושלים ₪30 והפנים ₪70. המשלוח מחויב בנפרד ואינו כלול בהנחת המוצרים.', exchangePolicyText: 'החלפה אפשרית רק בעת קבלת החבילה. יש להודיע לנו בזמן המסירה ורק אם המידה אינה מתאימה.', returnPolicyText: 'לא ניתן להחזיר פריטים בעת קבלת החבילה.',
    emptyCart: 'סל הקניות ריק', couponPlaceholder: 'קוד הנחה (לא חובה)', applyCoupon: 'החלה', couponSuccess: 'הנחה של 10% הוחלה על המוצרים', couponInvalid: 'קוד ההנחה אינו תקין', subtotal: 'סכום המוצרים', couponDiscount: 'הנחת ora.10 (10%)', deliveryFee: 'משלוח', removeItem: 'הסרת פריט', increaseQuantity: 'הגדלת כמות', decreaseQuantity: 'הקטנת כמות', productLabel: 'מוצר', quantity: 'כמות', lineTotal: 'סכום', orderHeading: 'הזמנה חדשה מ-ORA',
    heroEyebrow: 'קולקציית ORA החדשה', heroLine1: 'ללבוש', heroLine2: 'את מהות', heroLine3: 'המחר', heroPrimary: 'לצפייה בקולקציה', heroSecondary: 'צפו בלוקבוק', premiumQuality: 'איכות מוקפדת', organicFabrics: 'בדים נוחים שנבחרו בקפידה', scrollDown: 'גללו למטה',
    featuredIn: 'הופענו ב',
    region: 'אזור', collectionPiece: 'פריט נבחר מהקולקציה', storyEyebrow: 'סיפור העיצוב', storyTitle: 'יותר מבגדים', storyHighlight: 'הפרטים עושים את ההבדל', storyDescription: 'פריטים שנוצרו בקפידה מחומרים איכותיים כדי ללוות את היום שלך ולהעניק נוכחות ייחודית.',
    featureTitle1: 'בדים מוקפדים', featureDescription1: 'אנו בוחרים חומרים בקפידה לנוחות לאורך זמן ולמראה מודרני ומדויק.', featureTitle2: 'עיצוב עם זהות', featureDescription2: 'כל עיצוב נושא סיפור משלו ופרטים מוקפדים שמבליטים אותו.', featureTitle3: 'נוחות בכל יום', featureDescription3: 'פריטים מעשיים ליום העמוס שלך, בשילוב נוחות וסטייל מוקפד.',
  },
};

const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({
  language: 'ar', setLanguage: () => undefined, t: (key) => key,
});

function readSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem('ora-language');
    return saved === 'ar' || saved === 'en' || saved === 'he' ? saved : 'ar';
  } catch {
    return 'ar';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readSavedLanguage);
  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try { localStorage.setItem('ora-language', next); } catch { /* Storage can be unavailable. */ }
  };
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => dictionaries[language][key] || key }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useLanguage = () => useContext(Context);

export function normalizeProductType(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[أإآ]/g, 'ا');
  const aliases: Record<string, string> = {
    'اطقم': 'sets', 'طقم': 'sets', sets: 'sets', set: 'sets',
    'بلايز': 'tops', 'بلوزة': 'tops', tops: 'tops', top: 'tops',
    'قمصان': 'shirts', 'قميص': 'shirts', shirts: 'shirts', shirt: 'shirts',
  };
  return aliases[normalized] || normalized;
}

export function translateProductType(value: string, language: Language) {
  const keyByType: Record<string, keyof typeof dictionaries.ar> = { sets: 'typeSets', tops: 'typeTops', shirts: 'typeShirts' };
  const key = keyByType[normalizeProductType(value)];
  return key ? dictionaries[language][key] : value;
}

export function translateProductColor(value: string, language: Language) {
  if (language === 'ar') return value;
  const normalized = value.trim().toLowerCase().replace(/[أإآ]/g, 'ا');
  const colors: Record<string, [string, string]> = {
    'ابيض': ['White', 'לבן'], white: ['White', 'לבן'], 'שחור': ['Black', 'שחור'], 'اسود': ['Black', 'שחור'], black: ['Black', 'שחור'],
    'كحلي': ['Navy', 'נייבי'], navy: ['Navy', 'נייבי'], 'بني': ['Brown', 'חום'], brown: ['Brown', 'חום'],
    'بني غامق': ['Dark brown', 'חום כהה'], 'بني فاتح': ['Light brown', 'חום בהיר'], 'بيج': ['Beige', 'בז׳'], beige: ['Beige', 'בז׳'],
    'عنابي': ['Burgundy', 'בורדו'], burgundy: ['Burgundy', 'בורדו'], 'زيتي': ['Olive', 'זית'], olive: ['Olive', 'זית'],
    'رمادي': ['Gray', 'אפור'], gray: ['Gray', 'אפור'], grey: ['Gray', 'אפור'], 'احمر': ['Red', 'אדום'], red: ['Red', 'אדום'],
    'ازرق': ['Blue', 'כחול'], blue: ['Blue', 'כחול'], 'اخضر': ['Green', 'ירוק'], green: ['Green', 'ירוק'],
    'موكا': ['Mocha', 'מוקה'], mocha: ['Mocha', 'מוקה'], 'فستقي': ['Pistachio', 'פיסטוק'], pistachio: ['Pistachio', 'פיסטוק'], 'وردي': ['Pink', 'ורוד'], pink: ['Pink', 'ורוד'],
    'اصفر': ['Yellow', 'צהוב'], yellow: ['Yellow', 'צהוב'], 'برتقالي': ['Orange', 'כתום'], orange: ['Orange', 'כתום'],
  };
  const translation = colors[normalized];
  return translation ? translation[language === 'en' ? 0 : 1] : value;
}

export function translateProductBadge(value: string, language: Language) {
  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, keyof typeof dictionaries.ar> = {
    'جديد': 'newTag', new: 'newTag', 'الأكثر مبيعًا': 'bestSeller', 'الاكثر مبيعا': 'bestSeller', 'best seller': 'bestSeller',
    'limited': 'limitedTag', 'محدود': 'limitedTag', 'كمية محدودة': 'limitedTag', 'popular': 'popularTag', 'شائع': 'popularTag', 'الأكثر طلبًا': 'popularTag',
    'exclusive': 'exclusiveTag', 'حصري': 'exclusiveTag', 'عرض خاص': 'salesLabel', 'special offer': 'salesLabel',
  };
  const key = aliases[normalized];
  return key ? dictionaries[language][key] : value;
}

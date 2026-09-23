export type SiteContent = {
  collections: {
    title: string;
    titleAr: string;
    subtitle: string;
    image: string;
    items: string;
  }[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
    image: string;
    secondaryImage: string;
  };
  story: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    image: string;
    secondaryImage: string;
    features: { title: string; description: string }[];
  };
};

export const defaultSiteContent: SiteContent = {
  collections: [
    { title: 'ATHER', titleAr: 'أثيـــــر', subtitle: 'تصميم أثير بقماشة لينن', image: 'https://res.cloudinary.com/lohinijb/image/upload/v1787262325/13d50c31-f92c-44c0-a432-fba5ae36b743.jpg', items: 'S-M-L-XL' },
    { title: 'NASAQ', titleAr: 'نســـــق', subtitle: 'تصميم نسق بقماشة كتان', image: 'https://res.cloudinary.com/lohinijb/image/upload/v1787262324/a0c5a5db-bc7a-4671-a8d1-31724f7b9a05.jpg', items: 'S-M-L-XL' },
    { title: 'SAHAB', titleAr: 'سحــــاب', subtitle: 'تصميم سحاب بقماشة لينن', image: 'https://res.cloudinary.com/lohinijb/image/upload/v1787262324/IMG_9114.jpg', items: 'S-M-L-XL' },
  ],
  hero: {
    eyebrow: 'New ORA Collection',
    titleLine1: 'ارتدِ',
    titleLine2: 'جوهر',
    titleLine3: 'الغد',
    description: 'تجمع "أورا" بين البساطة العصرية والحرفية المتقنة؛ فكل قطعة تمثل تعبيراً فريداً، صُممت خصيصاً لمن يمضون في حياتهم بخطوات واثقة وهادفة.',
    primaryButton: 'Explore Collection',
    secondaryButton: 'Watch Lookbook',
    image: 'https://res.cloudinary.com/lohinijb/image/upload/v1787262325/13d50c31-f92c-44c0-a432-fba5ae36b743.jpg',
    secondaryImage: 'https://res.cloudinary.com/lohinijb/image/upload/v1787262327/IMG_9119.jpg',
  },
  story: {
    eyebrow: 'قصة التصميم',
    title: 'ليست مجرد ملابس',
    highlight: 'إنها تفاصيـــــــــل',
    description: 'شغف ممتد صُمم بعناية من غزل خيوط الجودة لتناسب خطواتِك اليومية الثابتة والواثقة، ونطرح قطعاً تمنح حضوراً مميزاً.',
    image: 'https://res.cloudinary.com/lohinijb/image/upload/v1787275610/Generated_Image_August_21_2026_-_4_23AM.jpg',
    secondaryImage: 'https://res.cloudinary.com/lohinijb/image/upload/v1787280462/IMG_9120.jpg',
    features: [
      { title: 'أقمشة فاخرة مستدامة', description: 'ننتقي خاماتنا بعناية من مصادر مستدامة لنضمن لكِ راحة تدوم طويلاً، مع الحفاظ على مرونة النسيج والمظهر العصري المتقن.' },
      { title: 'تصميم يحمل هوية', description: 'تخرج قطعنا عن النمطية والتقليد؛ حيث يحمل كل تصميم حكاية فريدة وتفاصيل فنية تبرز حضورك الواثق والمتميز.' },
      { title: 'صديقة لأقصى الأدلة', description: 'حلول عملية ومستدامة تلائم تفاصيل يومك المزدحم، لتتحركي بخطى مريحة وثابتة تجمع بين الأناقة المطلقة والعملية الجذابة.' },
    ],
  },
};

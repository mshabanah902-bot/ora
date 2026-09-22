export type Product = {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  colorName: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge: string;
  image: string;
  images: { color: string; img: string }[];
  sizes: { name: string; available: boolean }[];
  colors: { name: string; available: boolean; image: string; images?: string[]; sizeAvailability?: Record<string, boolean> }[];
};

export const defaultProducts: Product[] = [
  ...[
    [1, 'ATHER', 'أثيـــــر', 'كحلي', 200, 280, 'Best Seller', 'https://res.cloudinary.com/lohinijb/image/upload/v1787262325/13d50c31-f92c-44c0-a432-fba5ae36b743.jpg', [['كحلي', 'https://res.cloudinary.com/lohinijb/image/upload/v1787262325/13d50c31-f92c-44c0-a432-fba5ae36b743.jpg'], ['بني', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280199/IMG_8951.jpg'], ['اسود', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280199/IMG_8949.jpg']]],
    [2, 'NASAQ', 'نســـــق', 'ابيض', 200, 250, 'New', 'https://res.cloudinary.com/lohinijb/image/upload/v1787262324/a0c5a5db-bc7a-4671-a8d1-31724f7b9a05.jpg', [['ابيض', 'https://res.cloudinary.com/lohinijb/image/upload/v1787262324/a0c5a5db-bc7a-4671-a8d1-31724f7b9a05.jpg'], ['موكا', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280462/IMG_9120.jpg']]],
    [3, 'SAHAB', 'سحــــاب', 'بيج', 180, 230, 'Limited', 'https://res.cloudinary.com/lohinijb/image/upload/v1787275610/Generated_Image_August_21_2026_-_4_23AM.jpg', [['بيج', 'https://res.cloudinary.com/lohinijb/image/upload/v1787275610/Generated_Image_August_21_2026_-_4_23AM.jpg']]],
    [4, 'WAQAR', 'وقــــار', 'عنابي', 150, 200, 'Popular', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280712/IMG_9121.jpg', [['عنابي', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280712/IMG_9121.jpg'], ['بني', 'https://res.cloudinary.com/lohinijb/image/upload/v1787262327/IMG_9119.jpg']]],
    [5, 'OFUQ', 'افـــــق', 'بني', 120, 180, 'New', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280838/Generated_Image_August_21_2026_-_5_53AM.jpg', [['بني', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280838/Generated_Image_August_21_2026_-_5_53AM.jpg']]],
    [6, 'TAYF', 'طيــــف', 'زيتي', 120, 180, 'Exclusive', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280899/Generated_Image_August_21_2026_-_5_54AM.jpg', [['زيتي', 'https://res.cloudinary.com/lohinijb/image/upload/v1787280899/Generated_Image_August_21_2026_-_5_54AM.jpg']]],
  ].map(([id, name, nameAr, colorName, price, originalPrice, badge, image, colors]) => ({
    id: id as number, name: name as string, nameAr: nameAr as string, category: name as string, colorName: colorName as string,
    price: price as number, originalPrice: originalPrice as number, rating: 4.8, reviews: 500, badge: badge as string, image: image as string,
    images: (colors as [string, string][]).map(([color, img]) => ({ color, img })),
    sizes: (id === 4 || id === 5 || id === 6 ? ['One Size'] : ['S', 'M', 'L', 'XL']).map((name) => ({ name, available: true })),
    colors: (colors as [string, string][]).map(([name, image]) => ({ name, image, available: true })),
  })) as Product[],
];

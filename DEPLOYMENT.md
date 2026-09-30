# نشر ORA على Supabase وRender

## 1. Supabase

1. افتح SQL Editor في مشروع Supabase.
2. الصق محتوى [supabase.sql](./supabase.sql) واضغط Run.
3. من Project Settings ثم API انسخ:
   - Project URL
   - `service_role` key فقط للخادم، ولا تضعه داخل Vite أو المتصفح.

## 2. Render

1. ارفع المشروع إلى GitHub.
2. في Render اختر **New > Blueprint** وحدد المستودع.
3. سيقرأ Render ملف [render.yaml](./render.yaml) وينشئ خدمتين:
   - `ora-api`: خادم الطلبات.
   - `ora-storefront`: واجهة المتجر.
4. في خدمة `ora-api` أضف المتغيرات:
   - `SUPABASE_URL`: رابط مشروع Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: مفتاح `service_role`.
   - `ADMIN_PASSWORD`: كلمة مرور لوحة الإدارة، والأفضل تغييرها عن القيمة الافتراضية.
   - `FRONTEND_URL`: رابط المتجر `https://ora1-amlu.onrender.com`.
5. متغير `VITE_API_URL` للواجهة يُربط تلقائيًا بخدمة `ora-api` عبر `render.yaml`. إذا كانت الخدمات يدوية، أضفه إلى خدمة الواجهة بعنوان خدمة الـ API كاملًا، ثم أعد بناء ونشر الواجهة.

## ملاحظة التخزين

المتجر المنشور على `https://ora1-amlu.onrender.com` يتصل بخدمة `ora-api` المنفصلة لحماية عمليات الإدارة، بينما يتصل Supabase لحفظ المنتجات والمحتوى والطلبات. تأكد من أن `VITE_API_URL` يشير إلى خدمة API وأعد بناء الواجهة بعد ضبطه. يجب تشغيل [supabase.sql](./supabase.sql) مرة واحدة في SQL Editor قبل استخدام لوحة الإدارة. لا تضع مفتاح `service_role` في متغيرات Vite أو ملفات الواجهة.

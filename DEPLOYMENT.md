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
   - `FRONTEND_URL`: رابط متجر Render بعد إنشائه، مثل `https://ora-storefront.onrender.com`.
5. متغير `VITE_API_URL` للواجهة يُربط تلقائيًا بخدمة `ora-api` عبر `render.yaml`. إذا أنشأت الخدمات يدويًا، ضعه يدويًا كرابط خدمة الـ API.

## التشغيل المحلي

```bash
npm install
npm run server
npm run dev
```

عند عدم وجود متغيرات Supabase يستخدم الخادم [data.json](./data.json) كـ fallback محلي. في Render يجب إضافة متغيرات Supabase حتى تبقى الطلبات والمنتجات محفوظة بعد إعادة تشغيل الخدمة.

# نشر ORA على Supabase وRender

## 1. Supabase

1. افتح SQL Editor في مشروع Supabase.
2. الصق محتوى [supabase.sql](./supabase.sql) واضغط Run.
3. من Project Settings ثم API انسخ:
   - Project URL
   - `service_role` key فقط للخادم، ولا تضعه داخل Vite أو المتصفح.

## 2. Render

1. ارفع المشروع إلى GitHub.
2. في Render أنشئ أو حدّث خدمة Web Service واحدة باسم `ora1-amlu` من هذا المستودع؛ سيبني Render الواجهة ويشغل خادمها من الخدمة نفسها.
3. أضف إلى الخدمة المتغيرات:
   - `SUPABASE_URL`: رابط مشروع Supabase.
   - `SUPABASE_SERVICE_ROLE_KEY`: مفتاح `service_role`.
   - `ADMIN_PASSWORD`: كلمة مرور لوحة الإدارة، والأفضل تغييرها عن القيمة الافتراضية.
4. إذا كانت خدمة `ora1-amlu` الحالية Static Site، استبدلها بخدمة Web Service مع الحفاظ على الاسم والنطاق `ora1-amlu.onrender.com`؛ لا تنشئ خدمة API منفصلة ولا تضف `VITE_API_URL`.

## ملاحظة التخزين

المتجر والـ API يعملان على النطاق نفسه `https://ora1-amlu.onrender.com`، والواجهة تحفظ المنتجات والمحتوى والطلبات عبر Supabase. بعد النشر افتح `/health` على النطاق نفسه وتأكد من ظهور `"configured":true`. يجب تشغيل [supabase.sql](./supabase.sql) مرة واحدة في SQL Editor قبل استخدام لوحة الإدارة. لا تضع مفتاح `service_role` في متغيرات Vite أو ملفات الواجهة.

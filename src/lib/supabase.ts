import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hdliplvcymhjiheguvoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkbGlwbHZjeW1oamloZWd1dm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTA0NzcsImV4cCI6MjEwNTY2NjQ3N30.OKKPyVmAVXSJzEf-UfncwjrUEpAQOI0yy7Bdi86UDCk'; // اترك مفتاحك الأصلي الموجود لديك

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * دالة ذكية مجانية تماماً: تقوم بجلب البيانات لمرة واحدة وتخزينها في المتصفح (LocalStorage)
 * لمنع تكرار الطلبات وإبقاء استهلاك الـ Egress صفر!
 */
export async function fetchWithCache(key: string, queryFunction: () => Promise<any>) {
  // 1. تحقق هل البيانات مخزنة مسبقاً في متصفح المستخدم؟
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    return JSON.parse(cachedData); // إرجاعها فوراً بدون أي اتصال بقاعدة البيانات
  }

  // 2. إذا لم تكن مخزنة، قم بجلبها لمرة واحدة فقط من Supabase
  const data = await queryFunction();

  // 3. تخزينها محلياً للمرات القادمة
  if (data !== null && data !== undefined) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  return data;
}
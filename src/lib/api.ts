import { supabase } from './supabase';
import type { Product } from '../data/products';
import type { SiteContent } from '../data/siteContent';

export async function loadProducts() {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'products').maybeSingle();
  if (error) throw error;
  return (Array.isArray(data?.value) ? data.value : []) as Product[];
}

export async function saveProducts(products: Product[]) {
  if (!products.length) throw new Error('Refusing to replace the product catalog with an empty list');
  const { data, error } = await supabase.from('store_settings').upsert({ key: 'products', value: products, updated_at: new Date().toISOString() }).select('value').single();
  if (error) throw error;
  if (!Array.isArray(data?.value) || data.value.length !== products.length) throw new Error('Supabase did not confirm the products update');
}

export async function loadSiteContent() {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'site_content').maybeSingle();
  if (error) throw error;
  return (data?.value || {}) as Partial<SiteContent>;
}

export async function saveSiteContent(content: SiteContent) {
  const { data, error } = await supabase.from('store_settings').upsert({ key: 'site_content', value: content, updated_at: new Date().toISOString() }).select('value').single();
  if (error) throw error;
  if (!data?.value || typeof data.value !== 'object') throw new Error('Supabase did not confirm the site content update');
}

export async function loadOrders() {
  const { data, error } = await supabase.from('orders').select('payload, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({ ...(row.payload as Record<string, unknown>), createdAt: row.created_at }));
}

export async function saveOrder(order: Record<string, unknown>) {
  const { error } = await supabase.from('orders').insert({ payload: order });
  if (error) throw error;
}
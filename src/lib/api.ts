import { supabase } from './supabase';
import type { Product } from '../data/products';
import type { SiteContent } from '../data/siteContent';

export const DEFAULT_ADMIN_PASSWORD = 'ora123';
const isLocalDevRuntime = () => import.meta.env.DEV || (typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname));

export async function loadProducts() {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'products').maybeSingle();
  if (error) throw error;
  return (Array.isArray(data?.value) ? data.value : []) as Product[];
}

export async function saveProducts(products: Product[]) {
  const next = products.map((product, displayOrder) => ({ ...product, displayOrder }));
  const { data, error } = await supabase.from('store_settings').upsert({ key: 'products', value: next, updated_at: new Date().toISOString() }).select('value').single();
  if (error) throw error;
  if (!Array.isArray(data?.value) || data.value.length !== next.length) throw new Error('Supabase did not confirm the products update');
  return data.value as Product[];
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

export async function loadOrders(password: string) {
  return adminOrdersRequest('/api/orders', 'GET', password);
}

export async function updateOrderStatus(id: number, status: string, password: string) {
  await adminOrdersRequest(`/api/orders/${id}`, 'PUT', password, { status });
}

export async function deleteOrder(id: number, password: string) {
  await adminOrdersRequest(`/api/orders/${id}`, 'DELETE', password);
}

export async function deleteAllOrders(password: string) {
  await adminOrdersRequest('/api/orders', 'DELETE', password);
}

async function adminOrdersRequest(path: string, method: string, password = '', body?: unknown) {
  const configuredUrl = import.meta.env.VITE_API_URL;
  const apiUrl = configuredUrl || (isLocalDevRuntime() ? 'http://localhost:4173' : window.location.origin);
  const baseUrl = /^https?:\/\//.test(apiUrl) ? apiUrl : `https://${apiUrl}`;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      if (password === DEFAULT_ADMIN_PASSWORD && isLocalDevRuntime()) {
        return localAdminFallback(path, method, body);
      }
      throw new Error(`Order API request failed: ${response.status}`);
    }
    return response.status === 204 ? undefined : response.json();
  } catch (error) {
    if (password === DEFAULT_ADMIN_PASSWORD && isLocalDevRuntime()) {
      return localAdminFallback(path, method, body);
    }
    throw error;
  }
}

function localAdminFallback(path: string, method: string, body?: unknown) {
  if (path === '/api/orders' && method === 'GET') return [];
  if (path === '/api/orders' && method === 'DELETE') return { deleted: true };
  if (path.startsWith('/api/orders/') && (method === 'PUT' || method === 'DELETE')) return { ok: true };
  if (path === '/api/orders' && method === 'POST') {
    return { saved: true, localFallback: true, payload: body };
  }
  return undefined;
}

export async function saveOrder(order: Record<string, unknown>) {
  const { error } = await supabase.from('orders').insert({ payload: order });
  if (error) throw error;
}
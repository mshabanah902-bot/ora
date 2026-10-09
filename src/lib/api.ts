import { supabase } from './supabase';
import type { Product } from '../data/products';
import type { SiteContent } from '../data/siteContent';

export const DEFAULT_ADMIN_PASSWORD = 'ora123';
const isLocalDevRuntime = () => import.meta.env.DEV || (typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname));
const PUBLIC_CACHE_TTL_MS = 60_000;
const publicCacheKeys = {
  products: 'ora-public-cache:products:v1',
  siteContent: 'ora-public-cache:site-content:v1',
} as const;
type PublicCacheKey = (typeof publicCacheKeys)[keyof typeof publicCacheKeys];
const publicDataStorageKeys: Record<PublicCacheKey, string> = {
  [publicCacheKeys.products]: 'ora-products-cache',
  [publicCacheKeys.siteContent]: 'ora-site-content-cache',
};
const pendingPublicRequests = new Map<PublicCacheKey, Promise<unknown>>();
const publicCacheRevisions = new Map<PublicCacheKey, number>();
const memoryPublicCache = new Map<PublicCacheKey, CachedValue<unknown>>();

type CachedValue<T> = { value: T; expiresAt: number };

function readPublicCache<T>(key: PublicCacheKey): T | undefined {
  const memoryCached = memoryPublicCache.get(key) as CachedValue<T> | undefined;
  if (memoryCached && memoryCached.expiresAt > Date.now()) return memoryCached.value;

  try {
    const expiresAt = Number(localStorage.getItem(`${key}:expiresAt`));
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(`${key}:expiresAt`);
      return undefined;
    }
    const stored = localStorage.getItem(publicDataStorageKeys[key]);
    return stored ? JSON.parse(stored) as T : undefined;
  } catch {
    return undefined;
  }
}

function writePublicCache<T>(key: PublicCacheKey, value: T) {
  const cached = { value, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS };
  memoryPublicCache.set(key, cached);
  publicCacheRevisions.set(key, (publicCacheRevisions.get(key) || 0) + 1);
  try {
    localStorage.setItem(publicDataStorageKeys[key], JSON.stringify(value));
    localStorage.setItem(`${key}:expiresAt`, String(cached.expiresAt));
  } catch {
    // Public data can still be served from memory if browser storage is unavailable.
  }
}

function cachePublicValue<T>(key: PublicCacheKey, load: () => Promise<T>): Promise<T> {
  const cached = readPublicCache<T>(key);
  if (cached !== undefined) return Promise.resolve(cached);

  const pending = pendingPublicRequests.get(key);
  if (pending) return pending as Promise<T>;

  const revisionAtStart = publicCacheRevisions.get(key) || 0;
  const request = load().then((value) => {
    if (revisionAtStart === (publicCacheRevisions.get(key) || 0)) {
      writePublicCache(key, value);
      return value;
    }
    return readPublicCache<T>(key) ?? value;
  }).finally(() => {
    pendingPublicRequests.delete(key);
  });
  pendingPublicRequests.set(key, request);
  return request;
}

function apiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (!configuredUrl) return undefined;
  return /^https?:\/\//.test(configuredUrl) ? configuredUrl.replace(/\/$/, '') : `https://${configuredUrl.replace(/\/$/, '')}`;
}

async function loadPublicApi<T>(path: string): Promise<T> {
  const baseUrl = apiBaseUrl();
  if (!baseUrl) throw new Error('Public API URL is not configured');

  const response = await fetch(`${baseUrl}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Public API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function loadProducts() {
  return cachePublicValue(publicCacheKeys.products, async () => {
    if (apiBaseUrl()) return loadPublicApi<Product[]>('/api/products');
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'products').maybeSingle();
    if (error) throw error;
    return (Array.isArray(data?.value) ? data.value : []) as Product[];
  });
}

export async function saveProducts(products: Product[]) {
  const next = products.map((product, displayOrder) => ({ ...product, displayOrder }));
  const { data, error } = await supabase.from('store_settings').upsert({ key: 'products', value: next, updated_at: new Date().toISOString() }).select('value').single();
  if (error) throw error;
  if (!Array.isArray(data?.value) || data.value.length !== next.length) throw new Error('Supabase did not confirm the products update');
  const saved = data.value as Product[];
  writePublicCache(publicCacheKeys.products, saved);
  return saved;
}

export function loadSiteContent() {
  return cachePublicValue(publicCacheKeys.siteContent, async () => {
    if (apiBaseUrl()) return loadPublicApi<Partial<SiteContent>>('/api/settings');
    const { data, error } = await supabase.from('store_settings').select('value').eq('key', 'site_content').maybeSingle();
    if (error) throw error;
    return (data?.value || {}) as Partial<SiteContent>;
  });
}

export async function saveSiteContent(content: SiteContent) {
  const { data, error } = await supabase.from('store_settings').upsert({ key: 'site_content', value: content, updated_at: new Date().toISOString() }).select('value').single();
  if (error) throw error;
  if (!data?.value || typeof data.value !== 'object') throw new Error('Supabase did not confirm the site content update');
  writePublicCache(publicCacheKeys.siteContent, content);
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
  if (!configuredUrl && !isLocalDevRuntime()) {
    throw new Error('VITE_API_URL is required for production deployments');
  }
  const apiUrl = configuredUrl || 'http://localhost:4173';
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
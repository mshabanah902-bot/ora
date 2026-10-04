const http = require('http');

const PORT = process.env.PORT || 4173;
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ora123';
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

// --- نظام الذاكرة المؤقتة (Memory Cache) لإيقاف استهلاك Egress نهائياً ---
const memoryCache = {
  products: null,
  settings: null,
  clear() {
    this.products = null;
    this.settings = null;
  }
};

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (error) { reject(error); } });
  });
}
async function supabase(pathname, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  try {
    if (req.url === '/' && req.method === 'GET') {
      return reply(res, 200, { service: 'ora-api', status: 'ok', endpoints: ['/health', '/api/products', '/api/settings', '/api/orders'] });
    }
    if (req.url === '/health' && req.method === 'GET') {
      return reply(res, 200, { ok: true, storage: 'supabase' });
    }

    // --- المنتجات مع تفعيل الـ Cache ---
    if (req.url === '/api/products' && req.method === 'GET') {
      if (memoryCache.products) {
        return reply(res, 200, memoryCache.products); // إرجاع فوري بدون طلب Supabase
      }
      const rows = await supabase('store_settings?key=eq.products&select=value');
      memoryCache.products = rows[0]?.value || [];
      return reply(res, 200, memoryCache.products);
    }
    if (req.url === '/api/products' && req.method === 'PUT') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const products = await body(req);
      if (!Array.isArray(products)) return reply(res, 400, { error: 'Products must be an array' });
      await supabase('store_settings?key=eq.products', { method: 'PATCH', body: JSON.stringify({ value: products }) });
      memoryCache.products = products; // تحديث الـ Cache فوراً عند التعديل
      return reply(res, 200, products);
    }

    // --- إعدادات الموقع مع تفعيل الـ Cache ---
    if (req.url === '/api/settings' && req.method === 'GET') {
      if (memoryCache.settings) {
        return reply(res, 200, memoryCache.settings); // إرجاع فوري بدون طلب Supabase
      }
      const rows = await supabase('store_settings?key=eq.site_content&select=value');
      memoryCache.settings = rows[0]?.value || {};
      return reply(res, 200, memoryCache.settings);
    }
    if (req.url === '/api/settings' && req.method === 'PUT') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const settings = await body(req);
      await supabase('store_settings?key=eq.site_content', { method: 'PATCH', body: JSON.stringify({ value: settings, updated_at: new Date().toISOString() }) });
      memoryCache.settings = settings; // تحديث الـ Cache فوراً عند التعديل
      return reply(res, 200, settings);
    }

    if (req.url === '/api/orders' && req.method === 'GET') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const rows = await supabase('orders?select=id,payload,created_at&order=created_at.desc');
      return reply(res, 200, rows.map((row) => ({ ...row.payload, id: row.id, createdAt: row.created_at })));
    }
    if (req.url === '/api/orders' && req.method === 'DELETE') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      await supabase('orders?id=not.is.null', { method: 'DELETE' });
      return reply(res, 200, { deleted: true });
    }
    const orderMatch = req.url.match(/^\/api\/orders\/(\d+)$/);
    if (orderMatch && req.method === 'PUT') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const { status } = await body(req);
      const validStatuses = ['new', 'cancelled', 'postponed', 'delivered', 'exchanged'];
      if (!validStatuses.includes(status)) return reply(res, 400, { error: 'Invalid order status' });
      const rows = await supabase(`orders?id=eq.${orderMatch[1]}&select=payload`, { method: 'GET' });
      if (!rows.length) return reply(res, 404, { error: 'Order not found' });
      const updatedRows = await supabase(`orders?id=eq.${orderMatch[1]}&select=id,payload`, { method: 'PATCH', body: JSON.stringify({ payload: { ...rows[0].payload, status } }) });
      if (!updatedRows?.some((row) => row.payload?.status === status)) {
        throw new Error('Supabase did not confirm the order status update');
      }
      return reply(res, 200, { updated: updated, status });
    }
    if (orderMatch && req.method === 'DELETE') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      await supabase(`orders?id=eq.${orderMatch[1]}`, { method: 'DELETE' });
      return reply(res, 200, { deleted: true });
    }
    if (req.url === '/api/orders' && req.method === 'POST') {
      const order = await body(req);
      if (!order.customer?.name || !order.customer?.phone || !order.customer?.address || !Array.isArray(order.items)) return reply(res, 400, { error: 'Missing order details' });
      await supabase('orders', { method: 'POST', body: JSON.stringify({ payload: order }) });
      return reply(res, 201, { saved: true });
    }
    return reply(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return reply(res, 500, { error: 'Server error' });
  }
});
function reply(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
server.listen(PORT, () => console.log(`ORA API listening on port ${PORT} (Supabase)`));
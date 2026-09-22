const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const DB = path.join(__dirname, 'data.json');
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ora123';
const usingSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const initial = { products: [], orders: [] };

function readDb() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return initial; }
}
function writeDb(data) { fs.writeFileSync(DB, JSON.stringify(data, null, 2)); }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  try {
    if (req.url === '/api/products' && req.method === 'GET') {
      if (usingSupabase) {
        const rows = await supabase('store_settings?key=eq.products&select=value');
        return reply(res, 200, rows[0]?.value || []);
      }
      return reply(res, 200, readDb().products);
    }
    if (req.url === '/api/products' && req.method === 'PUT') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const products = await body(req);
      if (!Array.isArray(products)) return reply(res, 400, { error: 'Products must be an array' });
      if (usingSupabase) {
        await supabase('store_settings?key=eq.products', { method: 'PATCH', body: JSON.stringify({ value: products }) });
      } else { const db = readDb(); db.products = products; writeDb(db); }
      return reply(res, 200, products);
    }
    if (req.url === '/api/settings' && req.method === 'GET') {
      if (usingSupabase) {
        const rows = await supabase('store_settings?key=eq.site_content&select=value');
        return reply(res, 200, rows[0]?.value || {});
      }
      return reply(res, 200, readDb().siteContent || {});
    }
    if (req.url === '/api/settings' && req.method === 'PUT') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      const settings = await body(req);
      if (usingSupabase) await supabase('store_settings?key=eq.site_content', { method: 'PATCH', body: JSON.stringify({ value: settings, updated_at: new Date().toISOString() }) });
      else { const db = readDb(); db.siteContent = settings; writeDb(db); }
      return reply(res, 200, settings);
    }
    if (req.url === '/api/orders' && req.method === 'GET') {
      if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return reply(res, 401, { error: 'Unauthorized' });
      if (usingSupabase) {
        const rows = await supabase('orders?select=payload,created_at&order=created_at.desc');
        return reply(res, 200, rows.map((row) => ({ ...row.payload, createdAt: row.created_at })));
      }
      return reply(res, 200, readDb().orders);
    }
    if (req.url === '/api/orders' && req.method === 'POST') {
      const order = await body(req);
      if (!order.customer?.name || !order.customer?.phone || !order.customer?.address || !Array.isArray(order.items)) return reply(res, 400, { error: 'Missing order details' });
      if (usingSupabase) await supabase('orders', { method: 'POST', body: JSON.stringify({ payload: order }) });
      else { const db = readDb(); db.orders.push({ ...order, createdAt: new Date().toISOString() }); writeDb(db); }
      return reply(res, 201, { saved: true });
    }
    return reply(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return reply(res, 500, { error: 'Server error' });
  }
});
function reply(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); }
server.listen(PORT, () => console.log(`ORA API listening on port ${PORT} (${usingSupabase ? 'Supabase' : 'local fallback'})`));

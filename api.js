/* ════════════════════════════════════════════
   AUTOPARTS MX — API de Productos
   Archivo: api.js
════════════════════════════════════════════ */

let allProducts  = [];
let activeFilter = 'all';

const CATEGORIES = ['Motor', 'Frenos', 'Eléctrico', 'Suspensión', 'Performance'];
const BRANDS     = ['Bosch','NGK','Moog','ACDelco','Gates','Bendix','Denso','Monroe','Dayco','SKF'];
const EMOJIS     = { Motor:'🔧', Frenos:'🛞', Eléctrico:'⚡', Suspensión:'🚗', Performance:'🏁' };
const STOCK_OPTS = [
  { label:'En stock',      cls:'in-stock'  },
  { label:'Pocas piezas',  cls:'low-stock' },
  { label:'Sin stock',     cls:'no-stock'  }
];

/* ── Convierte un producto de la API en objeto interno ── */
function mapToProduct(item, i) {
  const cat   = CATEGORIES[i % CATEGORIES.length];
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  const stock = STOCK_OPTS[Math.floor(Math.random() * STOCK_OPTS.length)];
  const price = (Math.random() * 2400 + 120).toFixed(2);
  const sku   = 'AP-' + String(item.id).padStart(5, '0');
  return { id: item.id, name: item.title, cat, brand, stock, price, sku, emoji: EMOJIS[cat] };
}

/* ── Obtiene productos desde la API pública ── */
async function fetchProducts() {
  const grid  = document.getElementById('productsGrid');
  const load  = document.getElementById('loadingProducts');
  const badge = document.getElementById('apiStatusBadge');

  grid.innerHTML = '';
  load.style.display = 'flex';
  badge.style.display = 'none';

  try {
    const res  = await fetch('https://dummyjson.com/products?limit=30&skip=0');
    const data = await res.json();
    allProducts = data.products.map(mapToProduct);

    // Actualizar info en la sección de estado de API
    const timeEl    = document.getElementById('lastFetchTime');
    const recordsEl = document.getElementById('totalRecords');
    if (timeEl)    timeEl.textContent    = new Date().toLocaleTimeString('es-MX');
    if (recordsEl) recordsEl.textContent = allProducts.length + ' registros';

    // Mostrar badge verde
    badge.style.display = 'inline-flex';
    badge.className = 'api-status ok';
    document.getElementById('apiStatusText').textContent = 'API Conectada';

    gaEvent('api_fetch_success', { records: allProducts.length });

  } catch (err) {
    console.warn('API no disponible — usando datos de respaldo.', err);
    allProducts = getFallbackProducts();

    badge.style.display = 'inline-flex';
    badge.className = 'api-status err';
    document.getElementById('apiStatusText').textContent = 'Modo offline';

    gaEvent('api_fetch_error');
  }

  load.style.display = 'none';
  renderProducts(allProducts);
}

/* ── Renderiza tarjetas de producto en el DOM ── */
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');

  if (!list.length) {
    grid.innerHTML = `
      <p style="color:var(--muted);font-size:.9rem;grid-column:1/-1">
        No se encontraron refacciones con esos criterios.
      </p>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-thumb">
        <span>${p.emoji}</span>
        <span class="stock-badge ${p.stock.cls}">${p.stock.label}</span>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand} · ${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-sku">SKU: ${p.sku}</div>
        <div class="product-footer">
          <div class="product-price">$${Number(p.price).toLocaleString('es-MX')}</div>
          <button class="product-btn"
            onclick="gaEvent('add_to_cart',{item_id:'${p.sku}',item_name:'${p.name.replace(/'/g,"&#39;")}',price:${p.price}})">
            + Cotizar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Filtra por categoría ── */
function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterProducts();
  gaEvent('filter_category', { category: cat });
}

/* ── Filtra por búsqueda de texto ── */
function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let list = allProducts;

  if (activeFilter !== 'all')
    list = list.filter(p => p.cat === activeFilter);

  if (q)
    list = list.filter(p =>
      p.name.toLowerCase().includes(q)  ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)   ||
      p.cat.toLowerCase().includes(q)
    );

  renderProducts(list);
}

/* ── Datos de respaldo si la API falla ── */
function getFallbackProducts() {
  const items = [
    'Filtro de Aceite','Bujías Iridium','Balata Delantera','Amortiguador Trasero',
    'Alternador 120A','Disco de Freno','Bomba de Agua','Banda de Distribución',
    'Sensor de Oxígeno','Bobina de Encendido','Termostato','Radiador Aluminio',
    'Bomba de Combustible','Filtro de Aire','Cable de Bujías'
  ];
  return items.map((name, i) => ({
    id:    i + 1,
    name,
    cat:   CATEGORIES[i % CATEGORIES.length],
    brand: BRANDS[i % BRANDS.length],
    stock: STOCK_OPTS[Math.floor(Math.random() * 3)],
    price: (Math.random() * 1500 + 100).toFixed(2),
    sku:   'AP-0000' + (i + 1),
    emoji: EMOJIS[CATEGORIES[i % 5]]
  }));
}

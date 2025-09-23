// Utility formatters
const fmtCurrency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
const fmtDate = (s) => s; // dates already DD/MM/YYYY

// Unit inference from presentation string (e.g., "600g", "1kg", "900cc", "4u")
function inferStandardUnit(presentation) {
  if (!presentation) return {standard:'/u', factor:1, raw:null};
  const s = presentation.toLowerCase().replace(/\s+/g,'');

  // Examples: "600g", "1kg", "170g", "1l", "900cc", "500ml", "4u"
  const match = s.match(/^(\d+(?:[.,]\d+)?)([a-z]+)$/i);
  if (!match) return {standard:'/u', factor:1, raw:null};

  const qty = parseFloat(match[1].replace(',', '.'));
  const unit = match[2];

  if (unit === 'g')   return {standard:'/kg', factor: qty/1000, raw: {qty, unit}};
  if (unit === 'kg')  return {standard:'/kg', factor: qty, raw: {qty, unit}};
  if (unit === 'ml')  return {standard:'/L',  factor: qty/1000, raw: {qty, unit}};
  if (unit === 'cc')  return {standard:'/L',  factor: qty/1000, raw: {qty, unit}};
  if (unit === 'l')   return {standard:'/L',  factor: qty, raw: {qty, unit}};
  if (unit === 'u')   return {standard:'/u',  factor: qty, raw: {qty, unit}};

  // default to unit
  return {standard:'/u', factor:1, raw: {qty, unit}};
}

// Parse key: "pan lacteado 600g - la veneziana"
function parseKey(key){
  const [left, brandRaw] = key.split(' - ').map(x => x?.trim() ?? '');
  const brand = brandRaw ?? '';
  // Extract presentation (last token containing digits+unit), rest is product name
  const m = left.match(/(.+)\s+(\d+(?:[.,]\d+)?[a-zA-Z]+)$/);
  let product = left, presentation = '';
  if (m){
    product = m[1].trim();
    presentation = m[2].trim();
  }
  return {product, presentation, brand};
}

// Build tabs (categories)
function buildTabs(items){
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = '';

  const counts = items.reduce((acc, it) => {
    acc[it.category] = (acc[it.category] || 0) + 1;
    return acc;
  }, {});

  const allCount = items.length;
  const cats = Object.keys(counts).sort((a,b)=>a.localeCompare(b,'es'));
  const spec = [{id:'__all__', label:`Todos`, count: allCount}, ...cats.map(c=>({id:c, label:c[0].toUpperCase()+c.slice(1), count: counts[c]}))];

  spec.forEach((t,i)=>{
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.setAttribute('role','tab');
    btn.dataset.id = t.id;
    btn.setAttribute('aria-selected', i===0 ? 'true' : 'false');
    btn.innerHTML = `${t.label} <span class="count">(${t.count})</span>`;
    tabs.appendChild(btn);
  });
}

// Render table rows
function renderRows(rows){
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';

  rows.forEach(r=>{
    const tr = document.createElement('tr');

    const unitInfo = inferStandardUnit(r.presentation);
    const unitLabel = unitInfo.standard; // '/kg', '/L', '/u'

    tr.innerHTML = `
      <td>${r.product}</td>
      <td>${r.presentation || '-'}</td>
      <td>${r.brand || '-'}</td>
      <td>${r.category}</td>
      <td class="right price">${fmtCurrency.format(r.p_price)}</td>
      <td class="right price">${fmtCurrency.format(r.f_price)}<span class="unit-note"> ${unitLabel}</span></td>
      <td>${fmtDate(r.date)}</td>
    `;

    // Click → go to product page with key param
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => {
      const params = new URLSearchParams({ key: r.key });
      window.location.href = `producto.html?${params.toString()}`;
    });

    tbody.appendChild(tr);
  });
}

// Sorting
let currentSort = {key:'date', dir:'desc'};
function applySort(rows){
  const {key, dir} = currentSort;
  const mult = dir === 'asc' ? 1 : -1;
  const collator = new Intl.Collator('es', {numeric:true, sensitivity:'base'});

  return [...rows].sort((a,b)=>{
    if (key === 'p_price' || key === 'f_price') {
      return mult * (a[key] - b[key]);
    }
    if (key === 'date') {
      // DD/MM/YYYY compare by YYYYMMDD
      const toNum = d => d.split('/').reverse().join('');
      return mult * (toNum(a.date).localeCompare(toNum(b.date)));
    }
    return mult * collator.compare(String(a[key] ?? ''), String(b[key] ?? ''));
  });
}
function updateSortIndicators(){
  document.querySelectorAll('.sortable').forEach(th=>{
    th.classList.remove('sorted-asc','sorted-desc');
    const key = th.dataset.key;
    if (key === currentSort.key){
      th.classList.add(currentSort.dir === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

// Filter by search and category
let activeCategory = '__all__', searchTerm = '';

function filterRows(all){
  return all.filter(r => {
    const okCat = activeCategory === '__all__' || r.category === activeCategory;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return okCat;
    const haystack = `${r.product} ${r.brand}`.toLowerCase();
    return okCat && haystack.includes(q);
  });
}

// Load JSON and boot
async function boot(){
  const res = await fetch('data/prices.json');
  const raw = await res.json();

  // Transform to array
  const rows = Object.entries(raw).map(([key, v]) => {
    const {product, presentation, brand} = parseKey(key);
    return {
      key,
      product,
      presentation,
      brand,
      category: v.category,
      p_price: v.p_price,
      f_price: v.f_price,
      date: v.date
    };
  });

  // Build tabs
  buildTabs(rows);

  // Interactivity
  const tableEl = document.getElementById('products-table');
  tableEl.querySelectorAll('th.sortable').forEach(th=>{
    th.addEventListener('click', ()=>{
      const key = th.dataset.key;
      if (currentSort.key === key){
        currentSort.dir = (currentSort.dir === 'asc') ? 'desc' : 'asc';
      } else {
        currentSort.key = key;
        currentSort.dir = (key === 'product' || key === 'brand' || key === 'category' || key === 'presentation') ? 'asc' : 'desc';
      }
      update();
    });
  });

  document.getElementById('tabs').addEventListener('click', (e)=>{
    const btn = e.target.closest('.tab');
    if (!btn) return;
    document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected','false'));
    btn.setAttribute('aria-selected','true');
    activeCategory = btn.dataset.id;
    update();
  });

  const search = document.getElementById('search');
  search.addEventListener('input', ()=>{
    searchTerm = search.value;
    update();
  });

  function update(){
    const filtered = filterRows(rows);
    const sorted = applySort(filtered);
    updateSortIndicators();
    renderRows(sorted);
  }

  update();
}

boot();
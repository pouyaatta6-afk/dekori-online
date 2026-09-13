// Admin panel — سایت‌ساز پازلی

if (sessionStorage.getItem('dekori_admin') !== '1') {
  location.href = 'login.html';
}

let currentPluginEdit = null;

document.addEventListener('DOMContentLoaded', () => {
  loadOverview();
  loadSettingsForm();
  loadPlugins();
  loadCustomCode();
  loadProductsTable();
  loadSellersTable();
  loadCatsTable();
  setupTabs();
  setupEvents();
  setupCodeTabs();
  setupSectionToggles();
});

function setupTabs() {
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      goTab(link.dataset.tab);
    });
  });
  document.querySelectorAll('[data-gotab]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      goTab(el.dataset.gotab);
    });
  });
}

function goTab(tab) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`.sidebar-nav a[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
}

function setupEvents() {
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('dekori_admin');
    location.href = 'login.html';
  });

  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('saveSettings2').addEventListener('click', saveSettings);
  document.getElementById('saveCode').addEventListener('click', saveCustomCode);
  document.getElementById('addSellerBtn').addEventListener('click', addSeller);
  document.getElementById('addCatBtn').addEventListener('click', addCategory);

  document.getElementById('setPrimaryColor').addEventListener('input', (e) => {
    document.getElementById('primaryLabel').textContent = e.target.value;
  });
  document.getElementById('setSecondaryColor').addEventListener('input', (e) => {
    document.getElementById('secondaryLabel').textContent = e.target.value;
  });

  document.getElementById('closePluginModal').addEventListener('click', () => {
    document.getElementById('pluginModal').classList.remove('active');
  });
  document.getElementById('savePluginSettings').addEventListener('click', savePluginSettings);

  document.getElementById('selectAllProducts').addEventListener('change', (e) => {
    const products = getData('products', DEFAULT_PRODUCTS);
    if (e.target.checked) products.forEach(p => selectedProductIds.add(p.id));
    else selectedProductIds.clear();
    loadProductsTable();
  });
  document.getElementById('bulkTransferBtn').addEventListener('click', bulkTransferProducts);
  document.getElementById('bulkClearSelBtn').addEventListener('click', () => {
    selectedProductIds.clear();
    loadProductsTable();
  });
  document.getElementById('closeAdminProductModal').addEventListener('click', () => {
    document.getElementById('adminProductModal').classList.remove('active');
  });
  document.getElementById('adminProductModal').addEventListener('click', (e) => {
    if (e.target.id === 'adminProductModal') e.target.classList.remove('active');
  });
  document.getElementById('saveAdminProduct').addEventListener('click', saveAdminProduct);
}

function setupCodeTabs() {
  document.querySelectorAll('.code-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('code-' + tab.dataset.code).classList.add('active');
    });
  });
}

function setupSectionToggles() {
  document.querySelectorAll('.section-toggle').forEach(label => {
    const cb = label.querySelector('input');
    const sync = () => label.classList.toggle('active', cb.checked);
    cb.addEventListener('change', sync);
    sync();
  });
}

function loadOverview() {
  const products = getData('products', DEFAULT_PRODUCTS);
  const sellers = getData('sellers', DEFAULT_SELLERS);
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const plugins = getData('plugins', DEFAULT_PLUGINS);
  document.getElementById('statProducts').textContent = products.length.toLocaleString('fa-IR');
  document.getElementById('statSellers').textContent = sellers.filter(s => s.active).length.toLocaleString('fa-IR');
  document.getElementById('statCats').textContent = cats.length.toLocaleString('fa-IR');
  document.getElementById('statPlugins').textContent = plugins.filter(p => p.enabled).length.toLocaleString('fa-IR');
}

function loadSettingsForm() {
  const s = getData('settings', DEFAULT_SETTINGS);
  document.getElementById('setSiteName').value = s.siteName || '';
  document.getElementById('setLogo').value = s.logo || '';
  document.getElementById('setHeroTitle').value = s.heroTitle || '';
  document.getElementById('setHeroSubtitle').value = s.heroSubtitle || '';
  document.getElementById('setAboutTitle').value = s.aboutTitle || '';
  document.getElementById('setAboutText').value = s.aboutText || '';
  document.getElementById('setContactEmail').value = s.contactEmail || '';
  document.getElementById('setContactPhone').value = s.contactPhone || '';
  document.getElementById('setContactAddress').value = s.contactAddress || '';
  document.getElementById('setFooterText').value = s.footerText || '';
  document.getElementById('setPrimaryColor').value = s.primaryColor || '#7c3aed';
  document.getElementById('setSecondaryColor').value = s.secondaryColor || '#f59e0b';
  document.getElementById('primaryLabel').textContent = s.primaryColor || '#7c3aed';
  document.getElementById('secondaryLabel').textContent = s.secondaryColor || '#f59e0b';
  document.getElementById('setShowHero').checked = s.showHero !== false;
  document.getElementById('setShowCategories').checked = s.showCategories !== false;
  document.getElementById('setShowAbout').checked = s.showAbout !== false;
  document.getElementById('setShowContact').checked = s.showContact !== false;
  document.getElementById('setDeliveryDaysMin').value = s.deliveryDaysMin != null ? s.deliveryDaysMin : 7;
  document.getElementById('setDeliveryDaysMax').value = s.deliveryDaysMax != null ? s.deliveryDaysMax : 15;
  document.getElementById('setShipNearLabel').value = s.shipNearLabel || 'اطراف فروشگاه';
  document.getElementById('setShipNearCost').value = s.shipNearCost != null ? s.shipNearCost : 200000;
  document.getElementById('setShipFarLabel').value = s.shipFarLabel || 'مناطق دورتر';
  document.getElementById('setShipFarCost').value = s.shipFarCost != null ? s.shipFarCost : 300000;
  setupSectionToggles();
}

function saveSettings() {
  const prev = getData('settings', DEFAULT_SETTINGS);
  const s = {
    ...prev,
    siteName: document.getElementById('setSiteName').value.trim() || 'دکوری آنلاین',
    logo: document.getElementById('setLogo').value.trim(),
    heroTitle: document.getElementById('setHeroTitle').value.trim(),
    heroSubtitle: document.getElementById('setHeroSubtitle').value.trim(),
    aboutTitle: document.getElementById('setAboutTitle').value.trim(),
    aboutText: document.getElementById('setAboutText').value.trim(),
    contactEmail: document.getElementById('setContactEmail').value.trim(),
    contactPhone: document.getElementById('setContactPhone').value.trim(),
    contactAddress: document.getElementById('setContactAddress').value.trim(),
    footerText: document.getElementById('setFooterText').value.trim(),
    primaryColor: document.getElementById('setPrimaryColor').value,
    secondaryColor: document.getElementById('setSecondaryColor').value,
    showHero: document.getElementById('setShowHero').checked,
    showCategories: document.getElementById('setShowCategories').checked,
    showAbout: document.getElementById('setShowAbout').checked,
    showContact: document.getElementById('setShowContact').checked,
    deliveryDaysMin: parseInt(document.getElementById('setDeliveryDaysMin').value, 10) || 0,
    deliveryDaysMax: parseInt(document.getElementById('setDeliveryDaysMax').value, 10) || 0,
    shipNearLabel: document.getElementById('setShipNearLabel').value.trim() || 'اطراف فروشگاه',
    shipNearCost: parseInt(document.getElementById('setShipNearCost').value, 10) || 0,
    shipFarLabel: document.getElementById('setShipFarLabel').value.trim() || 'مناطق دورتر',
    shipFarCost: parseInt(document.getElementById('setShipFarCost').value, 10) || 0
  };
  setData('settings', s);
  showToast('settingsSaved');
}

function loadPlugins() {
  const plugins = getData('plugins', DEFAULT_PLUGINS);
  const grid = document.getElementById('pluginsGrid');
  grid.innerHTML = plugins.map(p => `
    <div class="plugin-card ${p.enabled ? 'enabled' : ''}" data-id="${p.id}">
      <div class="plugin-header">
        <div class="plugin-icon"><i class="fas ${p.icon}"></i></div>
        <div class="plugin-info">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
        </div>
      </div>
      <div class="plugin-footer">
        <button class="plugin-settings-btn" onclick="openPluginSettings('${p.id}')">
          <i class="fas fa-cog"></i> تنظیمات
        </button>
        <label class="toggle-switch">
          <input type="checkbox" ${p.enabled ? 'checked' : ''} onchange="togglePlugin('${p.id}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `).join('');
  loadOverview();
}

function togglePlugin(id, enabled) {
  const plugins = getData('plugins', DEFAULT_PLUGINS);
  const p = plugins.find(x => x.id === id);
  if (p) {
    p.enabled = enabled;
    setData('plugins', plugins);
    loadPlugins();
  }
}

function openPluginSettings(id) {
  const plugins = getData('plugins', DEFAULT_PLUGINS);
  const p = plugins.find(x => x.id === id);
  if (!p) return;
  currentPluginEdit = id;
  document.getElementById('pluginModalTitle').textContent = 'تنظیمات: ' + p.name;

  let html = '';
  if (id === 'whatsapp') {
    html = `
      <div class="form-group"><label>شماره واتساپ (با کد کشور، بدون +)</label>
        <input type="text" class="form-control" id="ps_number" value="${p.settings.number || ''}" placeholder="989121234567"></div>
      <div class="form-group"><label>پیام پیش‌فرض</label>
        <input type="text" class="form-control" id="ps_message" value="${p.settings.message || ''}"></div>`;
  } else if (id === 'announcement') {
    html = `
      <div class="form-group"><label>متن اعلان</label>
        <input type="text" class="form-control" id="ps_text" value="${p.settings.text || ''}"></div>
      <div class="form-group"><label>رنگ پس‌زمینه</label>
        <input type="color" id="ps_bg" value="${p.settings.bg || '#7c3aed'}" style="width:60px;height:40px;border:none;background:none;cursor:pointer"></div>`;
  } else if (id === 'productbadge') {
    html = `
      <div class="form-group"><label>آستانه موجودی کم (کمتر از این عدد)</label>
        <input type="number" class="form-control" id="ps_threshold" value="${p.settings.threshold || 3}" min="1"></div>`;
  } else if (id === 'instagram') {
    html = `
      <div class="form-group"><label>نام کاربری اینستاگرام (بدون @)</label>
        <input type="text" class="form-control" id="ps_username" value="${p.settings.username || ''}"></div>`;
  } else {
    html = `<p style="color:#8b8ba0">این افزونه تنظیمات خاصی ندارد. فقط روشن/خاموش کنید.</p>`;
  }

  document.getElementById('pluginModalBody').innerHTML = html;
  document.getElementById('pluginModal').classList.add('active');
}

function savePluginSettings() {
  if (!currentPluginEdit) return;
  const plugins = getData('plugins', DEFAULT_PLUGINS);
  const p = plugins.find(x => x.id === currentPluginEdit);
  if (!p) return;

  if (currentPluginEdit === 'whatsapp') {
    p.settings.number = document.getElementById('ps_number')?.value || '';
    p.settings.message = document.getElementById('ps_message')?.value || '';
  } else if (currentPluginEdit === 'announcement') {
    p.settings.text = document.getElementById('ps_text')?.value || '';
    p.settings.bg = document.getElementById('ps_bg')?.value || '#7c3aed';
  } else if (currentPluginEdit === 'productbadge') {
    p.settings.threshold = parseInt(document.getElementById('ps_threshold')?.value, 10) || 3;
  } else if (currentPluginEdit === 'instagram') {
    p.settings.username = document.getElementById('ps_username')?.value || '';
  }

  setData('plugins', plugins);
  document.getElementById('pluginModal').classList.remove('active');
  loadPlugins();
}

function loadCustomCode() {
  const code = getData('customCode', DEFAULT_CUSTOM_CODE);
  document.getElementById('customCSS').value = code.customCSS || '';
  document.getElementById('customJS').value = code.customJS || '';
  document.getElementById('customHeaderHTML').value = code.customHeaderHTML || '';
  document.getElementById('customFooterHTML').value = code.customFooterHTML || '';
}

function saveCustomCode() {
  const code = {
    customCSS: document.getElementById('customCSS').value,
    customJS: document.getElementById('customJS').value,
    customHeaderHTML: document.getElementById('customHeaderHTML').value,
    customFooterHTML: document.getElementById('customFooterHTML').value
  };
  setData('customCode', code);
  showToast('codeSaved');
}

var selectedProductIds = new Set();

function loadProductsTable() {
  const products = getData('products', DEFAULT_PRODUCTS);
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const tbody = document.getElementById('productsTable');

  // Drop selections for products that no longer exist (deleted, etc.)
  const existingIds = new Set(products.map(p => p.id));
  selectedProductIds.forEach(id => { if (!existingIds.has(id)) selectedProductIds.delete(id); });

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#8b8ba0;padding:40px">محصولی وجود ندارد</td></tr>`;
    updateProductsBulkBar();
    return;
  }
  tbody.innerHTML = products.map(p => {
    const cat = cats.find(c => c.id === p.category);
    const checked = selectedProductIds.has(p.id) ? 'checked' : '';
    return `
      <tr>
        <td><input type="checkbox" class="product-select-cb" data-id="${p.id}" ${checked}></td>
        <td><img src="${p.image}" style="width:48px;height:48px;object-fit:cover;border-radius:10px" onerror="this.src='https://via.placeholder.com/48'"></td>
        <td>${p.title}</td>
        <td>${cat ? cat.name : p.category}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.sellerName}</td>
        <td>${p.stock}</td>
        <td class="actions">
          <button class="action-btn edit" onclick="openAdminProductEdit('${p.id}')" title="ویرایش"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteProduct('${p.id}')" title="حذف"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('.product-select-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) selectedProductIds.add(cb.dataset.id);
      else selectedProductIds.delete(cb.dataset.id);
      updateProductsBulkBar();
      syncSelectAllCheckbox();
    });
  });

  updateProductsBulkBar();
  syncSelectAllCheckbox();
}

function syncSelectAllCheckbox() {
  const all = document.getElementById('selectAllProducts');
  if (!all) return;
  const boxes = document.querySelectorAll('.product-select-cb');
  all.checked = boxes.length > 0 && Array.from(boxes).every(b => b.checked);
}

function updateProductsBulkBar() {
  const bar = document.getElementById('productsBulkBar');
  const countEl = document.getElementById('productsSelCount');
  const n = selectedProductIds.size;
  if (!bar) return;
  if (n === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  countEl.textContent = n.toLocaleString('fa-IR') + ' محصول انتخاب شده';

  const sellers = getData('sellers', DEFAULT_SELLERS);
  const select = document.getElementById('bulkTargetSeller');
  select.innerHTML = sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function deleteProduct(id) {
  if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
  let products = getData('products', DEFAULT_PRODUCTS).filter(p => p.id !== id);
  setData('products', products);
  selectedProductIds.delete(id);
  loadProductsTable();
  loadOverview();
}

function openAdminProductEdit(id) {
  const products = getData('products', DEFAULT_PRODUCTS);
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById('apId').value = p.id;
  document.getElementById('apTitle').value = p.title || '';

  const cats = getData('categories', DEFAULT_CATEGORIES);
  const catSel = document.getElementById('apCategory');
  catSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  catSel.value = p.category;

  const sellers = getData('sellers', DEFAULT_SELLERS);
  const sellerSel = document.getElementById('apSeller');
  sellerSel.innerHTML = sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  sellerSel.value = p.sellerId;

  document.getElementById('apPrice').value = p.price;
  document.getElementById('apStock').value = p.stock;
  document.getElementById('apImage').value = p.image || '';
  document.getElementById('apDesc').value = p.description || '';

  document.getElementById('adminProductModal').classList.add('active');
}

function saveAdminProduct() {
  const id = document.getElementById('apId').value;
  const products = getData('products', DEFAULT_PRODUCTS);
  const p = products.find(x => x.id === id);
  if (!p) return;

  p.title = document.getElementById('apTitle').value.trim();
  p.category = document.getElementById('apCategory').value;

  const newSellerId = document.getElementById('apSeller').value;
  if (newSellerId && newSellerId !== p.sellerId) {
    const sellers = getData('sellers', DEFAULT_SELLERS);
    const seller = sellers.find(s => s.id === newSellerId);
    if (seller) {
      p.sellerId = seller.id;
      p.sellerName = seller.name;
    }
  }

  p.price = parseInt(document.getElementById('apPrice').value, 10) || 0;
  p.stock = parseInt(document.getElementById('apStock').value, 10) || 0;
  p.image = document.getElementById('apImage').value.trim();
  p.description = document.getElementById('apDesc').value.trim();

  setData('products', products);
  document.getElementById('adminProductModal').classList.remove('active');
  loadProductsTable();
  loadOverview();
}

function bulkTransferProducts() {
  const targetId = document.getElementById('bulkTargetSeller').value;
  if (!targetId) return;
  const sellers = getData('sellers', DEFAULT_SELLERS);
  const seller = sellers.find(s => s.id === targetId);
  if (!seller) return;
  if (selectedProductIds.size === 0) return;

  if (!confirm(selectedProductIds.size.toLocaleString('fa-IR') + ' محصول به فروشگاه «' + seller.name + '» منتقل شود؟')) return;

  const products = getData('products', DEFAULT_PRODUCTS);
  products.forEach(p => {
    if (selectedProductIds.has(p.id)) {
      p.sellerId = seller.id;
      p.sellerName = seller.name;
    }
  });
  setData('products', products);
  selectedProductIds.clear();
  loadProductsTable();
  loadOverview();
}

window.openAdminProductEdit = openAdminProductEdit;
window.deleteProduct = deleteProduct;

function loadSellersTable() {
  const sellers = getData('sellers', DEFAULT_SELLERS);
  const tbody = document.getElementById('sellersTable');
  tbody.innerHTML = sellers.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.email || s.phone || '—'}</td>
      <td><code style="background:#0c0c12;padding:4px 10px;border-radius:6px;font-family:Fira Code,monospace">${s.password}</code></td>
      <td><span class="badge ${s.active ? 'badge-success' : 'badge-warning'}">${s.active ? 'فعال' : 'غیرفعال'}</span></td>
      <td class="actions">
        <button class="action-btn edit" onclick="toggleSeller('${s.id}')" title="تغییر وضعیت"><i class="fas fa-exchange-alt"></i></button>
        <button class="action-btn delete" onclick="deleteSeller('${s.id}')" title="حذف"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function addSeller() {
  const name = document.getElementById('sellerName').value.trim();
  const contact = document.getElementById('sellerContact').value.trim();
  if (!name || !contact) {
    alert('نام و ایمیل/تلفن را وارد کنید');
    return;
  }
  const password = generatePassword(8);
  const isEmail = contact.includes('@');
  const seller = {
    id: generateId('s'),
    name,
    email: isEmail ? contact : '',
    phone: isEmail ? '' : contact,
    password,
    active: true,
    createdAt: Date.now()
  };
  const sellers = getData('sellers', DEFAULT_SELLERS);
  sellers.push(seller);
  setData('sellers', sellers);

  document.getElementById('generatedPass').textContent = password;
  document.getElementById('sellerPassBox').classList.add('show');
  document.getElementById('sellerName').value = '';
  document.getElementById('sellerContact').value = '';
  loadSellersTable();
  loadOverview();
}

function toggleSeller(id) {
  const sellers = getData('sellers', DEFAULT_SELLERS);
  const s = sellers.find(x => x.id === id);
  if (s) {
    s.active = !s.active;
    setData('sellers', sellers);
    loadSellersTable();
    loadOverview();
  }
}

function deleteSeller(id) {
  if (!confirm('با حذف فروشنده، محصولات او هم حذف می‌شوند. ادامه می‌دهید؟')) return;
  let sellers = getData('sellers', DEFAULT_SELLERS).filter(s => s.id !== id);
  let products = getData('products', DEFAULT_PRODUCTS).filter(p => p.sellerId !== id);
  setData('sellers', sellers);
  setData('products', products);
  loadSellersTable();
  loadProductsTable();
  loadOverview();
}

function loadCatsTable() {
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const tbody = document.getElementById('catsTable');
  tbody.innerHTML = cats.map((c, i) => `
    <tr>
      <td>${c.name}</td>
      <td><code style="background:#0c0c12;padding:3px 8px;border-radius:6px">${c.id}</code></td>
      <td><i class="fas ${c.icon}"></i> ${c.icon}</td>
      <td class="actions">
        <button class="action-btn edit" onclick="moveCat(${i}, -1)" title="بالا" ${i === 0 ? 'disabled style="opacity:.3"' : ''}><i class="fas fa-arrow-up"></i></button>
        <button class="action-btn edit" onclick="moveCat(${i}, 1)" title="پایین" ${i === cats.length - 1 ? 'disabled style="opacity:.3"' : ''}><i class="fas fa-arrow-down"></i></button>
        <button class="action-btn delete" onclick="deleteCat('${c.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function moveCat(index, dir) {
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const j = index + dir;
  if (j < 0 || j >= cats.length) return;
  const tmp = cats[index];
  cats[index] = cats[j];
  cats[j] = tmp;
  setData('categories', cats);
  loadCatsTable();
}
window.moveCat = moveCat;

function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  let icon = document.getElementById('newCatIcon').value.trim() || 'fa-tag';
  if (!name) { alert('نام دسته‌بندی را وارد کنید'); return; }
  if (!icon.startsWith('fa-')) icon = 'fa-' + icon;
  const id = name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now().toString(36).slice(-4);
  const cats = getData('categories', DEFAULT_CATEGORIES);
  cats.push({ id, name, icon });
  setData('categories', cats);
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatIcon').value = '';
  loadCatsTable();
  loadOverview();
}

function deleteCat(id) {
  if (!confirm('حذف این دسته‌بندی؟')) return;
  let cats = getData('categories', DEFAULT_CATEGORIES).filter(c => c.id !== id);
  setData('categories', cats);
  loadCatsTable();
  loadOverview();
}

function showToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

window.deleteProduct = deleteProduct;
window.toggleSeller = toggleSeller;
window.deleteSeller = deleteSeller;
window.deleteCat = deleteCat;
window.togglePlugin = togglePlugin;
window.openPluginSettings = openPluginSettings;

/* ---- Pending Sellers ---- */
function loadPendingTable() {
  const pending = getData('pendingSellers', []);
  const tbody = document.getElementById('pendingTable');
  if (!tbody) return;
  if (pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8b8ba0;padding:40px">درخواستی وجود ندارد</td></tr>';
    return;
  }
  tbody.innerHTML = pending.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>${r.owner || '—'}</td>
      <td>${r.phone}</td>
      <td>${r.nationalId || '—'}</td>
      <td>${r.city || '—'}</td>
      <td><span class="badge ${r.status === 'pending' ? 'badge-warning' : r.status === 'approved' ? 'badge-success' : 'badge-warning'}">${
        r.status === 'pending' ? 'در انتظار' : r.status === 'approved' ? 'تایید شده' : 'رد شده'
      }</span></td>
      <td class="actions">
        ${r.status === 'pending' ? `
          <button class="action-btn edit" onclick="approveSeller('${r.id}')" title="تایید"><i class="fas fa-check"></i></button>
          <button class="action-btn delete" onclick="rejectSeller('${r.id}')" title="رد"><i class="fas fa-times"></i></button>
        ` : ''}
        <button class="action-btn edit" onclick="viewPending('${r.id}')" title="جزئیات"><i class="fas fa-eye"></i></button>
      </td>
    </tr>
  `).join('');
}

function viewPending(id) {
  const pending = getData('pendingSellers', []);
  const r = pending.find(x => x.id === id);
  if (!r) return;
  const box = document.getElementById('pendingDetail');
  box.style.display = 'block';
  box.innerHTML = `
    <h3>جزئیات درخواست: ${r.name}</h3>
    <div class="settings-grid" style="margin-top:16px">
      <div><strong>صاحب:</strong> ${r.owner}</div>
      <div><strong>موبایل:</strong> ${r.phone}</div>
      <div><strong>ایمیل:</strong> ${r.email || '—'}</div>
      <div><strong>کد ملی:</strong> ${r.nationalId}</div>
      <div><strong>کد پستی:</strong> ${r.postal}</div>
      <div><strong>شهر:</strong> ${r.city}</div>
    </div>
    <p style="margin-top:12px"><strong>آدرس:</strong> ${r.address}</p>
    ${r.desc ? `<p style="margin-top:8px;color:#8b8ba0">${r.desc}</p>` : ''}
    ${r.status === 'pending' ? `
      <div style="margin-top:16px;display:flex;gap:10px">
        <button class="btn-save" onclick="approveSeller('${r.id}')"><i class="fas fa-check"></i> تایید و ساخت رمز</button>
        <button class="btn btn-danger" onclick="rejectSeller('${r.id}')">رد</button>
      </div>
    ` : r.password ? `<p style="margin-top:12px;color:#34d399">رمز ساخته‌شده: <code>${r.password}</code></p>` : ''}
  `;
}

function approveSeller(id) {
  const pending = getData('pendingSellers', []);
  const r = pending.find(x => x.id === id);
  if (!r || r.status !== 'pending') return;
  const password = generatePassword(8);
  r.status = 'approved';
  r.password = password;
  setData('pendingSellers', pending);

  // Create actual seller account
  const sellers = getData('sellers', DEFAULT_SELLERS);
  sellers.push({
    id: generateId('s'),
    name: r.name,
    email: r.email || '',
    phone: r.phone,
    password,
    active: true,
    owner: r.owner,
    nationalId: r.nationalId,
    postal: r.postal,
    city: r.city,
    address: r.address,
    createdAt: Date.now()
  });
  setData('sellers', sellers);
  alert('فروشنده تایید شد!\nرمز عبور: ' + password + '\nاین رمز را به فروشنده بدهید.');
  loadPendingTable();
  loadSellersTable();
  loadOverview();
  viewPending(id);
}

function rejectSeller(id) {
  if (!confirm('این درخواست رد شود؟')) return;
  const pending = getData('pendingSellers', []);
  const r = pending.find(x => x.id === id);
  if (r) {
    r.status = 'rejected';
    setData('pendingSellers', pending);
  }
  loadPendingTable();
  const box = document.getElementById('pendingDetail');
  if (box) box.style.display = 'none';
}

/* ---- Tickets ---- */
function updateTicketBadge() {
  var tickets = getData('tickets', []);
  if (!Array.isArray(tickets)) tickets = [];
  var count = tickets.filter(function(t) {
    return t && t.status !== 'closed' && (t.unreadAdmin || t.createdBy === 'user' || t.createdBy === 'customer');
  }).length;
  // also count open tickets with last message from user
  if (!count) {
    count = tickets.filter(function(t) {
      if (!t || t.status === 'closed') return false;
      var msgs = t.messages || [];
      if (!msgs.length) return true;
      return msgs[msgs.length - 1].from !== 'admin';
    }).length;
  }
  var badge = document.getElementById('ticketBadge');
  if (badge) {
    if (count > 0) {
      badge.style.display = 'inline-flex';
      badge.textContent = count > 99 ? '99+' : String(count);
    } else {
      badge.style.display = 'none';
    }
  }
}

function loadTicketsTable() {
  const tickets = getData('tickets', []);
  const tbody = document.getElementById('ticketsTable');
  if (!tbody) return;
  updateTicketBadge();
  loadQuickRecipients();
  if (tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8b8ba0;padding:40px">تیکتی وجود ندارد</td></tr>';
    return;
  }
  tbody.innerHTML = tickets.map(t => {
    const date = new Date(t.createdAt).toLocaleDateString('fa-IR');
    const unread = t.status !== 'closed' && ((t.messages && t.messages.length && t.messages[t.messages.length-1].from !== 'admin') || t.unreadAdmin);
    return `
    <tr style="${unread ? 'background:rgba(239,68,68,.08)' : ''}">
      <td><code>${t.id}</code>${unread ? ' <span style="color:#f87171;font-weight:800">●</span>' : ''}</td>
      <td>${t.name || t.customerName || '—'}</td>
      <td>${t.subject || ''}</td>
      <td>${t.contact || t.customerPhone || ''}</td>
      <td><span class="badge ${t.status === 'open' ? 'badge-warning' : 'badge-success'}">${t.status === 'open' ? 'باز' : 'بسته'}</span></td>
      <td>${date}</td>
      <td class="actions">
        <button class="action-btn edit" onclick="viewTicket('${t.id}')" title="مشاهده"><i class="fas fa-eye"></i></button>
        ${t.status === 'open' ? `<button class="action-btn edit" onclick="closeTicket('${t.id}')" title="بستن"><i class="fas fa-check"></i></button>` : ''}
        <button class="action-btn delete" onclick="deleteTicket('${t.id}')" title="حذف"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function loadQuickRecipients() {
  var box = document.getElementById('quickRecipients');
  if (!box) return;
  var customers = getData('customers', []) || [];
  var orders = getData('orders', []) || [];
  var map = {};
  customers.forEach(function(c) {
    var phone = (c.phone || '').trim();
    if (phone) map[phone] = { phone: phone, name: c.name || '' };
  });
  orders.forEach(function(o) {
    var phone = (o.customerPhone || '').trim();
    if (phone) map[phone] = { phone: phone, name: o.customerName || map[phone] && map[phone].name || '' };
  });
  var list = Object.keys(map).map(function(k){ return map[k]; });
  if (!list.length) {
    box.innerHTML = '<div style="color:#8b8ba0;font-size:.9rem">هنوز مشتری/سفارشی نیست</div>';
    return;
  }
  box.innerHTML = list.slice(0, 50).map(function(c, i) {
    return '<label><input type="checkbox" class="quick-rec-check" value="' + c.phone + '" data-name="' + (c.name || '').replace(/"/g, '') + '"> ' +
      (c.name ? c.name + ' — ' : '') + c.phone + '</label>';
  }).join('');
}

function parseRecipients(raw) {
  raw = (raw || '').replace(/[\n\r;]+/g, ',');
  return raw.split(',').map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 5; })
    .filter(function(v, i, a){ return a.indexOf(v) === i; });
}

function sendBulkTickets() {
  var raw = (document.getElementById('bulkRecipients') || {}).value || '';
  var subject = ((document.getElementById('bulkSubject') || {}).value || '').trim();
  var message = ((document.getElementById('bulkMessage') || {}).value || '').trim();
  var recipients = parseRecipients(raw);
  if (!recipients.length) { alert('حداقل یک شماره گیرنده وارد کنید'); return; }
  if (!subject) { alert('موضوع را بنویسید'); return; }
  if (!message) { alert('متن پیام را بنویسید'); return; }

  var tickets = getData('tickets', []);
  if (!Array.isArray(tickets)) tickets = [];
  var customers = getData('customers', []) || [];
  var created = 0;
  recipients.forEach(function(phone) {
    var cust = customers.find(function(c){ return (c.phone || '') === phone; });
    var ticket = {
      id: 'TKT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
      subject: subject,
      message: message,
      messages: [{ from: 'admin', text: message, at: Date.now() }],
      status: 'open',
      contact: phone,
      name: (cust && cust.name) || phone,
      customerId: (cust && cust.id) || '',
      customerName: (cust && cust.name) || '',
      customerPhone: phone,
      createdBy: 'admin',
      unreadCustomer: true,
      unreadAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    tickets.unshift(ticket);
    created++;
  });
  setData('tickets', tickets);
  loadTicketsTable();
  var toast = document.getElementById('bulkTicketToast');
  if (toast) {
    toast.style.display = 'inline';
    toast.textContent = created + ' تیکت ارسال شد';
    setTimeout(function(){ toast.style.display = 'none'; }, 3000);
  }
  document.getElementById('bulkMessage').value = '';
  alert(created + ' تیکت با موفقیت برای گیرندگان ارسال شد');
}

function addSelectedRecipients() {
  var checks = document.querySelectorAll('.quick-rec-check:checked');
  var ta = document.getElementById('bulkRecipients');
  if (!ta) return;
  var current = parseRecipients(ta.value);
  checks.forEach(function(ch) {
    if (current.indexOf(ch.value) === -1) current.push(ch.value);
  });
  ta.value = current.join('\n');
}


function viewTicket(id) {
  const tickets = getData('tickets', []);
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  const box = document.getElementById('ticketDetail');
  box.style.display = 'block';
  box.innerHTML = `
    <h3>تیکت ${t.id}</h3>
    <p style="margin:12px 0"><strong>از:</strong> ${t.name} — ${t.contact}</p>
    <p><strong>موضوع:</strong> ${t.subject}</p>
    <div style="background:#0c0c12;padding:16px;border-radius:12px;margin:16px 0;line-height:1.8">${t.message}</div>
    ${t.reply ? `<div style="background:rgba(16,185,129,0.1);padding:16px;border-radius:12px;margin-bottom:16px"><strong>پاسخ شما:</strong><br>${t.reply}</div>` : ''}
    ${t.status === 'open' ? `
      <div class="form-group">
        <label>پاسخ (اختیاری — فقط برای یادداشت داخلی)</label>
        <textarea class="form-control" id="ticketReply" rows="3"></textarea>
      </div>
      <button class="btn-save" onclick="replyAndClose('${t.id}')"><i class="fas fa-check"></i> ثبت پاسخ و بستن</button>
    ` : '<p style="color:#34d399">این تیکت بسته شده است</p>'}
  `;
}

function replyAndClose(id) {
  const tickets = getData('tickets', []);
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  if (typeof normalizeTicketAdmin === 'function') normalizeTicketAdmin(t);
  else if (!Array.isArray(t.messages)) t.messages = [];
  const reply = (document.getElementById('ticketReply') && document.getElementById('ticketReply').value || '').trim();
  if (reply) {
    t.messages.push({ from: 'admin', text: reply, at: Date.now() });
    t.reply = reply;
    t.unreadCustomer = true;
    t.unreadAdmin = false;
  }
  t.status = 'closed';
  setData('tickets', tickets);
  loadTicketsTable();
  viewTicket(id);
}

function closeTicket(id) {
  const tickets = getData('tickets', []);
  const t = tickets.find(x => x.id === id);
  if (t) { t.status = 'closed'; setData('tickets', tickets); }
  loadTicketsTable();
}

function deleteTicket(id) {
  if (!confirm('حذف این تیکت؟')) return;
  let tickets = getData('tickets', []).filter(t => t.id !== id);
  setData('tickets', tickets);
  loadTicketsTable();
  const box = document.getElementById('ticketDetail');
  if (box) box.style.display = 'none';
}

// Hook into existing DOMContentLoaded by re-calling if needed
document.addEventListener('DOMContentLoaded', () => {
  loadPendingTable();
  loadTicketsTable();
  updateTicketBadge();
  var sendBtn = document.getElementById('sendBulkTicketsBtn');
  if (sendBtn) sendBtn.addEventListener('click', sendBulkTickets);
  var addBtn = document.getElementById('addSelectedRecipientsBtn');
  if (addBtn) addBtn.addEventListener('click', addSelectedRecipients);
  document.querySelectorAll('.sidebar-nav a[data-tab="tickets"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(function(){ loadTicketsTable(); updateTicketBadge(); }, 40); });
  });
});

window.approveSeller = approveSeller;
window.rejectSeller = rejectSeller;
window.viewPending = viewPending;
window.viewTicket = viewTicket;
window.closeTicket = closeTicket;
window.deleteTicket = deleteTicket;
window.replyAndClose = replyAndClose;
window.sendBulkTickets = sendBulkTickets;
window.addSelectedRecipients = addSelectedRecipients;
window.updateTicketBadge = updateTicketBadge;

/* ---- Payments ---- */
function loadPayments() {
  var payments = getData('payments', typeof DEFAULT_PAYMENT_GATEWAYS !== 'undefined' ? DEFAULT_PAYMENT_GATEWAYS : []);
  var grid = document.getElementById('paymentsGrid');
  if (!grid) return;
  grid.innerHTML = payments.map(function(g) {
    return '<div class="plugin-card ' + (g.active ? 'enabled' : '') + '" data-id="' + g.id + '">' +
      '<div class="plugin-header"><div class="plugin-icon"><i class="fas ' + (g.icon || 'fa-credit-card') + '"></i></div>' +
      '<div class="plugin-info"><h3>' + g.name + '</h3><p>' + g.id + '</p></div></div>' +
      '<div class="form-group" style="margin-top:12px"><label>کد پذیرنده / Merchant ID</label>' +
      '<input type="text" class="form-control pay-merchant" data-id="' + g.id + '" value="' + (g.merchantId || '') + '" placeholder="کد پذیرنده"></div>' +
      (g.id === 'cardtocard' ?
        '<div class="form-group"><label>شماره کارت</label><input type="text" class="form-control pay-card" data-id="' + g.id + '" value="' + (g.cardNumber || '') + '" placeholder="6037-..."></div>' +
        '<div class="form-group"><label>به نام</label><input type="text" class="form-control pay-owner" data-id="' + g.id + '" value="' + (g.cardOwner || '') + '" placeholder="نام صاحب حساب"></div>'
      : '') +
      '<div class="plugin-footer"><span style="font-size:.85rem;color:#8b8ba0">' + (g.active ? 'فعال' : 'غیرفعال') + '</span>' +
      '<label class="toggle-switch"><input type="checkbox" ' + (g.active ? 'checked' : '') + ' onchange="togglePayment(\'' + g.id + '\', this.checked)">' +
      '<span class="toggle-slider"></span></label></div></div>';
  }).join('');
}

function togglePayment(id, active) {
  var payments = getData('payments', []);
  var g = payments.find(function(x) { return x.id === id; });
  if (g) { g.active = active; setData('payments', payments); loadPayments(); }
}

function savePayments() {
  var payments = getData('payments', []);
  document.querySelectorAll('.pay-merchant').forEach(function(inp) {
    var g = payments.find(function(x) { return x.id === inp.getAttribute('data-id'); });
    if (g) g.merchantId = inp.value.trim();
  });
  document.querySelectorAll('.pay-card').forEach(function(inp) {
    var g = payments.find(function(x) { return x.id === inp.getAttribute('data-id'); });
    if (g) g.cardNumber = inp.value.trim();
  });
  document.querySelectorAll('.pay-owner').forEach(function(inp) {
    var g = payments.find(function(x) { return x.id === inp.getAttribute('data-id'); });
    if (g) g.cardOwner = inp.value.trim();
  });
  setData('payments', payments);
  var t = document.getElementById('paymentsSaved');
  if (t) { t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 2000); }
}

// Enhance openPluginSettings for contact plugins
var _origOpenPlugin = typeof openPluginSettings === 'function' ? openPluginSettings : null;
openPluginSettings = function(id) {
  var plugins = getData('plugins', DEFAULT_PLUGINS);
  var p = plugins.find(function(x) { return x.id === id; });
  if (!p) return;
  currentPluginEdit = id;
  document.getElementById('pluginModalTitle').textContent = 'تنظیمات: ' + p.name;
  var site = getData('settings', DEFAULT_SETTINGS);
  var html = '';

  if (id === 'whatsapp') {
    html = '<div class="form-group"><label>شماره واتساپ (با کد کشور بدون +)</label>' +
      '<input type="text" class="form-control" id="ps_number" value="' + (p.settings.number || '') + '"></div>' +
      '<div class="form-group"><label>پیام پیش‌فرض</label>' +
      '<input type="text" class="form-control" id="ps_message" value="' + (p.settings.message || '') + '"></div>' +
      '<p style="color:#8b8ba0;font-size:.85rem">یا از شماره سایت استفاده شود: <strong>' + (site.contactPhone || '—') + '</strong></p>';
  } else if (id === 'telegram') {
    html = '<div class="form-group"><label>یوزرنیم تلگرام (بدون @)</label>' +
      '<input type="text" class="form-control" id="ps_username" value="' + (p.settings.username || '') + '"></div>';
  } else if (id === 'instagram') {
    html = '<div class="form-group"><label>یوزرنیم اینستاگرام</label>' +
      '<input type="text" class="form-control" id="ps_username" value="' + (p.settings.username || '') + '"></div>';
  } else if (id === 'announcement' || id === 'marquee') {
    html = '<div class="form-group"><label>متن</label>' +
      '<input type="text" class="form-control" id="ps_text" value="' + (p.settings.text || '') + '"></div>';
    if (id === 'announcement') {
      html += '<div class="form-group"><label>رنگ پس‌زمینه</label>' +
        '<input type="color" id="ps_bg" value="' + (p.settings.bg || '#7c3aed') + '" style="width:60px;height:40px;border:none;background:none"></div>';
    }
  } else if (id === 'productbadge') {
    html = '<div class="form-group"><label>آستانه موجودی کم</label>' +
      '<input type="number" class="form-control" id="ps_threshold" value="' + (p.settings.threshold || 3) + '" min="1"></div>';
  } else if (id === 'countdown') {
    var cdVal = p.settings.endDate ? new Date(p.settings.endDate).toISOString().slice(0, 16) : '';
    html = '<div class="form-group"><label>تاریخ و ساعت پایان</label>' +
      '<input type="datetime-local" class="form-control" id="ps_endDate" value="' + cdVal + '"></div>' +
      '<div class="form-group"><label>متن</label><input type="text" class="form-control" id="ps_text" value="' + (p.settings.text || 'فروش ویژه به پایان می‌رسد:') + '"></div>' +
      '<div class="form-group"><label>رنگ پس‌زمینه</label>' +
      '<input type="color" id="ps_bg" value="' + (p.settings.bg || '#111827') + '" style="width:60px;height:40px;border:none;background:none"></div>';
  } else if (id === 'exitintent') {
    html = '<div class="form-group"><label>عنوان</label><input type="text" class="form-control" id="ps_title" value="' + (p.settings.title || '') + '"></div>' +
      '<div class="form-group"><label>متن</label><input type="text" class="form-control" id="ps_text" value="' + (p.settings.text || '') + '"></div>' +
      '<div class="form-group"><label>کد تخفیف</label><input type="text" class="form-control" id="ps_code" value="' + (p.settings.code || '') + '"></div>';
  } else if (id === 'contactfloat' || id === 'quickcall' || id === 'emailfloat' || id === 'copyphone' || id === 'maplink') {
    html = '<p style="color:#c4b5fd;line-height:1.8;margin-bottom:12px">این افزونه اطلاعات را از <strong>تنظیمات سایت</strong> می‌گیرد:</p>' +
      '<div style="background:#0c0c12;padding:14px;border-radius:10px;font-size:.9rem;line-height:2">' +
      '<div>📞 تلفن: <strong>' + (site.contactPhone || '—') + '</strong></div>' +
      '<div>✉️ ایمیل: <strong>' + (site.contactEmail || '—') + '</strong></div>' +
      '<div>📍 آدرس: <strong>' + (site.contactAddress || '—') + '</strong></div></div>' +
      '<p style="color:#8b8ba0;font-size:.85rem;margin-top:12px">برای تغییر، از بخش «سازنده سایت» استفاده کن.</p>' +
      '<label style="display:flex;align-items:center;gap:8px;margin-top:12px"><input type="checkbox" id="ps_useSite" ' + (p.settings.useSitePhone !== false && p.settings.useSiteEmail !== false ? 'checked' : '') + '> استفاده از اطلاعات سایت</label>';
  } else if (id === 'coupon') {
    html = '<div class="form-group"><label>کد تخفیف</label><input type="text" class="form-control" id="ps_code" value="' + (p.settings.code || 'OFF10') + '"></div>' +
      '<div class="form-group"><label>متن</label><input type="text" class="form-control" id="ps_text" value="' + (p.settings.text || 'کد تخفیف ویژه') + '"></div>';
  } else {
    html = '<p style="color:#8b8ba0">این افزونه تنظیمات خاصی ندارد. فقط روشن/خاموش کنید.</p>' +
      '<p style="color:#6b6b80;font-size:.85rem;margin-top:8px">اگر به اطلاعات تماس نیاز دارد، از بخش سازنده سایت (ایمیل، تلفن، آدرس) استفاده می‌کند.</p>';
  }

  document.getElementById('pluginModalBody').innerHTML = html;
  document.getElementById('pluginModal').classList.add('active');
};

// Override savePluginSettings
savePluginSettings = function() {
  if (!currentPluginEdit) return;
  var plugins = getData('plugins', DEFAULT_PLUGINS);
  var p = plugins.find(function(x) { return x.id === currentPluginEdit; });
  if (!p) return;
  var id = currentPluginEdit;
  if (id === 'whatsapp') {
    p.settings.number = document.getElementById('ps_number') ? document.getElementById('ps_number').value : '';
    p.settings.message = document.getElementById('ps_message') ? document.getElementById('ps_message').value : '';
  } else if (id === 'telegram' || id === 'instagram') {
    p.settings.username = document.getElementById('ps_username') ? document.getElementById('ps_username').value : '';
  } else if (id === 'announcement') {
    p.settings.text = document.getElementById('ps_text') ? document.getElementById('ps_text').value : '';
    p.settings.bg = document.getElementById('ps_bg') ? document.getElementById('ps_bg').value : '#7c3aed';
  } else if (id === 'marquee') {
    p.settings.text = document.getElementById('ps_text') ? document.getElementById('ps_text').value : '';
  } else if (id === 'productbadge') {
    p.settings.threshold = parseInt(document.getElementById('ps_threshold') && document.getElementById('ps_threshold').value, 10) || 3;
  } else if (id === 'countdown') {
    var cdInp = document.getElementById('ps_endDate');
    p.settings.endDate = cdInp && cdInp.value ? new Date(cdInp.value).toISOString() : '';
    p.settings.text = document.getElementById('ps_text') ? document.getElementById('ps_text').value : '';
    p.settings.bg = document.getElementById('ps_bg') ? document.getElementById('ps_bg').value : '#111827';
  } else if (id === 'exitintent') {
    p.settings.title = document.getElementById('ps_title') ? document.getElementById('ps_title').value : '';
    p.settings.text = document.getElementById('ps_text') ? document.getElementById('ps_text').value : '';
    p.settings.code = document.getElementById('ps_code') ? document.getElementById('ps_code').value : '';
  } else if (id === 'coupon') {
    p.settings.code = document.getElementById('ps_code') ? document.getElementById('ps_code').value : '';
    p.settings.text = document.getElementById('ps_text') ? document.getElementById('ps_text').value : '';
  } else if (id === 'contactfloat' || id === 'quickcall' || id === 'emailfloat') {
    p.settings.useSitePhone = document.getElementById('ps_useSite') ? document.getElementById('ps_useSite').checked : true;
    p.settings.useSiteEmail = p.settings.useSitePhone;
  }
  setData('plugins', plugins);
  document.getElementById('pluginModal').classList.remove('active');
  loadPlugins();
};

document.addEventListener('DOMContentLoaded', function() {
  loadPayments();
  var btn = document.getElementById('savePayments');
  if (btn) btn.addEventListener('click', savePayments);
});

window.togglePayment = togglePayment;
window.openPluginSettings = openPluginSettings;
window.savePluginSettings = savePluginSettings;

// Patch openPluginSettings for AI
(function() {
  var prev = openPluginSettings;
  openPluginSettings = function(id) {
    if (id === 'aiassistant' || id === 'aiproductdesc') {
      var plugins = getData('plugins', DEFAULT_PLUGINS);
      var p = plugins.find(function(x) { return x.id === id; });
      if (!p) return;
      currentPluginEdit = id;
      document.getElementById('pluginModalTitle').textContent = 'تنظیمات: ' + p.name;
      var s = p.settings || {};
      document.getElementById('pluginModalBody').innerHTML =
        '<div class="form-group"><label>ارائه‌دهنده</label>' +
        '<select class="form-control" id="ps_provider">' +
        '<option value="openai"' + (s.provider==='openai'?' selected':'') + '>OpenAI</option>' +
        '<option value="custom"' + (s.provider==='custom'?' selected':'') + '>سفارشی (Compatible API)</option>' +
        '</select></div>' +
        '<div class="form-group"><label>API Key</label>' +
        '<input type="password" class="form-control" id="ps_apiKey" value="' + (s.apiKey || '') + '" placeholder="sk-..."></div>' +
        '<div class="form-group"><label>Base URL</label>' +
        '<input type="text" class="form-control" id="ps_baseUrl" value="' + (s.baseUrl || 'https://api.openai.com/v1') + '" placeholder="https://api.openai.com/v1"></div>' +
        '<div class="form-group"><label>مدل</label>' +
        '<input type="text" class="form-control" id="ps_model" value="' + (s.model || 'gpt-4o-mini') + '" placeholder="gpt-4o-mini"></div>' +
        (id === 'aiassistant' ?
          '<div class="form-group"><label>System Prompt</label><textarea class="form-control" id="ps_systemPrompt" rows="3">' + (s.systemPrompt || '') + '</textarea></div>' +
          '<div class="form-group"><label>پیام خوش‌آمد</label><input type="text" class="form-control" id="ps_welcome" value="' + (s.welcome || '') + '"></div>'
        : '') +
        '<p style="color:#8b8ba0;font-size:.85rem;margin-top:8px">کلید API فقط در مرورگر شما ذخیره می‌شود (localStorage).</p>';
      document.getElementById('pluginModal').classList.add('active');
      return;
    }
    prev(id);
  };

  var prevSave = savePluginSettings;
  savePluginSettings = function() {
    if (currentPluginEdit === 'aiassistant' || currentPluginEdit === 'aiproductdesc') {
      var plugins = getData('plugins', DEFAULT_PLUGINS);
      var p = plugins.find(function(x) { return x.id === currentPluginEdit; });
      if (!p) return;
      p.settings = p.settings || {};
      p.settings.provider = document.getElementById('ps_provider') ? document.getElementById('ps_provider').value : 'openai';
      p.settings.apiKey = document.getElementById('ps_apiKey') ? document.getElementById('ps_apiKey').value.trim() : '';
      p.settings.baseUrl = document.getElementById('ps_baseUrl') ? document.getElementById('ps_baseUrl').value.trim() : '';
      p.settings.model = document.getElementById('ps_model') ? document.getElementById('ps_model').value.trim() : 'gpt-4o-mini';
      if (currentPluginEdit === 'aiassistant') {
        p.settings.systemPrompt = document.getElementById('ps_systemPrompt') ? document.getElementById('ps_systemPrompt').value : '';
        p.settings.welcome = document.getElementById('ps_welcome') ? document.getElementById('ps_welcome').value : '';
      }
      setData('plugins', plugins);
      document.getElementById('pluginModal').classList.remove('active');
      loadPlugins();
      return;
    }
    prevSave();
  };
})();

// Reload payments when opening tab
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-nav a[data-tab="payments"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadPayments, 50); });
  });
});

// Generic plugin settings UI for all plugins
(function() {
  var labels = {
    number: 'شماره',
    message: 'پیام',
    color: 'رنگ',
    position: 'موقعیت روی صفحه',
    offsetX: 'فاصله افقی (px)',
    offsetY: 'فاصله عمودی (px)',
    size: 'اندازه (px)',
    text: 'متن',
    bg: 'رنگ پس‌زمینه',
    textColor: 'رنگ متن',
    section: 'بخش صفحه',
    speed: 'سرعت',
    threshold: 'آستانه',
    duration: 'مدت (ms)',
    intensity: 'شدت',
    count: 'تعداد',
    title: 'عنوان',
    code: 'کد',
    btnColor: 'رنگ دکمه',
    username: 'نام کاربری',
    showAfter: 'نمایش بعد از اسکرول (px)',
    frequency: 'فرکانس صدا',
    volume: 'بلندی صدا',
    type: 'نوع صدا',
    provider: 'ارائه‌دهنده',
    apiKey: 'API Key',
    model: 'مدل',
    baseUrl: 'آدرس API (Base URL)',
    systemPrompt: 'System Prompt',
    welcome: 'پیام خوش‌آمد',
    min: 'حداقل',
    max: 'حداکثر',
    prefix: 'پیشوند متن',
    opacity: 'شفافیت',
    radius: 'گردی گوشه',
    width: 'عرض',
    height: 'ارتفاع',
    blur: 'تاری',
    scale: 'مقیاس',
    delay: 'تأخیر',
    topOffset: 'فاصله از بالا',
    behavior: 'رفتار اسکرول',
    colors: 'رنگ‌ها (با کاما)',
    useSitePhone: 'استفاده از تلفن سایت',
    useSiteEmail: 'استفاده از ایمیل سایت',
    blockSelect: 'مسدود کردن انتخاب متن',
    blockContext: 'مسدود کردن راست‌کلیک',
    smooth: 'اسکرول نرم',
    showProgress: 'نمایش نوار پیشرفت',
    activeColor: 'رنگ فعال',
    overlay: 'رنگ پوشش',
    mode: 'حالت تشخیص مناسبت',
    forceOccasion: 'مناسبت انتخابی (در حالت دستی)',
    cooldownHours: 'فاصله بین دو چرخش (ساعت)',
    prizes: 'جایزه‌ها — هر خط: برچسب|کد تخفیف|رنگ (کد خالی = پوچ)'
  };

  var modeOptions = [['auto', 'خودکار (بر اساس تاریخ روز)'], ['manual', 'دستی (برای تست)']];
  var occasionOptions = [
    ['auto', 'خودکار'], ['none', 'هیچ‌کدام / خاموش'],
    ['nowruz', '🌷 نوروز'], ['yalda', '🌙 شب یلدا'],
    ['halloween', '🎃 هالووین'], ['christmas', '🎄 کریسمس و سال نو']
  ];

  var positionOptions = [
    ['bottom-left','پایین چپ'],['bottom-right','پایین راست'],
    ['top-left','بالا چپ'],['top-right','بالا راست'],
    ['bottom-center','پایین وسط'],['top-center','بالا وسط'],['center','وسط']
  ];
  var sectionOptions = [
    ['all','کل سایت'],['hero','بخش قهرمان'],['products','محصولات'],
    ['categories','دسته‌بندی‌ها'],['header','هدر'],['footer','فوتر'],
    ['top','بالای صفحه'],['body','بدنه'],['cards','کارت‌ها']
  ];

  function fieldHtml(key, val) {
    var label = labels[key] || key;
    if (key === 'mode') {
      var mopts = modeOptions.map(function(o) {
        return '<option value="'+o[0]+'"'+(val===o[0]?' selected':'')+'>'+o[1]+'</option>';
      }).join('');
      return '<div class="form-group"><label>'+label+'</label><select class="form-control ps-field" data-key="'+key+'">'+mopts+'</select></div>';
    }
    if (key === 'forceOccasion') {
      var fopts = occasionOptions.map(function(o) {
        return '<option value="'+o[0]+'"'+((val||'auto')===o[0]?' selected':'')+'>'+o[1]+'</option>';
      }).join('');
      return '<div class="form-group"><label>'+label+'</label><select class="form-control ps-field" data-key="'+key+'">'+fopts+'</select>' +
        '<p style="color:#6b6b80;font-size:.8rem;margin-top:6px">فقط وقتی «حالت تشخیص مناسبت» روی دستی باشد اثر دارد.</p></div>';
    }
    if (key === 'intensity') {
      var iopts = [['normal','عادی (با افکت ریزش)'],['subtle','ملایم (فقط نوار و پس‌زمینه)']].map(function(o) {
        return '<option value="'+o[0]+'"'+(val===o[0]?' selected':'')+'>'+o[1]+'</option>';
      }).join('');
      return '<div class="form-group"><label>'+label+'</label><select class="form-control ps-field" data-key="'+key+'">'+iopts+'</select></div>';
    }
    if (key === 'prizes') {
      return '<div class="form-group"><label>'+label+'</label><textarea class="form-control ps-field" data-key="'+key+'" rows="6" style="font-family:monospace">'+(val||'')+'</textarea></div>';
    }
    if (key === 'position') {
      var opts = positionOptions.map(function(o) {
        return '<option value="'+o[0]+'"'+(val===o[0]?' selected':'')+'>'+o[1]+'</option>';
      }).join('');
      return '<div class="form-group"><label>'+label+'</label><select class="form-control ps-field" data-key="'+key+'">'+opts+'</select></div>';
    }
    if (key === 'section') {
      var opts = sectionOptions.map(function(o) {
        return '<option value="'+o[0]+'"'+(val===o[0]?' selected':'')+'>'+o[1]+'</option>';
      }).join('');
      return '<div class="form-group"><label>'+label+'</label><select class="form-control ps-field" data-key="'+key+'">'+opts+'</select></div>';
    }
    if (typeof val === 'boolean' || key.indexOf('useSite')===0 || key.indexOf('block')===0 || key==='smooth' || key==='showProgress') {
      return '<div class="form-group"><label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="ps-field" data-key="'+key+'" '+(val?'checked':'')+'> '+label+'</label></div>';
    }
    if (key === 'color' || key === 'bg' || key === 'textColor' || key === 'btnColor' || key === 'activeColor' || (typeof val === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(val))) {
      return '<div class="form-group"><label>'+label+'</label><div style="display:flex;gap:10px;align-items:center"><input type="color" class="ps-field" data-key="'+key+'" value="'+(val||'#7c3aed')+'" style="width:50px;height:36px;border:none;background:none;cursor:pointer"><input type="text" class="form-control ps-field-text" data-key="'+key+'" value="'+(val||'')+'" style="flex:1"></div></div>';
    }
    if (key === 'apiKey') {
      return '<div class="form-group"><label>'+label+'</label><input type="password" class="form-control ps-field" data-key="'+key+'" value="'+(val||'')+'" placeholder="sk-..."></div>';
    }
    if (key === 'systemPrompt' || (typeof val === 'string' && val.length > 60)) {
      return '<div class="form-group"><label>'+label+'</label><textarea class="form-control ps-field" data-key="'+key+'" rows="3">'+(val||'')+'</textarea></div>';
    }
    if (typeof val === 'number') {
      return '<div class="form-group"><label>'+label+'</label><input type="number" class="form-control ps-field" data-key="'+key+'" value="'+val+'" step="any"></div>';
    }
    return '<div class="form-group"><label>'+label+'</label><input type="text" class="form-control ps-field" data-key="'+key+'" value="'+(val!=null?val:'')+'"></div>';
  }

  openPluginSettings = function(id) {
    var plugins = getData('plugins', DEFAULT_PLUGINS);
    var p = plugins.find(function(x) { return x.id === id; });
    if (!p) return;
    currentPluginEdit = id;
    document.getElementById('pluginModalTitle').textContent = 'تنظیمات: ' + p.name;
    var s = p.settings || {};
    var keys = Object.keys(s);
    var html = '<p style="color:#8b8ba0;font-size:.9rem;margin-bottom:14px;line-height:1.7">' + (p.desc || '') + '</p>';
    if (!keys.length) {
      html += '<p style="color:#6b6b80">این افزونه تنظیمات اضافی ندارد. فقط روشن/خاموش کنید.</p>';
    } else {
      keys.forEach(function(k) { html += fieldHtml(k, s[k]); });
    }
    document.getElementById('pluginModalBody').innerHTML = html;
    // sync color text inputs
    document.querySelectorAll('.ps-field[type="color"]').forEach(function(inp) {
      inp.addEventListener('input', function() {
        var t = document.querySelector('.ps-field-text[data-key="'+inp.getAttribute('data-key')+'"]');
        if (t) t.value = inp.value;
      });
    });
    document.getElementById('pluginModal').classList.add('active');
  };

  savePluginSettings = function() {
    if (!currentPluginEdit) return;
    var plugins = getData('plugins', DEFAULT_PLUGINS);
    var p = plugins.find(function(x) { return x.id === currentPluginEdit; });
    if (!p) return;
    p.settings = p.settings || {};
    document.querySelectorAll('.ps-field').forEach(function(el) {
      var key = el.getAttribute('data-key');
      if (!key) return;
      if (el.type === 'checkbox') p.settings[key] = el.checked;
      else if (el.type === 'number') p.settings[key] = parseFloat(el.value) || 0;
      else if (el.type === 'color') p.settings[key] = el.value;
      else p.settings[key] = el.value;
    });
    // text color fields override
    document.querySelectorAll('.ps-field-text').forEach(function(el) {
      var key = el.getAttribute('data-key');
      if (key && el.value) p.settings[key] = el.value;
    });
    setData('plugins', plugins);
    document.getElementById('pluginModal').classList.remove('active');
    loadPlugins();
  };

  window.openPluginSettings = openPluginSettings;
  window.savePluginSettings = savePluginSettings;
})();

/* ---- Plugins search / filter / custom ---- */
(function() {
  var pluginQuery = '';
  var pluginFilter = 'all';

  function renderPluginsList() {
    var plugins = getData('plugins', DEFAULT_PLUGINS);
    if (!Array.isArray(plugins)) plugins = [];
    var grid = document.getElementById('pluginsGrid');
    if (!grid) return;

    var list = plugins.filter(function(p) {
      if (pluginFilter === 'enabled' && !p.enabled) return false;
      if (pluginFilter === 'disabled' && p.enabled) return false;
      if (pluginQuery) {
        var q = pluginQuery.toLowerCase();
        var hay = ((p.name || '') + ' ' + (p.desc || '') + ' ' + (p.id || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var label = document.getElementById('pluginCountLabel');
    if (label) label.textContent = list.length + ' افزونه نمایش داده شده از ' + plugins.length + ' (فعال: ' + plugins.filter(function(x){return x.enabled}).length + ')';

    if (!list.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:40px;text-align:center;color:#8b8ba0"><i class="fas fa-search" style="font-size:2rem;opacity:.4"></i><p>افزونه‌ای پیدا نشد</p></div>';
      return;
    }

    grid.innerHTML = list.map(function(p) {
      return '<div class="plugin-card ' + (p.enabled ? 'enabled' : '') + '" data-id="' + p.id + '">' +
        '<div class="plugin-header"><div class="plugin-icon"><i class="fas ' + (p.icon || 'fa-plug') + '"></i></div>' +
        '<div class="plugin-info"><h3>' + (p.name || p.id) + '</h3><p>' + (p.desc || '') + '</p></div></div>' +
        '<div class="plugin-footer">' +
        '<button type="button" class="plugin-settings-btn" onclick="openPluginSettings(\'' + p.id + '\')"><i class="fas fa-cog"></i> تنظیمات</button>' +
        (String(p.id).indexOf('custom_') === 0 ? '<button type="button" class="plugin-settings-btn" onclick="deleteCustomPlugin(\'' + p.id + '\')" style="color:#f87171"><i class="fas fa-trash"></i></button>' : '') +
        '<label class="toggle-switch"><input type="checkbox" ' + (p.enabled ? 'checked' : '') + ' onchange="togglePlugin(\'' + p.id + '\', this.checked)"><span class="toggle-slider"></span></label>' +
        '</div></div>';
    }).join('');
  }

  // override loadPlugins
  loadPlugins = function() { renderPluginsList(); loadOverview(); };
  window.loadPlugins = loadPlugins;

  document.addEventListener('DOMContentLoaded', function() {
    var search = document.getElementById('pluginSearch');
    var filter = document.getElementById('pluginFilter');
    if (search) search.addEventListener('input', function() {
      pluginQuery = search.value.trim();
      renderPluginsList();
    });
    if (filter) filter.addEventListener('change', function() {
      pluginFilter = filter.value;
      renderPluginsList();
    });

    var showBtn = document.getElementById('showAddPlugin');
    var box = document.getElementById('addPluginBox');
    if (showBtn && box) {
      showBtn.addEventListener('click', function() {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
      });
    }
    var typeSel = document.getElementById('cpType');
    if (typeSel) typeSel.addEventListener('change', function() {
      var t = typeSel.value;
      var codeW = document.getElementById('cpCodeWrap');
      var linkW = document.getElementById('cpLinkWrap');
      var textW = document.getElementById('cpTextWrap');
      if (codeW) codeW.style.display = (t === 'custom-css' || t === 'custom-js') ? 'block' : 'none';
      if (linkW) linkW.style.display = (t === 'float-btn') ? 'block' : 'none';
      if (textW) textW.style.display = (t === 'float-btn' || t === 'top-bar') ? 'block' : 'none';
    });

    var saveCp = document.getElementById('saveCustomPlugin');
    if (saveCp) saveCp.addEventListener('click', function() {
      var name = (document.getElementById('cpName') || {}).value;
      name = (name || '').trim();
      if (!name) { alert('نام افزونه را وارد کنید'); return; }
      var icon = ((document.getElementById('cpIcon') || {}).value || 'fa-puzzle-piece').trim();
      if (icon.indexOf('fa-') !== 0) icon = 'fa-' + icon;
      var desc = ((document.getElementById('cpDesc') || {}).value || 'افزونه سفارشی شما').trim();
      var type = (document.getElementById('cpType') || {}).value || 'float-btn';
      var link = ((document.getElementById('cpLink') || {}).value || '').trim();
      var text = ((document.getElementById('cpText') || {}).value || name).trim();
      var color = (document.getElementById('cpColor') || {}).value || '#7c3aed';
      var code = ((document.getElementById('cpCode') || {}).value || '').trim();

      var id = 'custom_' + Date.now().toString(36);
      var plugin = {
        id: id,
        name: name,
        desc: desc,
        icon: icon,
        enabled: true,
        settings: {
          customType: type,
          link: link,
          text: text,
          color: color,
          code: code,
          position: 'bottom-right',
          offsetX: 24,
          offsetY: 100,
          size: 52
        }
      };
      var plugins = getData('plugins', DEFAULT_PLUGINS);
      plugins.unshift(plugin);
      setData('plugins', plugins);
      if (box) box.style.display = 'none';
      if (document.getElementById('cpName')) document.getElementById('cpName').value = '';
      renderPluginsList();
      loadOverview();
      alert('افزونه «' + name + '» اضافه و فعال شد');
    });
  });

  window.deleteCustomPlugin = function(id) {
    if (!confirm('این افزونه سفارشی حذف شود؟')) return;
    var plugins = getData('plugins', []).filter(function(p) { return p.id !== id; });
    setData('plugins', plugins);
    renderPluginsList();
    loadOverview();
  };
})();

/* ---- Category Icon Picker ---- */
(function() {
  var ICONS = [
    'fa-star','fa-heart','fa-fire','fa-bolt','fa-gem','fa-crown','fa-trophy','fa-medal',
    'fa-home','fa-house','fa-building','fa-city','fa-store','fa-shop','fa-warehouse','fa-industry',
    'fa-couch','fa-chair','fa-bed','fa-toilet','fa-bath','fa-shower','fa-sink','fa-door-open',
    'fa-door-closed','fa-stairs','fa-elevator','fa-fan','fa-wind','fa-temperature-half','fa-fire-burner',
    'fa-lamp','fa-lightbulb','fa-candle-holder','fa-image','fa-images','fa-frame','fa-paintbrush','fa-palette',
    'fa-brush','fa-pen','fa-pencil','fa-eraser','fa-ruler','fa-ruler-combined','fa-compass-drafting','fa-bezier-curve',
    'fa-table','fa-table-cells','fa-border-all','fa-grip','fa-boxes-stacked','fa-box','fa-box-open','fa-cube','fa-cubes',
    'fa-archive','fa-cabinet-filing','fa-folder','fa-book','fa-book-open','fa-bookmark','fa-newspaper','fa-magazine',
    'fa-tv','fa-desktop','fa-laptop','fa-tablet','fa-mobile','fa-keyboard','fa-computer-mouse','fa-headphones',
    'fa-speaker','fa-radio','fa-camera','fa-video','fa-film','fa-gamepad','fa-puzzle-piece','fa-chess',
    'fa-robot','fa-ghost','fa-dragon','fa-spider','fa-cat','fa-dog','fa-paw','fa-fish','fa-dove','fa-horse',
    'fa-car','fa-car-side','fa-truck','fa-van-shuttle','fa-bus','fa-motorcycle','fa-bicycle','fa-scooter',
    'fa-plane','fa-helicopter','fa-ship','fa-sailboat','fa-train','fa-subway','fa-rocket','fa-satellite',
    'fa-tree','fa-leaf','fa-seedling','fa-flower','fa-clover','fa-sun','fa-moon','fa-cloud','fa-snowflake',
    'fa-umbrella','fa-umbrella-beach','fa-mountain','fa-water','fa-droplet','fa-fire-flame-curved','fa-bomb',
    'fa-utensils','fa-kitchen-set','fa-blender','fa-mug-hot','fa-coffee','fa-wine-glass','fa-beer-mug-empty',
    'fa-pizza-slice','fa-burger','fa-cake-candles','fa-cookie','fa-ice-cream','fa-apple-whole','fa-carrot','fa-lemon',
    'fa-shirt','fa-socks','fa-hat-cowboy','fa-glasses','fa-sunglasses','fa-ring','fa-gem','fa-watch',
    'fa-bag-shopping','fa-basket-shopping','fa-cart-shopping','fa-gift','fa-gifts','fa-ribbon','fa-tag','fa-tags',
    'fa-key','fa-lock','fa-unlock','fa-shield','fa-hammer','fa-wrench','fa-screwdriver','fa-toolbox','fa-gear',
    'fa-clock','fa-calendar','fa-bell','fa-envelope','fa-phone','fa-comment','fa-comments','fa-location-dot',
    'fa-map','fa-globe','fa-earth-americas','fa-flag','fa-anchor','fa-compass','fa-binoculars','fa-eye',
    'fa-user','fa-users','fa-user-group','fa-child','fa-baby','fa-person','fa-people-group','fa-handshake',
    'fa-thumbs-up','fa-face-smile','fa-hand','fa-hand-peace','fa-music','fa-guitar','fa-drum','fa-microphone',
    'fa-monument','fa-landmark','fa-church','fa-mosque','fa-place-of-worship','fa-school','fa-hospital','fa-hotel',
    'fa-dumbbell','fa-futbol','fa-basketball','fa-volleyball','fa-table-tennis-paddle-ball','fa-bowling-ball',
    'fa-spa','fa-heart-pulse','fa-stethoscope','fa-pills','fa-syringe','fa-briefcase-medical','fa-kit-medical',
    'fa-scissors','fa-print','fa-copy','fa-paste','fa-file','fa-file-lines','fa-clipboard','fa-sticky-note',
    'fa-dollar-sign','fa-coins','fa-wallet','fa-credit-card','fa-money-bill','fa-chart-line','fa-chart-pie','fa-percent',
    'fa-plug','fa-battery-full','fa-wifi','fa-bluetooth','fa-signal','fa-satellite-dish','fa-microchip','fa-memory',
    'fa-star-of-life','fa-certificate','fa-award','fa-crown','fa-medal','fa-trophy','fa-ranking-star','fa-fire',
    'fa-infinity','fa-circle','fa-square','fa-diamond','fa-play','fa-pause','fa-stop','fa-forward','fa-backward',
    'fa-plus','fa-minus','fa-check','fa-xmark','fa-question','fa-info','fa-exclamation','fa-ban'
  ]

  function openIconPicker() {
    var modal = document.getElementById('iconPickerModal');
    var grid = document.getElementById('iconGrid');
    if (!modal || !grid) return;
    renderIcons('');
    modal.classList.add('active');
    var search = document.getElementById('iconSearch');
    if (search) { search.value = ''; search.focus(); }
  }

  function renderIcons(q) {
    var grid = document.getElementById('iconGrid');
    if (!grid) return;
    q = (q || '').toLowerCase();
    var list = ICONS.filter(function(ic) {
      return !q || ic.toLowerCase().indexOf(q) !== -1;
    });
    grid.innerHTML = list.map(function(ic) {
      return '<button type="button" class="icon-pick-item" data-icon="' + ic + '" title="' + ic + '" style="width:100%;aspect-ratio:1;border:1px solid #2a2a3a;border-radius:12px;background:#0c0c12;color:#c4b5fd;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .15s">' +
        '<i class="fas ' + ic + '"></i></button>';
    }).join('');
    grid.querySelectorAll('.icon-pick-item').forEach(function(btn) {
      btn.addEventListener('mouseenter', function() { btn.style.borderColor = '#7c3aed'; btn.style.background = 'rgba(124,58,237,0.15)'; });
      btn.addEventListener('mouseleave', function() { btn.style.borderColor = '#2a2a3a'; btn.style.background = '#0c0c12'; });
      btn.addEventListener('click', function() {
        var ic = btn.getAttribute('data-icon');
        var hidden = document.getElementById('newCatIcon');
        var preview = document.getElementById('pickIconPreview');
        if (hidden) hidden.value = ic;
        if (preview) preview.className = 'fas ' + ic;
        document.getElementById('iconPickerModal').classList.remove('active');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    var pickBtn = document.getElementById('pickIconBtn');
    if (pickBtn) pickBtn.addEventListener('click', openIconPicker);
    var closeBtn = document.getElementById('closeIconPicker');
    if (closeBtn) closeBtn.addEventListener('click', function() {
      document.getElementById('iconPickerModal').classList.remove('active');
    });
    var modal = document.getElementById('iconPickerModal');
    if (modal) modal.addEventListener('click', function(e) {
      if (e.target.id === 'iconPickerModal') modal.classList.remove('active');
    });
    var search = document.getElementById('iconSearch');
    if (search) search.addEventListener('input', function() {
      renderIcons(search.value.trim());
    });
  });
})();

/* Quick site colors on dashboard */
document.addEventListener('DOMContentLoaded', function() {
  var s = getData('settings', DEFAULT_SETTINGS);
  var qp = document.getElementById('quickPrimary');
  var qs = document.getElementById('quickSecondary');
  if (qp) {
    qp.value = s.primaryColor || '#7c3aed';
    var pl = document.getElementById('quickPrimaryLabel');
    if (pl) pl.textContent = qp.value;
    qp.addEventListener('input', function() {
      if (pl) pl.textContent = qp.value;
    });
  }
  if (qs) {
    qs.value = s.secondaryColor || '#f59e0b';
    var sl = document.getElementById('quickSecondaryLabel');
    if (sl) sl.textContent = qs.value;
    qs.addEventListener('input', function() {
      if (sl) sl.textContent = qs.value;
    });
  }
  document.querySelectorAll('.preset-color').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (qp) { qp.value = btn.getAttribute('data-p'); document.getElementById('quickPrimaryLabel').textContent = qp.value; }
      if (qs) { qs.value = btn.getAttribute('data-s'); document.getElementById('quickSecondaryLabel').textContent = qs.value; }
    });
  });
  var saveBtn = document.getElementById('saveQuickColors');
  if (saveBtn) saveBtn.addEventListener('click', function() {
    var st = getData('settings', DEFAULT_SETTINGS);
    st.primaryColor = (qp && qp.value) || '#7c3aed';
    st.secondaryColor = (qs && qs.value) || '#f59e0b';
    setData('settings', st);
    // sync builder fields if present
    var sp = document.getElementById('setPrimaryColor');
    var ss = document.getElementById('setSecondaryColor');
    if (sp) sp.value = st.primaryColor;
    if (ss) ss.value = st.secondaryColor;
    var t = document.getElementById('quickColorSaved');
    if (t) { t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 2000); }
  });
});

/* ---- Coupons ---- */
function loadCouponsTable() {
  var coupons = getData('coupons', typeof DEFAULT_COUPONS !== 'undefined' ? DEFAULT_COUPONS : []);
  var tbody = document.getElementById('couponsTable');
  if (!tbody) return;
  if (!coupons.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#8b8ba0">کدی ثبت نشده</td></tr>';
    return;
  }
  tbody.innerHTML = coupons.map(function(c) {
    var val = c.type === 'percent' ? (c.value + '٪') : new Intl.NumberFormat('fa-IR').format(c.value) + ' تومان';
    return '<tr><td><code style="color:#a78bfa">' + c.code + '</code></td><td>' + (c.type === 'percent' ? 'درصدی' : 'ثابت') + '</td><td>' + val + '</td>' +
      '<td>' + (c.active ? '<span style="color:#34d399">فعال</span>' : '<span style="color:#f87171">غیرفعال</span>') + '</td>' +
      '<td><button class="btn-icon" onclick="toggleCoupon(\'' + c.id + '\')"><i class="fas fa-power-off"></i></button> ' +
      '<button class="btn-icon danger" onclick="deleteCoupon(\'' + c.id + '\')"><i class="fas fa-trash"></i></button></td></tr>';
  }).join('');
}

function toggleCoupon(id) {
  var coupons = getData('coupons', []);
  var c = coupons.find(function(x) { return x.id === id; });
  if (c) { c.active = !c.active; setData('coupons', coupons); loadCouponsTable(); }
}

function deleteCoupon(id) {
  if (!confirm('حذف این کد؟')) return;
  setData('coupons', getData('coupons', []).filter(function(c) { return c.id !== id; }));
  loadCouponsTable();
}

function addCouponFromForm() {
  try {
    var codeEl = document.getElementById('cpCode');
    var typeEl = document.getElementById('cpType');
    var valueEl = document.getElementById('cpValue');
    if (!codeEl || !typeEl || !valueEl) { alert('فرم کد تخفیف پیدا نشد'); return; }
    var code = (codeEl.value || '').trim().toUpperCase();
    var type = typeEl.value || 'percent';
    var value = parseInt(valueEl.value, 10);
    if (!code || isNaN(value) || value <= 0) { alert('کد و مقدار را وارد کنید'); return; }
    var coupons = getData('coupons', typeof DEFAULT_COUPONS !== 'undefined' ? DEFAULT_COUPONS.slice() : []);
    if (!Array.isArray(coupons)) coupons = [];
    if (coupons.some(function(c) { return String(c.code).toUpperCase() === code; })) {
      alert('این کد از قبل وجود دارد');
      return;
    }
    coupons.unshift({ id: 'c' + Date.now(), code: code, type: type, value: value, active: true, maxUses: 0, used: 0 });
    setData('coupons', coupons);
    codeEl.value = '';
    valueEl.value = '';
    loadCouponsTable();
    alert('کد تخفیف با موفقیت اضافه شد');
  } catch (err) {
    console.error(err);
    alert('خطا در ثبت کد تخفیف: ' + (err.message || err));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadCouponsTable();
  var btn = document.getElementById('addCouponBtn');
  if (btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      addCouponFromForm();
    };
  }
  document.querySelectorAll('.sidebar-nav a[data-tab="coupons"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadCouponsTable, 50); });
  });
});

window.addCouponFromForm = addCouponFromForm;

window.toggleCoupon = toggleCoupon;
window.deleteCoupon = deleteCoupon;
window.loadCouponsTable = loadCouponsTable;

/* ---- Ticket: conversation support + reply without closing ---- */
function normalizeTicketAdmin(t) {
  if (!t) return t;
  if (Array.isArray(t.messages) && t.messages.length) return t;
  var msgs = [];
  if (t.message) msgs.push({ from: 'user', text: t.message, at: t.createdAt || Date.now() });
  if (t.reply) msgs.push({ from: 'admin', text: t.reply, at: (t.createdAt || Date.now()) + 1 });
  t.messages = msgs;
  return t;
}

viewTicket = function(id) {
  var tickets = getData('tickets', []);
  var t = tickets.find(function(x) { return x.id === id; });
  if (!t) return;
  normalizeTicketAdmin(t);
  var box = document.getElementById('ticketDetail');
  if (!box) return;
  box.style.display = 'block';
  var date = new Date(t.createdAt).toLocaleString('fa-IR');
  var thread = '<div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">';
  (t.messages || []).forEach(function(m) {
    var isAdmin = m.from === 'admin';
    var bg = isAdmin ? 'rgba(16,185,129,0.12)' : 'rgba(124,58,237,0.12)';
    var border = isAdmin ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.3)';
    var who = isAdmin ? 'پشتیبانی' : (t.name || 'کاربر');
    var d = new Date(m.at || t.createdAt).toLocaleString('fa-IR');
    thread += '<div style="background:' + bg + ';border:1px solid ' + border + ';padding:12px 14px;border-radius:12px;line-height:1.7">' +
      (m.text || '') +
      '<div style="font-size:.75rem;color:#8b8ba0;margin-top:6px">' + who + ' — ' + d + '</div></div>';
  });
  thread += '</div>';

  box.innerHTML =
    '<h3 style="margin-bottom:12px">تیکت ' + t.id + '</h3>' +
    '<p style="color:#8b8ba0;font-size:.9rem">' + date + ' — ' + (t.name || '') + ' — ' + (t.contact || '') + '</p>' +
    '<p><strong>موضوع:</strong> ' + (t.subject || '') + '</p>' +
    thread +
    (t.status !== 'closed' ?
      '<div class="form-group"><label>پاسخ جدید</label><textarea class="form-control" id="ticketReply" rows="3" placeholder="پاسخ خود را بنویسید..."></textarea></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
        '<button type="button" class="btn-save" onclick="saveTicketReply(\'' + t.id + '\')"><i class="fas fa-reply"></i> ثبت پاسخ (باز بماند)</button>' +
        '<button type="button" class="btn-save" style="background:#334155" onclick="closeTicket(\'' + t.id + '\')"><i class="fas fa-lock"></i> بستن تیکت</button>' +
        '<button type="button" class="btn-icon danger" onclick="deleteTicket(\'' + t.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>'
    :
      '<p style="color:#34d399;margin:12px 0"><i class="fas fa-lock"></i> این تیکت بسته شده است</p>' +
      '<div style="display:flex;gap:10px">' +
        '<button type="button" class="btn-save" style="background:#334155" onclick="reopenTicket(\'' + t.id + '\')"><i class="fas fa-lock-open"></i> باز کردن مجدد</button>' +
        '<button type="button" class="btn-icon danger" onclick="deleteTicket(\'' + t.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>'
    );
};

window.saveTicketReply = function(id) {
  var tickets = getData('tickets', []);
  var t = tickets.find(function(x) { return x.id === id; });
  if (!t) return;
  normalizeTicketAdmin(t);
  var reply = document.getElementById('ticketReply') ? document.getElementById('ticketReply').value.trim() : '';
  if (!reply) { alert('لطفاً پاسخ را بنویسید'); return; }
  t.messages.push({ from: 'admin', text: reply, at: Date.now() });
  t.reply = reply;
  t.unreadCustomer = true;
  t.unreadAdmin = false;
  t.updatedAt = Date.now();
  setData('tickets', tickets);
  loadTicketsTable();
  viewTicket(id);
  updateTicketBadge();
  alert('پاسخ ذخیره شد — تیکت هنوز باز است');
};

window.reopenTicket = function(id) {
  var tickets = getData('tickets', []);
  var t = tickets.find(function(x) { return x.id === id; });
  if (!t) return;
  t.status = 'open';
  setData('tickets', tickets);
  loadTicketsTable();
  viewTicket(id);
};

window.viewTicket = viewTicket;

/* ---- Reviews management ---- */
function loadReviewsTable() {
  var reviews = getData('reviews', []);
  if (!Array.isArray(reviews)) reviews = [];
  var products = getData('products', DEFAULT_PRODUCTS);
  var tbody = document.getElementById('reviewsTable');
  if (!tbody) return;
  if (!reviews.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#8b8ba0;padding:40px">نظری وجود ندارد</td></tr>';
    return;
  }
  tbody.innerHTML = reviews.map(function(r) {
    var p = products.find(function(x) { return x.id === r.productId; });
    var statusBadge = r.status === 'approved'
      ? '<span class="badge badge-success">تایید شده</span>'
      : '<span class="badge badge-warning">در انتظار</span>';
    var stars = '';
    for (var i = 1; i <= 5; i++) stars += i <= (r.stars || 0) ? '★' : '☆';
    return '<tr>' +
      '<td>' + (p ? p.title : r.productId) + '</td>' +
      '<td>' + (r.name || '') + '</td>' +
      '<td style="color:#fbbf24">' + stars + '</td>' +
      '<td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (r.text || '') + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' + new Date(r.createdAt).toLocaleDateString('fa-IR') + '</td>' +
      '<td class="actions">' +
        '<button class="action-btn edit" onclick="viewReview(\'' + r.id + '\')" title="مشاهده/پاسخ"><i class="fas fa-eye"></i></button>' +
        (r.status !== 'approved' ? '<button class="action-btn edit" onclick="approveReview(\'' + r.id + '\')" title="تایید"><i class="fas fa-check"></i></button>' : '') +
        '<button class="action-btn delete" onclick="deleteReview(\'' + r.id + '\')" title="حذف"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  }).join('');
}

function viewReview(id) {
  var reviews = getData('reviews', []);
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  var products = getData('products', DEFAULT_PRODUCTS);
  var p = products.find(function(x) { return x.id === r.productId; });
  var box = document.getElementById('reviewDetail');
  if (!box) return;
  box.style.display = 'block';
  var stars = '';
  for (var i = 1; i <= 5; i++) stars += i <= (r.stars || 0) ? '★' : '☆';
  box.innerHTML =
    '<h3>نظر ' + r.id + '</h3>' +
    '<p><strong>محصول:</strong> ' + (p ? p.title : r.productId) + '</p>' +
    '<p><strong>از:</strong> ' + (r.name || '') + ' — <span style="color:#fbbf24">' + stars + '</span></p>' +
    '<div style="background:#0c0c12;padding:16px;border-radius:12px;margin:16px 0;line-height:1.8">' + (r.text || '') + '</div>' +
    (r.reply ? '<div style="background:rgba(16,185,129,0.1);padding:12px;border-radius:10px;margin-bottom:12px"><strong>پاسخ فعلی:</strong><br>' + r.reply + '</div>' : '') +
    '<div class="form-group"><label>پاسخ</label><textarea class="form-control" id="reviewReplyText" rows="3">' + (r.reply || '') + '</textarea></div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px">' +
      '<button type="button" class="btn-save" onclick="saveReviewReply(\'' + r.id + '\')"><i class="fas fa-reply"></i> ذخیره پاسخ</button>' +
      (r.status !== 'approved' ? '<button type="button" class="btn-save" style="background:#059669" onclick="approveReview(\'' + r.id + '\')"><i class="fas fa-check"></i> تایید نظر</button>' : '') +
      '<button type="button" class="btn-icon danger" onclick="deleteReview(\'' + r.id + '\')"><i class="fas fa-trash"></i></button>' +
    '</div>';
}

function saveReviewReply(id) {
  var reviews = getData('reviews', []);
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  var ta = document.getElementById('reviewReplyText');
  r.reply = ta ? ta.value.trim() : '';
  setData('reviews', reviews);
  loadReviewsTable();
  viewReview(id);
  alert('پاسخ ذخیره شد');
}

function approveReview(id) {
  var reviews = getData('reviews', []);
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  r.status = 'approved';
  setData('reviews', reviews);
  loadReviewsTable();
  var box = document.getElementById('reviewDetail');
  if (box && box.style.display !== 'none') viewReview(id);
}

function deleteReview(id) {
  if (!confirm('حذف این نظر؟')) return;
  var reviews = getData('reviews', []).filter(function(x) { return x.id !== id; });
  setData('reviews', reviews);
  loadReviewsTable();
  var box = document.getElementById('reviewDetail');
  if (box) box.style.display = 'none';
}

window.loadReviewsTable = loadReviewsTable;
window.viewReview = viewReview;
window.saveReviewReply = saveReviewReply;
window.approveReview = approveReview;
window.deleteReview = deleteReview;

// Load reviews when tab opened
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-nav a[data-tab="reviews"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadReviewsTable, 50); });
  });
});

/* ---- Orders management ---- */
var ORDER_STATUSES = [
  { key: 'awaiting_payment', label: 'منتظر پرداخت' },
  { key: 'pending', label: 'ثبت شده / پرداخت تأیید شد' },
  { key: 'preparing', label: 'آماده‌سازی' },
  { key: 'shipping', label: 'در حال ارسال' },
  { key: 'delivered', label: 'تحویل داده شد' },
  { key: 'cancelled', label: 'لغو شده' }
];

function orderStatusLabel(s) {
  var f = ORDER_STATUSES.find(function(x) { return x.key === s; });
  return f ? f.label : s;
}

function paymentStatusLabel(s) {
  if (s === 'paid') return 'پرداخت تأیید شد';
  if (s === 'rejected') return 'پرداخت رد شد';
  if (s === 'awaiting_payment') return 'در انتظار واریز';
  if (s === 'cod') return 'پرداخت در محل';
  if (s === 'cancelled') return 'لغو شده';
  return s || '—';
}

function loadOrdersTable() {
  var orders = getData('orders', []);
  if (!Array.isArray(orders)) orders = [];
  var tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#8b8ba0;padding:40px">سفارشی وجود ندارد</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(function(o) {
    var payBadge = '';
    if (o.paymentMethod === 'cardtocard') {
      var color = o.paymentStatus === 'paid' ? '#34d399' : (o.paymentStatus === 'rejected' ? '#f87171' : '#fbbf24');
      payBadge = '<div style="font-size:.78rem;color:' + color + '">کارت‌به‌کارت · ' + paymentStatusLabel(o.paymentStatus) + '</div>';
    } else if (o.paymentMethod) {
      payBadge = '<div style="font-size:.78rem;color:#8b8ba0">' + o.paymentMethod + '</div>';
    }
    return '<tr>' +
      '<td><code>' + o.id + '</code></td>' +
      '<td>' + (o.customerName || '') + '</td>' +
      '<td>' + (o.customerPhone || '') + '</td>' +
      '<td>' + formatPrice(o.total || 0) + payBadge + '</td>' +
      '<td><span class="badge badge-warning">' + orderStatusLabel(o.status) + '</span></td>' +
      '<td>' + new Date(o.createdAt).toLocaleDateString('fa-IR') + '</td>' +
      '<td class="actions">' +
        '<button class="action-btn edit" onclick="viewOrder(\'' + o.id + '\')"><i class="fas fa-eye"></i></button>' +
      '</td></tr>';
  }).join('');
}

function viewOrder(id) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === id; });
  if (!o) return;
  var box = document.getElementById('orderDetail');
  if (!box) return;
  box.style.display = 'block';
  var addr = o.address || {};
  var items = (o.items || []).map(function(it) {
    return '<li>' + (it.title || '') + ' × ' + (it.qty || 1) + ' — ' + formatPrice((it.price||0)*(it.qty||1)) + '</li>';
  }).join('');
  var statusOpts = ORDER_STATUSES.map(function(s) {
    return '<option value="' + s.key + '"' + (o.status === s.key ? ' selected' : '') + '>' + s.label + '</option>';
  }).join('');
  var payBlock = '';
  if (o.paymentMethod === 'cardtocard') {
    payBlock =
      '<div style="margin:14px 0;padding:14px;border-radius:12px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25)">' +
      '<p style="margin:0 0 8px"><strong>پرداخت کارت به کارت</strong></p>' +
      '<p style="margin:0 0 4px">وضعیت: <strong>' + paymentStatusLabel(o.paymentStatus) + '</strong></p>' +
      (o.paymentCardNumber ? '<p style="margin:0 0 4px">کارت مقصد: ' + o.paymentCardNumber + (o.paymentCardOwner ? ' — ' + o.paymentCardOwner : '') + '</p>' : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' +
        '<button type="button" class="btn-save" style="background:#059669" onclick="confirmOrderPayment(\'' + o.id + '\', true)"><i class="fas fa-check"></i> تأیید دریافت وجه</button>' +
        '<button type="button" class="btn-save" style="background:#dc2626" onclick="confirmOrderPayment(\'' + o.id + '\', false)"><i class="fas fa-times"></i> رد پرداخت</button>' +
        '<button type="button" class="btn-save" style="background:#4f46e5" onclick="sendTicketToCustomer(\'' + o.id + '\')"><i class="fas fa-ticket"></i> ارسال تیکت به مشتری</button>' +
      '</div></div>';
  }
  box.innerHTML =
    '<h3>سفارش ' + o.id + '</h3>' +
    '<p><strong>خریدار:</strong> ' + (o.customerName || '') + ' — ' + (o.customerPhone || '') + '</p>' +
    '<p><strong>آدرس:</strong> ' + (addr.province||'') + '، ' + (addr.city||'') + '، ' + (addr.address||'') +
      (addr.postal ? ' — کدپستی ' + addr.postal : '') + '</p>' +
    (addr.lat ? '<p><strong>مختصات:</strong> ' + addr.lat + ', ' + addr.lng + '</p>' : '') +
    '<ul style="margin:12px 0;padding-right:20px">' + items + '</ul>' +
    '<p><strong>هزینه ارسال:</strong> ' + formatPrice(o.shipping || 0) + ' (' + (o.shippingZone === 'far' ? 'دورتر' : 'اطراف فروشگاه') + ')</p>' +
    '<p><strong>جمع کل:</strong> ' + formatPrice(o.total || 0) + '</p>' +
    payBlock +
    '<div class="form-group"><label>تغییر وضعیت</label>' +
      '<select class="form-control" id="orderStatusSelect">' + statusOpts + '</select></div>' +
    '<button class="btn-save" onclick="updateOrderStatus(\'' + o.id + '\')"><i class="fas fa-save"></i> ذخیره وضعیت</button>';
}

function confirmOrderPayment(id, approved) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === id; });
  if (!o) return;
  if (approved) {
    o.paymentStatus = 'paid';
    o.status = 'pending';
    if (!Array.isArray(o.statusHistory)) o.statusHistory = [];
    o.statusHistory.push({ status: 'pending', at: Date.now(), note: 'پرداخت کارت به کارت تأیید شد' });
    setData('orders', orders);
    alert('پرداخت تأیید شد. سفارش وارد مرحله پردازش شد.');
  } else {
    o.paymentStatus = 'rejected';
    if (!Array.isArray(o.statusHistory)) o.statusHistory = [];
    o.statusHistory.push({ status: o.status, at: Date.now(), note: 'پرداخت رد شد — نیاز به پیگیری' });
    setData('orders', orders);
    alert('پرداخت رد شد. می‌توانید از بخش تیکت به مشتری پیام دهید.');
  }
  loadOrdersTable();
  viewOrder(id);
}

function updateOrderStatus(id) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === id; });
  if (!o) return;
  var sel = document.getElementById('orderStatusSelect');
  var st = sel ? sel.value : o.status;
  o.status = st;
  if (st === 'cancelled') o.paymentStatus = 'cancelled';
  if (!Array.isArray(o.statusHistory)) o.statusHistory = [];
  o.statusHistory.push({ status: st, at: Date.now(), note: orderStatusLabel(st) });
  setData('orders', orders);
  loadOrdersTable();
  viewOrder(id);
  alert('وضعیت به «' + orderStatusLabel(st) + '» تغییر کرد');
}


function sendTicketToCustomer(orderId) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === orderId; });
  if (!o) { alert('سفارش پیدا نشد'); return; }
  var defaultMsg = 'سلام، در مورد سفارش ' + o.id + ' و وضعیت پرداخت کارت به کارت با شما در ارتباط هستیم. لطفاً رسید واریز را ارسال کنید یا توضیح دهید.';
  var msg = prompt('متن تیکت برای مشتری:', defaultMsg);
  if (msg === null) return;
  msg = (msg || '').trim();
  if (!msg) { alert('متن تیکت خالی است'); return; }

  var tickets = getData('tickets', []);
  if (!Array.isArray(tickets)) tickets = [];
  var ticket = {
    id: 'TKT-' + Date.now().toString(36).toUpperCase(),
    subject: 'پیگیری سفارش ' + o.id,
    message: msg,
    messages: [
      { from: 'admin', text: msg, at: Date.now() }
    ],
    status: 'open',
    contact: o.customerPhone || o.customerName || '',
    name: o.customerName || '',
    customerId: o.customerId || '',
    customerName: o.customerName || '',
    customerPhone: o.customerPhone || '',
    orderId: o.id,
    createdBy: 'admin',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  tickets.unshift(ticket);
  setData('tickets', tickets);
  alert('تیکت با شماره ' + ticket.id + ' برای مشتری ساخته شد.\\nمشتری می‌تواند از صفحه پشتیبانی آن را ببیند و پاسخ دهد.');
  if (typeof loadTicketsTable === 'function') {
    try { loadTicketsTable(); } catch(e) {}
  }
}
window.sendTicketToCustomer = sendTicketToCustomer;

window.loadOrdersTable = loadOrdersTable;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.confirmOrderPayment = confirmOrderPayment;

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-nav a[data-tab="orders"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadOrdersTable, 50); });
  });
});

// Live UI refresh when another browser/device updates shared data via Supabase
window.addEventListener('dekori:data-sync', function(e) {
  if (!e || !e.detail || !e.detail.key) return;
  var key = e.detail.key;
  try {
    if (key === 'pendingSellers' && typeof loadPendingTable === 'function') loadPendingTable();
    if (key === 'tickets') {
      if (typeof loadTicketsTable === 'function') loadTicketsTable();
      if (typeof updateTicketBadge === 'function') updateTicketBadge();
    }
    if (key === 'products' && typeof loadProductsTable === 'function') loadProductsTable();
    if (key === 'orders' && typeof loadOrdersTable === 'function') loadOrdersTable();
    if (key === 'sellers' && typeof loadSellersTable === 'function') loadSellersTable();
    if (key === 'categories' && typeof loadCatsTable === 'function') loadCatsTable();
    if (key === 'reviews' && typeof loadReviewsTable === 'function') loadReviewsTable();
    if (key === 'coupons' && typeof loadCouponsTable === 'function') loadCouponsTable();
    if (key === 'settings' && typeof loadSettingsForm === 'function') loadSettingsForm();
    if (key === 'payments' && typeof loadPayments === 'function') loadPayments();
    if (key === 'plugins' && typeof loadPlugins === 'function') loadPlugins();
    if (typeof loadOverview === 'function') loadOverview();
  } catch (err) {
    console.warn('admin data-sync UI update error:', err);
  }
});

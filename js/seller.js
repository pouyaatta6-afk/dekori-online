// Seller panel logic

function getSellerSession() {
  try {
    var raw = localStorage.getItem('dekori_seller') || sessionStorage.getItem('dekori_seller');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}
const sellerSession = getSellerSession();
if (!sellerSession) {
  location.href = 'login.html';
}


// Compress image from gallery and return data URL
function readImageAsDataURL(file, maxSize, quality) {
  maxSize = maxSize || 900;
  quality = quality || 0.72;
  return new Promise(function(resolve, reject) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      reject(new Error('فایل تصویر معتبر نیست'));
      return;
    }
    var reader = new FileReader();
    reader.onload = function() {
      var img = new Image();
      img.onload = function() {
        var w = img.width, h = img.height;
        var scale = Math.min(1, maxSize / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, cw, ch);
        var dataUrl = canvas.toDataURL('image/jpeg', quality);
        // if still too large, reduce quality
        if (dataUrl.length > 700000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        }
        resolve(dataUrl);
      };
      img.onerror = function() { reject(new Error('خطا در خواندن تصویر')); };
      img.src = reader.result;
    };
    reader.onerror = function() { reject(new Error('خطا در بارگذاری فایل')); };
    reader.readAsDataURL(file);
  });
}

function bindImagePicker(fileInputId, textInputId, previewId) {
  var fileInput = document.getElementById(fileInputId);
  var textInput = document.getElementById(textInputId);
  var preview = document.getElementById(previewId);
  if (!fileInput || !textInput) return;
  fileInput.addEventListener('change', function() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    readImageAsDataURL(file).then(function(dataUrl) {
      textInput.value = dataUrl;
      if (preview) {
        preview.src = dataUrl;
        preview.style.display = 'block';
        preview.classList.add('show');
      }
    }).catch(function(err) {
      alert(err.message || 'خطا در انتخاب تصویر');
    });
  });
  textInput.addEventListener('input', function() {
    var v = textInput.value.trim();
    if (preview) {
      if (v) {
        preview.src = v;
        preview.style.display = 'block';
        preview.classList.add('show');
      } else {
        preview.style.display = 'none';
        preview.classList.remove('show');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sellerName').textContent = sellerSession.name;
  loadCategoriesSelect();
  loadMyProducts();
  setupTabs();
  setupEvents();
});

function setupTabs() {
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });
}

function setupEvents() {
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('dekori_seller');
    localStorage.removeItem('dekori_seller');
    location.href = 'login.html';
  });

  document.getElementById('saveProductBtn').addEventListener('click', addProduct);
  bindImagePicker('pImageFile', 'pImage', 'imgPreview');
  document.querySelectorAll('#pPhotosBox .pPhotoFile').forEach(function(input){
    input.addEventListener('change', function(){
      var file=this.files && this.files[0];
      if(!file) return;
      var reader=new FileReader();
      var preview=this.closest('.product-photo-slot').querySelector('.pPhotoPreview');
      reader.onload=function(e){ input.dataset.value=e.target.result; preview.src=e.target.result; preview.style.display='block'; };
      reader.readAsDataURL(file);
    });
  });
  setupEditPhotoPickers();

  var genDescBtn = document.getElementById('genDescBtn');
  if (genDescBtn) genDescBtn.addEventListener('click', generateProductDescription);

  document.getElementById('closeEditModal').addEventListener('click', () => {
    document.getElementById('editModal').classList.remove('active');
  });
  document.getElementById('updateProductBtn').addEventListener('click', updateProduct);

  // Variants toggle (add form)
  var pVarEn = document.getElementById('pVariantsEnabled');
  if (pVarEn) {
    pVarEn.addEventListener('change', function() {
      var box = document.getElementById('pVariantsBox');
      if (box) box.style.display = pVarEn.checked ? 'block' : 'none';
      if (pVarEn.checked && document.getElementById('pVariantGroups') && !document.getElementById('pVariantGroups').children.length) {
        addVariantGroupUI('pVariantGroups');
      }
    });
  }
  var addVg = document.getElementById('addVariantGroupBtn');
  if (addVg) addVg.addEventListener('click', function() { addVariantGroupUI('pVariantGroups'); });

  // Variants toggle (edit form)
  var eVarEn = document.getElementById('editVariantsEnabled');
  if (eVarEn) {
    eVarEn.addEventListener('change', function() {
      var box = document.getElementById('editVariantsBox');
      if (box) box.style.display = eVarEn.checked ? 'block' : 'none';
    });
  }
  var editAddVg = document.getElementById('editAddVariantGroupBtn');
  if (editAddVg) editAddVg.addEventListener('click', function() { addVariantGroupUI('editVariantGroups'); });
}

// افزونه «تولید توضیح با AI» — استفاده از تنظیمات افزونه aiproductdesc (کلید API را مدیر سایت وارد می‌کند)
function generateProductDescription() {
  var plugins = getData('plugins', typeof DEFAULT_PLUGINS !== 'undefined' ? DEFAULT_PLUGINS : []);
  var plugin = plugins.find(function(x) { return x.id === 'aiproductdesc'; });
  var hint = document.getElementById('genDescHint');
  var btn = document.getElementById('genDescBtn');

  function showHint(msg, isError) {
    if (!hint) return;
    hint.textContent = msg;
    hint.style.color = isError ? '#ef4444' : 'var(--text-muted)';
    hint.style.display = msg ? 'block' : 'none';
  }

  if (!plugin || !plugin.enabled) {
    showHint('این قابلیت غیرفعال است. مدیر سایت باید افزونه «تولید توضیح با AI» را از پنل مدیریت روشن و تنظیم کند.', true);
    return;
  }
  var s = plugin.settings || {};
  if (!s.apiKey) {
    showHint('کلید API تنظیم نشده. مدیر سایت باید از پنل مدیریت → افزونه‌ها → تولید توضیح با AI، کلید را وارد کند.', true);
    return;
  }

  var title = (document.getElementById('pTitle').value || '').trim();
  if (!title) {
    showHint('اول نام محصول را وارد کن تا AI بتواند توضیح مناسب بسازد.', true);
    document.getElementById('pTitle').focus();
    return;
  }
  var catSelect = document.getElementById('pCategory');
  var catName = catSelect && catSelect.selectedOptions && catSelect.selectedOptions[0] ? catSelect.selectedOptions[0].textContent : '';
  var priceVal = document.getElementById('pPrice').value;

  showHint('در حال تولید توضیح با هوش مصنوعی...', false);
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال تولید...'; }

  var userPrompt = 'یک توضیح فروش کوتاه (حداکثر ۴ خط)، جذاب و صادقانه به زبان فارسی برای این محصول فروشگاهی بنویس. ' +
    'فقط خود متن توضیح را برگردان، بدون مقدمه یا گیومه.\n' +
    'نام محصول: ' + title + (catName ? '\nدسته‌بندی: ' + catName : '') + (priceVal ? '\nقیمت: ' + priceVal + ' تومان' : '');

  var base = (s.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  fetch(base + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.apiKey },
    body: JSON.stringify({
      model: s.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'تو یک کپی‌رایتر حرفه‌ای فروشگاه اینترنتی دکوری و اکشن فیگور هستی.' },
        { role: 'user', content: userPrompt }
      ]
    })
  }).then(function(res) { return res.json(); }).then(function(data) {
    if (data.error) {
      showHint('خطا از سمت API: ' + (data.error.message || JSON.stringify(data.error)), true);
    } else if (data.choices && data.choices[0] && data.choices[0].message) {
      var text = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
      document.getElementById('pDesc').value = text;
      showHint('توضیح با موفقیت تولید شد ✓ می‌توانی ویرایشش کنی.', false);
    } else {
      showHint('پاسخ نامعتبر از API دریافت شد.', true);
    }
  }).catch(function(err) {
    showHint('خطا در ارتباط با API: ' + err.message, true);
  }).finally(function() {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> تولید با AI'; }
  });
}

function addVariantGroupUI(containerId, preset) {
  var container = document.getElementById(containerId);
  if (!container) return;
  var gid = 'vg' + Date.now() + Math.random().toString(36).slice(2, 5);
  var name = (preset && preset.name) || '';
  var div = document.createElement('div');
  div.className = 'variant-group-row';
  div.setAttribute('data-gid', gid);
  div.style.cssText = 'background:var(--bg-card,#1a1a28);border:1px solid var(--border,#252535);border-radius:12px;padding:12px;margin-bottom:10px';

  div.innerHTML =
    '<div class="form-group" style="margin-bottom:10px"><label style="font-size:.85rem">نام گزینه (مثلاً رنگ یا اندازه)</label>' +
    '<input type="text" class="form-control vg-name" value="' + (name || '') + '" placeholder="مثلاً رنگ"></div>' +
    '<div class="vg-values-list"></div>' +
    '<button type="button" class="btn btn-outline vg-add-value" style="font-size:.82rem;margin:4px 0 8px"><i class="fas fa-plus"></i> افزودن گزینه</button> ' +
    '<button type="button" class="btn-icon danger vg-remove" style="font-size:.8rem"><i class="fas fa-trash"></i> حذف این گروه</button>';

  container.appendChild(div);

  var list = div.querySelector('.vg-values-list');
  function addValue(value, price) {
    var row = document.createElement('div');
    row.className = 'variant-value-row';
    row.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) 160px 38px;gap:8px;align-items:center;margin:7px 0';
    row.innerHTML =
      '<input type="text" class="form-control vv-name" placeholder="مثلاً قرمز" value="' + ((value || '').replace(/"/g,'&quot;')) + '">' +
      '<input type="number" class="form-control vv-price" min="0" step="1" placeholder="قیمت (تومان)" value="' + (price == null ? '' : price) + '">' +
      '<button type="button" class="btn-icon danger vv-remove" title="حذف"><i class="fas fa-times"></i></button>';
    list.appendChild(row);
    row.querySelector('.vv-remove').addEventListener('click', function(){ row.remove(); });
  }

  var presetValues = (preset && Array.isArray(preset.values)) ? preset.values : [];
  if (presetValues.length) {
    presetValues.forEach(function(v){
      if (typeof v === 'object') addValue(v.name || v.value || '', v.price);
      else addValue(v, '');
    });
  } else {
    addValue('', '');
  }
  div.querySelector('.vg-add-value').addEventListener('click', function(){ addValue('', ''); });
  div.querySelector('.vg-remove').addEventListener('click', function(){ div.remove(); });
}

function collectVariantOptions(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return [];
  var groups = [];
  container.querySelectorAll('.variant-group-row').forEach(function(row) {
    var name = (row.querySelector('.vg-name') || {}).value || '';
    name = name.trim();
    var values = [];
    row.querySelectorAll('.variant-value-row').forEach(function(vrow) {
      var value = ((vrow.querySelector('.vv-name') || {}).value || '').trim();
      var priceRaw = (vrow.querySelector('.vv-price') || {}).value;
      if (value) {
        values.push({ name: value, price: priceRaw === '' ? null : Number(priceRaw) });
      }
    });
    if (name && values.length) groups.push({ name: name, values: values });
  });
  return groups;
}

function loadCategoriesSelect() {
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const select = document.getElementById('pCategory');
  select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function loadMyProducts() {
  const products = getData('products', DEFAULT_PRODUCTS).filter(p => p.sellerId === sellerSession.id);
  document.getElementById('myProductCount').textContent = products.length.toLocaleString('fa-IR');
  const cats = getData('categories', DEFAULT_CATEGORIES);
  const tbody = document.getElementById('myProductsTable');

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px">هنوز محصولی اضافه نکرده‌اید</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const cat = cats.find(c => c.id === p.category);
    const codeHtml = p.code ? '<br><code style="font-size:.75rem;color:#a78bfa">' + p.code + '</code>' : '';
    const varBadge = (p.variantsEnabled && p.variantOptions && p.variantOptions.length)
      ? ' <span style="font-size:.7rem;background:#7c3aed33;color:#a78bfa;padding:2px 6px;border-radius:6px">گزینه</span>' : '';
    return `
      <tr>
        <td><img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:8px" onerror="this.src='https://via.placeholder.com/50'"></td>
        <td>${p.title}${codeHtml}${varBadge}</td>
        <td>${cat ? cat.name : p.category}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td class="actions">
          <button class="action-btn edit" onclick="openEdit('${p.id}')" title="ویرایش"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" onclick="deleteMyProduct('${p.id}')" title="حذف"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function collectProductPhotos() {
  var photos = [];
  document.querySelectorAll('#pPhotosBox .pPhotoFile').forEach(function(input){
    if (input.dataset.value) photos.push(input.dataset.value);
  });
  var url = (document.getElementById('pImage') || {}).value || '';
  if (url.trim() && !photos.length) photos.push(url.trim());
  return photos;
}

function setupEditPhotoPickers() {
  document.querySelectorAll('#editPhotosBox .editPhotoFile').forEach(function(input) {
    input.addEventListener('change', function() {
      var file = input.files && input.files[0];
      if (!file) return;
      readImageAsDataURL(file).then(function(dataUrl) {
        input.dataset.value = dataUrl;
        var slot = input.closest('.edit-photo-slot');
        var img = slot ? slot.querySelector('.editPhotoPreview') : null;
        var clear = slot ? slot.querySelector('.editPhotoClear') : null;
        if (img) { img.src = dataUrl; img.style.display = 'block'; }
        if (clear) clear.style.display = 'block';
      }).catch(function(err) { alert(err.message || 'خطا در انتخاب تصویر'); });
    });
  });
  document.querySelectorAll('#editPhotosBox .editPhotoClear').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var slot = btn.closest('.edit-photo-slot');
      var input = slot ? slot.querySelector('.editPhotoFile') : null;
      var img = slot ? slot.querySelector('.editPhotoPreview') : null;
      if (input) { input.value = ''; input.dataset.value = ''; }
      if (img) { img.src = ''; img.style.display = 'none'; }
      btn.style.display = 'none';
    });
  });
}

function getEditPhotos() {
  var photos = [];
  document.querySelectorAll('#editPhotosBox .editPhotoFile').forEach(function(input) {
    if (input.dataset.value) photos.push(input.dataset.value);
  });
  var url = ((document.getElementById('editImage') || {}).value || '').trim();
  if (url && !photos.length) photos.push(url);
  return photos;
}

function loadEditPhotos(p) {
  var photos = Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean) : [];
  if (!photos.length && p.image) photos = [p.image];
  document.querySelectorAll('#editPhotosBox .edit-photo-slot').forEach(function(slot, i) {
    var input = slot.querySelector('.editPhotoFile');
    var img = slot.querySelector('.editPhotoPreview');
    var clear = slot.querySelector('.editPhotoClear');
    var src = photos[i] || '';
    if (input) { input.value = ''; input.dataset.value = src; }
    if (img) { img.src = src; img.style.display = src ? 'block' : 'none'; }
    if (clear) clear.style.display = src ? 'block' : 'none';
  });
  document.getElementById('editImage').value = photos.length ? '' : (p.image || '');
}

function addProduct() {
  const title = document.getElementById('pTitle').value.trim();
  const code = (document.getElementById('pCode') || {}).value || '';
  const category = document.getElementById('pCategory').value;
  const price = parseInt(document.getElementById('pPrice').value, 10);
  const stock = parseInt(document.getElementById('pStock').value, 10) || 0;
  const photos = collectProductPhotos();
  const image = photos[0] || '';
  const description = document.getElementById('pDesc').value.trim();
  const featured = document.getElementById('pFeatured').checked;
  const variantsEnabled = !!(document.getElementById('pVariantsEnabled') || {}).checked;
  const variantOptions = variantsEnabled ? collectVariantOptions('pVariantGroups') : [];

  if (!title || !category || !price || !image) {
    alert('لطفاً فیلدهای ستاره‌دار را پر کنید');
    return;
  }

  const product = {
    id: generateId('p'),
    title,
    code: code.trim(),
    category,
    price,
    image,
    images: photos,
    description,
    sellerId: sellerSession.id,
    sellerName: sellerSession.name,
    stock,
    featured,
    variantsEnabled: variantsEnabled && variantOptions.length > 0,
    variantOptions: variantOptions,
    createdAt: Date.now()
  };

  const products = getData('products', DEFAULT_PRODUCTS);
  products.push(product);
  setData('products', products);

  // reset form
  document.getElementById('pTitle').value = '';
  if (document.getElementById('pCode')) document.getElementById('pCode').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pStock').value = '1';
  document.getElementById('pImage').value = '';
   document.querySelectorAll('#pPhotosBox .pPhotoFile').forEach(function(input){ input.value=''; input.dataset.value=''; });
   document.querySelectorAll('#pPhotosBox .pPhotoPreview').forEach(function(img){ img.src=''; img.style.display='none'; });
  document.getElementById('pDesc').value = '';
  document.getElementById('pFeatured').checked = false;
  if (document.getElementById('pVariantsEnabled')) document.getElementById('pVariantsEnabled').checked = false;
  if (document.getElementById('pVariantsBox')) document.getElementById('pVariantsBox').style.display = 'none';
  if (document.getElementById('pVariantGroups')) document.getElementById('pVariantGroups').innerHTML = '';
  document.getElementById('imgPreview').classList.remove('show');
  var prev = document.getElementById('imgPreview');
  if (prev) prev.style.display = 'none';

  const msg = document.getElementById('productSaved');
  msg.style.display = 'inline';
  setTimeout(() => msg.style.display = 'none', 2500);

  loadMyProducts();
}

function openEdit(id) {
  const products = getData('products', DEFAULT_PRODUCTS);
  const p = products.find(x => x.id === id && x.sellerId === sellerSession.id);
  if (!p) return;
  document.getElementById('editId').value = p.id;
  document.getElementById('editTitle').value = p.title;
  if (document.getElementById('editCode')) document.getElementById('editCode').value = p.code || '';
  var eCatSel = document.getElementById('editCategory');
  if (eCatSel) {
    var cats = getData('categories', DEFAULT_CATEGORIES);
    eCatSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    eCatSel.value = p.category;
  }
  document.getElementById('editPrice').value = p.price;
  document.getElementById('editStock').value = p.stock;
  loadEditPhotos(p);
  document.getElementById('editDesc').value = p.description || '';

  // variants
  var eVarEn = document.getElementById('editVariantsEnabled');
  var eBox = document.getElementById('editVariantsBox');
  var eGroups = document.getElementById('editVariantGroups');
  if (eGroups) eGroups.innerHTML = '';
  if (eVarEn) {
    eVarEn.checked = !!(p.variantsEnabled && p.variantOptions && p.variantOptions.length);
    if (eBox) eBox.style.display = eVarEn.checked ? 'block' : 'none';
    if (eVarEn.checked && p.variantOptions) {
      p.variantOptions.forEach(function(g) { addVariantGroupUI('editVariantGroups', g); });
    }
  }

  document.getElementById('editModal').classList.add('active');
}

function updateProduct() {
  const id = document.getElementById('editId').value;
  const products = getData('products', DEFAULT_PRODUCTS);
  const p = products.find(x => x.id === id && x.sellerId === sellerSession.id);
  if (!p) return;

  p.title = document.getElementById('editTitle').value.trim();
  p.code = ((document.getElementById('editCode') || {}).value || '').trim();
  var eCatSel2 = document.getElementById('editCategory');
  if (eCatSel2 && eCatSel2.value) p.category = eCatSel2.value;
  p.price = parseInt(document.getElementById('editPrice').value, 10);
  p.stock = parseInt(document.getElementById('editStock').value, 10) || 0;
  var editPhotos = getEditPhotos();
  p.images = editPhotos;
  p.image = editPhotos[0] || document.getElementById('editImage').value.trim();
  p.description = document.getElementById('editDesc').value.trim();

  var variantsEnabled = !!(document.getElementById('editVariantsEnabled') || {}).checked;
  var variantOptions = variantsEnabled ? collectVariantOptions('editVariantGroups') : [];
  p.variantsEnabled = variantsEnabled && variantOptions.length > 0;
  p.variantOptions = variantOptions;

  setData('products', products);
  document.getElementById('editModal').classList.remove('active');
  loadMyProducts();
}

function deleteMyProduct(id) {
  if (!confirm('محصول حذف شود؟')) return;
  let products = getData('products', DEFAULT_PRODUCTS).filter(p => !(p.id === id && p.sellerId === sellerSession.id));
  setData('products', products);
  loadMyProducts();
}

window.openEdit = openEdit;
window.deleteMyProduct = deleteMyProduct;

/* ---- Seller Reviews ---- */
function loadSellerReviews() {
  if (!sellerSession) return;
  var products = getData('products', DEFAULT_PRODUCTS).filter(function(p) { return p.sellerId === sellerSession.id; });
  var myIds = {};
  products.forEach(function(p) { myIds[p.id] = p; });
  var reviews = getData('reviews', []);
  if (!Array.isArray(reviews)) reviews = [];
  reviews = reviews.filter(function(r) { return myIds[r.productId]; });
  var tbody = document.getElementById('sellerReviewsTable');
  if (!tbody) return;
  if (!reviews.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8b8ba0;padding:40px">نظری برای محصولات شما ثبت نشده</td></tr>';
    return;
  }
  tbody.innerHTML = reviews.map(function(r) {
    var p = myIds[r.productId];
    var stars = '';
    for (var i = 1; i <= 5; i++) stars += i <= (r.stars || 0) ? '★' : '☆';
    var st = r.status === 'approved' ? '<span style="color:#34d399">تایید شده</span>' : '<span style="color:#fbbf24">در انتظار</span>';
    return '<tr>' +
      '<td>' + (p ? p.title : '') + '</td>' +
      '<td>' + (r.name || '') + '</td>' +
      '<td style="color:#fbbf24">' + stars + '</td>' +
      '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (r.text || '') + '</td>' +
      '<td>' + st + '</td>' +
      '<td class="actions">' +
        '<button class="action-btn edit" onclick="sellerViewReview(\'' + r.id + '\')"><i class="fas fa-reply"></i></button>' +
        '<button class="action-btn delete" onclick="sellerDeleteReview(\'' + r.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</td></tr>';
  }).join('');
}

function sellerViewReview(id) {
  var reviews = getData('reviews', []);
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  var box = document.getElementById('sellerReviewDetail');
  if (!box) return;
  box.style.display = 'block';
  box.innerHTML =
    '<h3>پاسخ به نظر</h3>' +
    '<p style="margin:12px 0;line-height:1.7">' + (r.text || '') + '</p>' +
    '<div class="form-group"><label>پاسخ شما</label><textarea class="form-control" id="sellerReplyText" rows="3">' + (r.reply || '') + '</textarea></div>' +
    '<button class="btn btn-primary" onclick="sellerSaveReply(\'' + r.id + '\')"><i class="fas fa-check"></i> ذخیره پاسخ</button>';
}

function sellerSaveReply(id) {
  var reviews = getData('reviews', []);
  var r = reviews.find(function(x) { return x.id === id; });
  if (!r) return;
  var ta = document.getElementById('sellerReplyText');
  r.reply = ta ? ta.value.trim() : '';
  setData('reviews', reviews);
  loadSellerReviews();
  sellerViewReview(id);
  alert('پاسخ ذخیره شد');
}

function sellerDeleteReview(id) {
  if (!confirm('حذف این نظر؟')) return;
  var reviews = getData('reviews', []).filter(function(x) { return x.id !== id; });
  setData('reviews', reviews);
  loadSellerReviews();
  var box = document.getElementById('sellerReviewDetail');
  if (box) box.style.display = 'none';
}

window.sellerViewReview = sellerViewReview;
window.sellerSaveReply = sellerSaveReply;
window.sellerDeleteReview = sellerDeleteReview;

// Hook into tab switch
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-nav a[data-tab="reviews"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadSellerReviews, 50); });
  });
});

/* ---- Seller Orders ---- */
var SELLER_ORDER_STATUSES = [
  { key: 'pending', label: 'ثبت شده' },
  { key: 'preparing', label: 'آماده‌سازی' },
  { key: 'shipping', label: 'در حال ارسال' },
  { key: 'delivered', label: 'تحویل داده شد' }
];

function loadSellerOrders() {
  if (!sellerSession) return;
  var orders = getData('orders', []);
  if (!Array.isArray(orders)) orders = [];
  var myOrders = orders.filter(function(o) {
    if (Array.isArray(o.sellerIds) && o.sellerIds.indexOf(sellerSession.id) !== -1) return true;
    return (o.items || []).some(function(it) { return it.sellerId === sellerSession.id; });
  });
  var tbody = document.getElementById('sellerOrdersTable');
  if (!tbody) return;
  if (!myOrders.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#8b8ba0;padding:40px">سفارشی برای محصولات شما نیست</td></tr>';
    return;
  }
  tbody.innerHTML = myOrders.map(function(o) {
    var myItems = (o.items || []).filter(function(it) { return it.sellerId === sellerSession.id; });
    var itemsStr = myItems.map(function(it) { return (it.title || '') + '×' + (it.qty||1); }).join('، ');
    var stLabel = (SELLER_ORDER_STATUSES.find(function(s){return s.key===o.status;}) || {}).label || o.status;
    return '<tr>' +
      '<td><code>' + o.id + '</code></td>' +
      '<td>' + (o.customerName || '') + '</td>' +
      '<td>' + (o.customerPhone || '') + '</td>' +
      '<td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + itemsStr + '</td>' +
      '<td>' + stLabel + '</td>' +
      '<td class="actions"><button class="action-btn edit" onclick="sellerViewOrder(\'' + o.id + '\')"><i class="fas fa-eye"></i></button></td>' +
    '</tr>';
  }).join('');
}

function sellerViewOrder(id) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === id; });
  if (!o) return;
  var box = document.getElementById('sellerOrderDetail');
  if (!box) return;
  box.style.display = 'block';
  var addr = o.address || {};
  var myItems = (o.items || []).filter(function(it) { return it.sellerId === sellerSession.id; });
  var items = myItems.map(function(it) {
    return '<li>' + (it.title||'') + ' × ' + (it.qty||1) + '</li>';
  }).join('');
  var opts = SELLER_ORDER_STATUSES.map(function(s) {
    return '<option value="' + s.key + '"' + (o.status===s.key?' selected':'') + '>' + s.label + '</option>';
  }).join('');
  box.innerHTML =
    '<h3>سفارش ' + o.id + '</h3>' +
    '<p><strong>خریدار:</strong> ' + (o.customerName||'') + ' — <strong>موبایل:</strong> ' + (o.customerPhone||'') + '</p>' +
    '<p><strong>آدرس:</strong> ' + (addr.province||'') + '، ' + (addr.city||'') + '، ' + (addr.address||'') + '</p>' +
    '<ul style="margin:12px 0;padding-right:20px">' + items + '</ul>' +
    '<div class="form-group"><label>وضعیت ارسال</label><select class="form-control" id="sellerOrderStatus">' + opts + '</select></div>' +
    '<button class="btn btn-primary" onclick="sellerUpdateOrderStatus(\'' + o.id + '\')"><i class="fas fa-save"></i> ذخیره وضعیت</button>';
}

function sellerUpdateOrderStatus(id) {
  var orders = getData('orders', []);
  var o = orders.find(function(x) { return x.id === id; });
  if (!o) return;
  var sel = document.getElementById('sellerOrderStatus');
  var st = sel ? sel.value : o.status;
  o.status = st;
  if (!Array.isArray(o.statusHistory)) o.statusHistory = [];
  o.statusHistory.push({ status: st, at: Date.now(), note: 'فروشنده: ' + st });
  setData('orders', orders);
  loadSellerOrders();
  sellerViewOrder(id);
  alert('وضعیت به‌روز شد');
}

window.sellerViewOrder = sellerViewOrder;
window.sellerUpdateOrderStatus = sellerUpdateOrderStatus;

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.sidebar-nav a[data-tab="orders"]').forEach(function(a) {
    a.addEventListener('click', function() { setTimeout(loadSellerOrders, 50); });
  });
});

// Live UI refresh when another browser/device updates shared data via Supabase
window.addEventListener('dekori:data-sync', function(e) {
  if (!e || !e.detail || !e.detail.key) return;
  var key = e.detail.key;
  try {
    if (key === 'products' && typeof loadMyProducts === 'function') loadMyProducts();
    if (key === 'orders' && typeof loadSellerOrders === 'function') loadSellerOrders();
    if (key === 'reviews' && typeof loadSellerReviews === 'function') loadSellerReviews();
    if (key === 'categories' && typeof loadCategoriesSelect === 'function') loadCategoriesSelect();
  } catch (err) {
    console.warn('seller data-sync UI update error:', err);
  }
});

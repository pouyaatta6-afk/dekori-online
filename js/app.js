// Main storefront — stable version


function updateCustomerTicketBadge() {
  try {
    var sess = null;
    try { sess = JSON.parse(localStorage.getItem('dekori_customer_session') || 'null'); } catch(e) {}
    var tickets = getData('tickets', []);
    if (!Array.isArray(tickets)) tickets = [];
    var phone = sess && sess.phone ? String(sess.phone) : '';
    var sid = sess && sess.id ? String(sess.id) : '';
    var count = tickets.filter(function(t) {
      if (!t || t.status === 'closed') return false;
      var mine = false;
      if (sid && t.customerId === sid) mine = true;
      if (phone && (t.customerPhone === phone || t.contact === phone)) mine = true;
      if (!mine) return false;
      return t.unreadCustomer || (t.messages && t.messages.length && t.messages[t.messages.length-1].from === 'admin');
    }).length;
    ['headerTicketBadge', 'mobileTicketBadge', 'footerTicketBadge'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (count > 0) {
        el.style.display = id === 'headerTicketBadge' ? 'inline-flex' : 'inline';
        el.textContent = count > 99 ? '99+' : String(count);
      } else {
        el.style.display = 'none';
      }
    });
  } catch (e) {}
}


function updateSellerEntryLinks() {
  try {
    var raw = localStorage.getItem('dekori_seller') || sessionStorage.getItem('dekori_seller');
    var logged = false;
    if (raw) {
      var s = JSON.parse(raw);
      logged = !!(s && s.id);
    }
    var href = logged ? 'seller/dashboard.html' : 'seller/login.html';
    var label = logged ? 'پنل فروشنده' : 'فروشنده';
    var mobLabel = logged ? 'پنل فروشنده' : 'ورود فروشنده';
    ['sellerEntryLink'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) { el.href = href; el.textContent = label; }
    });
    var m = document.getElementById('mobileSellerEntryLink');
    if (m) { m.href = href; m.textContent = mobLabel; }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function() {
  try { updateCustomerTicketBadge(); } catch(e) {}
  try { updateSellerEntryLinks(); } catch(e) {}
  try { applySettings(); } catch(e) { console.warn(e); }
  try { applyCustomCode(); } catch(e) { console.warn(e); }
  try { renderCategories(); } catch(e) { console.warn(e); }
  try { renderFilters(); } catch(e) { console.warn(e); }
  try { renderProducts(); } catch(e) { console.warn(e); }
  try { updateCartUI(); } catch(e) { console.warn(e); }
  try { setupEventListeners(); } catch(e) { console.warn(e); }
  try { updateStats(); } catch(e) { console.warn(e); }
  try { runPlugins(); } catch(e) { console.warn(e); }
});

function shadeColor(hex, percent) {
  try {
    hex = String(hex).replace('#','');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2),16), g = parseInt(hex.substring(2,4),16), b = parseInt(hex.substring(4,6),16);
    r = Math.min(255, Math.max(0, Math.round(r + (r * percent / 100))));
    g = Math.min(255, Math.max(0, Math.round(g + (g * percent / 100))));
    b = Math.min(255, Math.max(0, Math.round(b + (b * percent / 100))));
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  } catch(e) { return hex; }
}

function applySettings() {
  var s = getData('settings', DEFAULT_SETTINGS);
  setText('siteName', s.siteName);
  setText('footerSiteName', s.siteName);
  setText('heroTitle', s.heroTitle);
  setText('heroSubtitle', s.heroSubtitle);
  setText('aboutTitle', s.aboutTitle);
  setText('aboutText', s.aboutText);
  setText('contactEmail', s.contactEmail);
  setText('contactPhone', s.contactPhone);
  setText('contactAddress', s.contactAddress);
  setText('footerText', s.footerText);
  document.title = (s.siteName || 'دکوری آنلاین') + ' | فروشگاه';
  if (s.logo) {
    var logo = document.getElementById('siteLogo');
    if (logo) { logo.src = s.logo; logo.style.display = 'block'; }
  }
  if (s.primaryColor) {
    var pc = s.primaryColor;
    document.documentElement.style.setProperty('--primary', pc);
    document.documentElement.style.setProperty('--primary-dark', shadeColor(pc, -20));
    document.documentElement.style.setProperty('--primary-light', shadeColor(pc, 35));
    // Force override hard-coded purple leftovers
    var styleId = 'dekori-theme-override';
    var st = document.getElementById(styleId);
    if (!st) { st = document.createElement('style'); st.id = styleId; document.head.appendChild(st); }
    st.textContent =
      ':root{--primary:' + pc + ';--primary-dark:' + shadeColor(pc,-20) + ';--primary-light:' + shadeColor(pc,35) + '}' +
      '.btn-primary,.filter-btn.active,.nav-links a.active,.logo-icon,.seller-btn,' +
      '.hero .btn-primary,#announce-bar,#announce-bar *,.progress-scroll,.wa-float,' +
      'button.btn-primary,a.btn-primary,.cart-sidebar .btn-primary{background:' + pc + '!important;border-color:' + pc + '!important;color:#fff!important}' +
      '.btn-primary:hover{background:' + shadeColor(pc, -15) + '!important}' +
      '.hero h1,.product-title:hover,.nav-links a:hover{color:' + shadeColor(pc, 40) + '!important}' +
      '.hero{background:radial-gradient(ellipse at 50% 0%, ' + pc + '33 0%, transparent 55%), var(--bg)!important}' +
      '.logo-icon,.logo span:first-child{background:' + pc + '!important}' +
      '[style*="background:#7c3aed"],[style*="background: #7c3aed"]{background:' + pc + '!important}' +
      '#marquee-bar{background:' + pc + '!important}';
  }
  if (s.secondaryColor) {
    document.documentElement.style.setProperty('--secondary', s.secondaryColor);
    var styleId2 = 'dekori-theme-secondary';
    var st2 = document.getElementById(styleId2);
    if (!st2) { st2 = document.createElement('style'); st2.id = styleId2; document.head.appendChild(st2); }
    st2.textContent = '.product-price,.price{color:' + s.secondaryColor + '!important}';
  }
  toggleSection('heroSection', s.showHero !== false);
  toggleSection('categories', s.showCategories !== false);
  toggleSection('about', s.showAbout !== false);
  toggleSection('contact', s.showContact !== false);
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el && val != null) el.textContent = val;
}

function toggleSection(id, show) {
  var el = document.getElementById(id);
  if (el) el.style.display = show ? '' : 'none';
}

function applyCustomCode() {
  var code = getData('customCode', DEFAULT_CUSTOM_CODE);
  if (code.customCSS && code.customCSS.trim() && code.customCSS.indexOf('/* CSS') !== 0) {
    var st = document.createElement('style');
    st.textContent = code.customCSS;
    document.head.appendChild(st);
  }
  if (code.customJS && code.customJS.trim() && code.customJS.indexOf('// JS') !== 0) {
    try {
      var sc = document.createElement('script');
      sc.textContent = code.customJS;
      document.body.appendChild(sc);
    } catch (e) {}
  }
}

function renderCategories() {
  var cats = getData('categories', DEFAULT_CATEGORIES);
  if (!Array.isArray(cats) || !cats.length) cats = DEFAULT_CATEGORIES;
  var grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  grid.innerHTML = cats.map(function(c) {
    return '<div class="category-card" data-cat="' + c.id + '"><i class="fas ' + (c.icon || 'fa-tag') + '"></i><h3>' + c.name + '</h3></div>';
  }).join('');
  grid.querySelectorAll('.category-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var cat = card.getAttribute('data-cat');
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      var btn = document.querySelector('.filter-btn[data-filter="' + cat + '"]');
      if (btn) btn.classList.add('active');
      renderProducts(cat);
      var sec = document.getElementById('products');
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderFilters() {
  var cats = getData('categories', DEFAULT_CATEGORIES);
  if (!Array.isArray(cats) || !cats.length) cats = DEFAULT_CATEGORIES;
  var bar = document.getElementById('filtersBar');
  if (!bar) return;
  var activeFilter = 'all';
  var current = bar.querySelector('.filter-btn.active');
  if (current) activeFilter = current.getAttribute('data-filter') || 'all';
  var html = '<button class="filter-btn' + (activeFilter === 'all' ? ' active' : '') + '" data-filter="all">همه</button>';
  cats.forEach(function(c) {
    html += '<button class="filter-btn' + (activeFilter === c.id ? ' active' : '') + '" data-filter="' + c.id + '">' + (c.name || c.id) + '</button>';
  });
  bar.innerHTML = html;
  bar.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      bar.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderProducts(btn.getAttribute('data-filter'));
    });
  });
}

var _productsDisplayLimit = 10;
var _currentSearchQuery = '';
var _currentCategoryFilter = 'all';

function getFilteredProducts() {
  var products = getData('products', DEFAULT_PRODUCTS);
  if (!Array.isArray(products)) products = [];
  if (_currentCategoryFilter && _currentCategoryFilter !== 'all') {
    products = products.filter(function(p) { return p.category === _currentCategoryFilter; });
  }
  if (_currentSearchQuery) {
    var q = _currentSearchQuery.toLowerCase();
    products = products.filter(function(p) {
      var title = (p.title || '').toLowerCase();
      var desc = (p.description || '').toLowerCase();
      var code = (p.code || '').toLowerCase();
      return title.indexOf(q) !== -1 || desc.indexOf(q) !== -1 || code.indexOf(q) !== -1;
    });
  }
  return products.slice().sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
}

function renderProducts(filter) {
  if (filter !== undefined && filter !== null && filter !== 'keep') {
    _currentCategoryFilter = filter || 'all';
    _productsDisplayLimit = 10;
  }
  var products = getFilteredProducts();

  var grid = document.getElementById('productsGrid');
  if (!grid) return;

  var oldMore = document.getElementById('loadMoreWrap');
  if (oldMore) oldMore.remove();

  if (!products.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-box-open"></i><p>محصولی یافت نشد</p></div>';
    return;
  }

  var cats = getData('categories', DEFAULT_CATEGORIES);
  var lowStock = window._dekoriLowStock || 0;
  var limit = _productsDisplayLimit;
  var visible = products.slice(0, limit);
  var hasMore = products.length > limit;

  grid.innerHTML = visible.map(function(p) {
    var cat = cats.find(function(c) { return c.id === p.category; });
    var outOfStock = (p.stock || 0) <= 0;
    var badge = '';
    if (outOfStock) {
      badge = '<span class="product-badge out-of-stock-badge">ناموجود</span>';
    } else if (lowStock && p.stock > 0 && p.stock < lowStock) {
      badge = '<span class="product-badge" style="background:#ef4444;color:#fff">تنها ' + p.stock + ' عدد</span>';
    } else if (p.featured) {
      badge = '<span class="product-badge">ویژه</span>';
    }
    var img = p.image || 'https://via.placeholder.com/400x400?text=Product';
    var codeLine = p.code ? '<div style="font-size:.75rem;color:#a78bfa;margin-top:2px"><i class="fas fa-barcode"></i> ' + p.code + '</div>' : '';
    return '<div class="product-card' + (outOfStock ? ' is-out-of-stock' : '') + '" data-id="' + p.id + '">' +
      '<div class="product-img"><img src="' + img + '" alt="' + (p.title || '') + '" loading="lazy" onerror="this.src=\'https://via.placeholder.com/400x400?text=No+Image\'">' + badge + '</div>' +
      '<div class="product-body">' +
        '<div class="product-cat">' + (cat ? cat.name : (p.category || '')) + '</div>' +
        '<h3 class="product-title">' + (p.title || 'بدون نام') + '</h3>' +
        codeLine +
        '<div class="product-seller"><i class="fas fa-store"></i> ' + (p.sellerName || '') + '</div>' +
        '<div class="product-footer">' +
          '<div class="product-price">' + formatPrice(p.price || 0) + '</div>' +
          '<button class="add-cart-btn" data-id="' + p.id + '" type="button"' + (outOfStock ? ' disabled title="ناموجود"' : '') + '><i class="fas fa-plus"></i></button>' +
        '</div></div></div>';
  }).join('');

  grid.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.add-cart-btn')) return;
      openProductModal(card.getAttribute('data-id'));
    });
  });
  grid.querySelectorAll('.add-cart-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var pid = btn.getAttribute('data-id');
      var prods = getData('products', DEFAULT_PRODUCTS);
      var prod = prods.find(function(x) { return x.id === pid; });
      if (prod && prod.variantsEnabled && prod.variantOptions && prod.variantOptions.length) {
        openProductModal(pid);
        return;
      }
      addToCart(pid);
    });
  });

  if (hasMore) {
    var wrap = document.createElement('div');
    wrap.id = 'loadMoreWrap';
    wrap.style.cssText = 'grid-column:1/-1;text-align:center;padding:24px 0 8px';
    wrap.innerHTML = '<button type="button" class="btn btn-outline" id="loadMoreBtn" style="min-width:180px">' +
      '<i class="fas fa-chevron-down"></i> نمایش بیشتر (' + (products.length - limit) + ' مورد دیگر)</button>';
    grid.appendChild(wrap);
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
      _productsDisplayLimit = Math.max(products.length, _productsDisplayLimit + 10);
      renderProducts('keep');
    });
  }
}

function getReviewsPlugin() {
  var plugins = getData('plugins', DEFAULT_PLUGINS);
  return (plugins || []).find(function(x) { return x.id === 'reviews' && x.enabled; }) || null;
}

function getProductReviews(productId, onlyApproved) {
  var all = getData('reviews', []);
  if (!Array.isArray(all)) all = [];
  return all.filter(function(r) {
    if (r.productId !== productId) return false;
    if (onlyApproved && r.status !== 'approved') return false;
    return true;
  }).sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
}

function avgStars(reviews) {
  if (!reviews.length) return 0;
  var sum = reviews.reduce(function(s, r) { return s + (r.stars || 0); }, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function starsHtml(n) {
  var s = '';
  for (var i = 1; i <= 5; i++) s += i <= Math.round(n) ? '★' : '☆';
  return s;
}

function openProductModal(id) {
  var products = getData('products', DEFAULT_PRODUCTS);
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  var cats = getData('categories', DEFAULT_CATEGORIES);
  var cat = cats.find(function(c) { return c.id === p.category; });
  var body = document.getElementById('productModalBody');
  if (!body) return;

  var reviewsPlugin = getReviewsPlugin();
  var reviewsHtml = '';
  if (reviewsPlugin) {
    var reviews = getProductReviews(id, true);
    var avg = avgStars(reviews);
    var list = reviews.length ? reviews.map(function(r) {
      return '<div class="review-item">' +
        '<div class="review-item-head">' +
          '<span class="review-author">' + (r.name || 'کاربر') + '</span>' +
          '<span class="review-stars">' + starsHtml(r.stars || 0) + '</span>' +
          '<span class="review-date">' + new Date(r.createdAt).toLocaleDateString('fa-IR') + '</span>' +
        '</div>' +
        '<div class="review-text">' + (r.text || '') + '</div>' +
        (r.reply ? '<div class="review-reply"><strong>پاسخ فروشنده/مدیر:</strong> ' + r.reply + '</div>' : '') +
      '</div>';
    }).join('') : '<p style="color:var(--text-muted);font-size:.9rem">هنوز نظری ثبت نشده — اولین نفر باشید!</p>';

    reviewsHtml =
      '<div class="reviews-section" id="reviewsBox">' +
        '<h3><i class="fas fa-star" style="color:#fbbf24"></i> نظرات کاربران' +
          (reviews.length ? ' <span class="avg-rating">(' + avg + ' از ۵ · ' + reviews.length + ' نظر)</span>' : '') +
        '</h3>' +
        list +
        '<div class="review-form">' +
          '<div style="font-weight:600;margin-bottom:8px">نظر شما</div>' +
          '<div class="stars-select" id="starSelect">' +
            '<button type="button" data-s="1">★</button><button type="button" data-s="2">★</button>' +
            '<button type="button" data-s="3">★</button><button type="button" data-s="4">★</button>' +
            '<button type="button" data-s="5">★</button>' +
          '</div>' +
          '<input type="hidden" id="reviewStars" value="5">' +
          '<div class="form-group"><input type="text" class="form-control" id="reviewName" placeholder="نام شما"></div>' +
          '<div class="form-group"><textarea class="form-control" id="reviewText" rows="3" placeholder="نظر خود را بنویسید..."></textarea></div>' +
          '<button type="button" class="btn btn-primary" id="submitReviewBtn" data-pid="' + p.id + '"><i class="fas fa-paper-plane"></i> ثبت نظر</button>' +
        '</div>' +
      '</div>';
  }

  var variantsHtml = '';
  if (p.variantsEnabled && Array.isArray(p.variantOptions) && p.variantOptions.length) {
    variantsHtml = '<div class="product-variants" id="productVariantsBox" style="margin-bottom:16px">';
    p.variantOptions.forEach(function(g, gi) {
      variantsHtml += '<div class="form-group" style="margin-bottom:10px"><label style="font-size:.85rem;font-weight:600">' + g.name + '</label>' +
        '<select class="form-control variant-select" data-vname="' + g.name + '">' +
        '<option value="">انتخاب ' + g.name + '</option>';
      (g.values || []).forEach(function(v) {
        var vn = typeof v === 'object' ? (v.name || v.value || '') : v;
        var vp = typeof v === 'object' ? v.price : null;
        var label = vn + (vp !== null && vp !== undefined && vp !== '' ? ' — ' + formatPrice(vp) + ' تومان' : '');
        variantsHtml += '<option value="' + String(vn).replace(/"/g,'&quot;') + '" data-price="' + (vp == null ? '' : vp) + '">' + label + '</option>';
      });
      variantsHtml += '</select></div>';
    });
    variantsHtml += '</div>';
  }

  var codeHtml = p.code ? '<p style="color:#a78bfa;font-size:.9rem;margin-bottom:8px"><i class="fas fa-barcode"></i> کد: <code>' + p.code + '</code></p>' : '';
  var productImages = Array.isArray(p.images) && p.images.length ? p.images.filter(Boolean) : [];
  if (!productImages.length && p.image) productImages = [p.image];
  if (!productImages.length) productImages = ['https://via.placeholder.com/500x500?text=No+Image'];
  var galleryHtml = '<div class="product-modal-img product-gallery">' +
      '<button type="button" class="gallery-arrow gallery-prev" aria-label="عکس قبلی"><i class="fas fa-chevron-right"></i></button>' +
      '<img id="productGalleryMain" src="' + productImages[0] + '" alt="" onerror="this.src=\'https://via.placeholder.com/500x500?text=No+Image\'">' +
      '<button type="button" class="gallery-arrow gallery-next" aria-label="عکس بعدی"><i class="fas fa-chevron-left"></i></button>' +
      (productImages.length > 1 ? '<div class="gallery-thumbs">' + productImages.map(function(src, i) { return '<button type="button" class="gallery-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"><img src="' + src + '" alt="عکس ' + (i+1) + '"></button>'; }).join('') + '</div>' : '') +
      '</div>';

  body.innerHTML =
    galleryHtml +
    '<div class="product-modal-info">' +
      '<div class="product-cat">' + (cat ? cat.name : '') + '</div>' +
      '<h2>' + p.title + '</h2>' +
      codeHtml +
      '<div class="price" id="modalProductPrice">' + formatPrice(p.price) + '</div>' +
      '<p class="desc">' + (p.description || '') + '</p>' +
      '<p style="color:var(--text-muted);font-size:.9rem;margin-bottom:8px"><i class="fas fa-store"></i> ' + (p.sellerName || '') + '</p>' +
      '<p style="color:var(--text-muted);font-size:.9rem;margin-bottom:16px"><i class="fas fa-box"></i> ' + (p.stock > 0 ? ('موجودی: ' + p.stock) : '<span style="color:#f87171">ناموجود</span>') + '</p>' +
      variantsHtml +
      '<button class="btn btn-primary" type="button" id="modalAddCartBtn" data-pid="' + p.id + '"' + (p.stock > 0 ? '' : ' disabled') + '>' +
        (p.stock > 0 ? '<i class="fas fa-shopping-bag"></i> افزودن به سبد' : '<i class="fas fa-ban"></i> ناموجود') +
      '</button>' +
      (window._dekoriShareBtn ? '<button class="btn btn-outline" type="button" id="modalShareBtn" style="margin-top:8px" data-title="' + String(p.title || '').replace(/"/g, '') + '"><i class="fas fa-share-nodes"></i> اشتراک‌گذاری</button>' : '') +
      reviewsHtml +
    '</div>';
  var modal = document.getElementById('productModal');
  if (modal) modal.classList.add('active');

  // Product gallery: previous / next / thumbnails
  (function setupProductGallery(){
    var idx = 0;
    var main = document.getElementById('productGalleryMain');
    var prev = body.querySelector('.gallery-prev');
    var next = body.querySelector('.gallery-next');
    var thumbs = body.querySelectorAll('.gallery-thumb');
    function showImage(n){
      if (!productImages.length || !main) return;
      idx = (n + productImages.length) % productImages.length;
      main.src = productImages[idx];
      thumbs.forEach(function(t){ t.classList.toggle('active', parseInt(t.dataset.index,10) === idx); });
    }
    if (prev) prev.addEventListener('click', function(){ showImage(idx - 1); });
    if (next) next.addEventListener('click', function(){ showImage(idx + 1); });
    thumbs.forEach(function(t){ t.addEventListener('click', function(){ showImage(parseInt(t.dataset.index,10)); }); });
  })();

  // Variant price: selecting an option immediately changes the displayed price.
  function getSelectedVariantPrice(){
    var price = Number(p.price) || 0;
    var found = false;
    body.querySelectorAll('.variant-select').forEach(function(sel){
      var opt = sel.options[sel.selectedIndex];
      if (opt && opt.value && opt.dataset.price !== '') {
        price = Number(opt.dataset.price) || 0;
        found = true;
      }
    });
    return found ? price : (Number(p.price) || 0);
  }
  body.querySelectorAll('.variant-select').forEach(function(sel){
    sel.addEventListener('change', function(){
      var priceEl = document.getElementById('modalProductPrice');
      if (priceEl) priceEl.textContent = formatPrice(getSelectedVariantPrice());
      sel.style.borderColor = '';
    });
  });

  var addBtn = document.getElementById('modalAddCartBtn');
  if (addBtn && !addBtn.disabled) {
    addBtn.addEventListener('click', function() {
      var pid = addBtn.getAttribute('data-pid');
      var selected = {};
      var ok = true;
      body.querySelectorAll('.variant-select').forEach(function(sel) {
        var name = sel.getAttribute('data-vname');
        var val = sel.value;
        if (!val) { ok = false; sel.style.borderColor = '#f87171'; }
        else { selected[name] = val; sel.style.borderColor = ''; }
      });
      if (!ok) { alert('لطفاً همه گزینه‌ها را انتخاب کنید'); return; }
      addToCart(pid, selected, getSelectedVariantPrice());
      closeProductModal();
    });
  }

  var shareBtn = document.getElementById('modalShareBtn');
  if (shareBtn) shareBtn.addEventListener('click', function() {
    var url = location.href.split('#')[0] + '#product-' + p.id;
    var title = shareBtn.getAttribute('data-title') || document.title;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function() {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        if (typeof showToast === 'function') showToast('لینک محصول کپی شد');
        else alert('لینک کپی شد: ' + url);
      }).catch(function() { alert(url); });
    } else {
      alert(url);
    }
  });

  // star picker
  var starBox = document.getElementById('starSelect');
  if (starBox) {
    var setStars = function(n) {
      document.getElementById('reviewStars').value = n;
      starBox.querySelectorAll('button').forEach(function(b) {
        b.classList.toggle('active', parseInt(b.getAttribute('data-s'), 10) <= n);
      });
    };
    setStars(5);
    starBox.querySelectorAll('button').forEach(function(b) {
      b.addEventListener('click', function() { setStars(parseInt(b.getAttribute('data-s'), 10)); });
    });
  }
  var submitBtn = document.getElementById('submitReviewBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      submitProductReview(submitBtn.getAttribute('data-pid'));
    });
  }
}

function submitProductReview(productId) {
  var name = (document.getElementById('reviewName') || {}).value || '';
  name = name.trim() || 'کاربر';
  var text = (document.getElementById('reviewText') || {}).value || '';
  text = text.trim();
  var stars = parseInt((document.getElementById('reviewStars') || {}).value || '5', 10);
  if (!text) { alert('لطفاً متن نظر را بنویسید'); return; }
  var plugin = getReviewsPlugin();
  var auto = plugin && plugin.settings && plugin.settings.autoApprove !== false;
  var review = {
    id: 'rv' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    productId: productId,
    name: name,
    text: text,
    stars: Math.min(5, Math.max(1, stars || 5)),
    status: auto ? 'approved' : 'pending',
    reply: '',
    createdAt: Date.now()
  };
  var all = getData('reviews', []);
  if (!Array.isArray(all)) all = [];
  all.unshift(review);
  setData('reviews', all);
  if (auto) {
    showToast('نظر شما ثبت شد');
    openProductModal(productId);
  } else {
    alert('نظر شما ثبت شد و پس از تایید نمایش داده می‌شود');
    document.getElementById('reviewText').value = '';
  }
}

function closeProductModal() {
  var m = document.getElementById('productModal');
  if (m) m.classList.remove('active');
}

function cartLineKey(id, variants) {
  var v = variants || {};
  var keys = Object.keys(v).sort();
  if (!keys.length) return id;
  return id + '|' + keys.map(function(k) { return k + '=' + v[k]; }).join('&');
}

function addToCart(id, variants, customPrice) {
  variants = variants || {};
  var products = getData('products', DEFAULT_PRODUCTS);
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  var stock = p.stock || 0;
  if (stock <= 0) { showToast('این محصول ناموجود است'); return; }
  // if product has required variants and none passed, open modal
  if (p.variantsEnabled && p.variantOptions && p.variantOptions.length && Object.keys(variants).length === 0) {
    openProductModal(id);
    return;
  }
  var cart = getData('cart', []);
  if (!Array.isArray(cart)) cart = [];
  var lineKey = cartLineKey(id, variants);
  var existing = cart.find(function(c) { return (c.lineKey || c.id) === lineKey; });
  var currentQty = existing ? (existing.qty || 0) : 0;
  if (currentQty + 1 > stock) {
    showToast('موجودی کافی نیست (حداکثر ' + stock + ' عدد)');
    return;
  }
  if (existing) existing.qty += 1;
  else {
    var variantLabel = Object.keys(variants).map(function(k) { return k + ': ' + variants[k]; }).join(' · ');
    cart.push({
      id: p.id,
      lineKey: lineKey,
      title: p.title,
      price: customPrice == null ? p.price : customPrice,
      image: p.image,
      qty: 1,
      variants: variants,
      variantLabel: variantLabel
    });
  }
  setData('cart', cart);
  updateCartUI();
  showToast('به سبد خرید اضافه شد');
  if (window._dekoriConfetti) fireConfetti();
  if (window._dekoriCartBounce) {
    var cb = document.getElementById('cartBtn');
    if (cb) {
      cb.style.transition = 'transform .3s';
      cb.style.transform = 'scale(1.25)';
      setTimeout(function() { cb.style.transform = 'scale(1)'; }, 300);
    }
  }
  var btn = document.querySelector('.add-cart-btn[data-id="' + id + '"]');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(function() { btn.innerHTML = '<i class="fas fa-plus"></i>'; }, 700);
  }
}

function getActiveCoupon() {
  try { return JSON.parse(localStorage.getItem('dekori_active_coupon') || 'null'); } catch(e) { return null; }
}
function setActiveCoupon(c) {
  if (c) localStorage.setItem('dekori_active_coupon', JSON.stringify(c));
  else localStorage.removeItem('dekori_active_coupon');
}

function calcDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return Math.round(subtotal * (coupon.value / 100));
  return Math.min(subtotal, coupon.value || 0);
}

function updateCartUI() {
  var cart = getData('cart', []);
  if (!Array.isArray(cart)) cart = [];
  var count = cart.reduce(function(s, i) { return s + (i.qty || 0); }, 0);
  var countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = count;
  var container = document.getElementById('cartItems');
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>سبد خرید خالی است</p></div>';
    var t = document.getElementById('cartTotal');
    if (t) t.textContent = '۰ تومان';
    var sr = document.getElementById('cartSubtotalRow');
    var dr = document.getElementById('cartDiscountRow');
    if (sr) sr.style.display = 'none';
    if (dr) dr.style.display = 'none';
    return;
  }
  container.innerHTML = cart.map(function(item) {
    var key = item.lineKey || item.id;
    var keyEsc = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var vLabel = item.variantLabel ? '<div style="font-size:.75rem;color:#a78bfa;margin-top:2px">' + item.variantLabel + '</div>' : '';
    return '<div class="cart-item"><img src="' + (item.image || '') + '" alt="" onerror="this.src=\'https://via.placeholder.com/70\'">' +
      '<div class="cart-item-info"><h4>' + item.title + '</h4>' + vLabel + '<div class="price">' + formatPrice(item.price) + '</div>' +
      '<div class="cart-item-qty"><button type="button" onclick="changeQty(\'' + keyEsc + '\',-1)">−</button><span>' + item.qty + '</span>' +
      '<button type="button" onclick="changeQty(\'' + keyEsc + '\',1)">+</button>' +
      '<button type="button" onclick="removeFromCart(\'' + keyEsc + '\')" style="margin-right:auto;color:#f87171;border:none;background:none;cursor:pointer"><i class="fas fa-trash"></i></button></div></div></div>';
  }).join('');
  var subtotal = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  var coupon = getActiveCoupon();
  var discount = calcDiscount(subtotal, coupon);
  var total = Math.max(0, subtotal - discount);
  var totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(total);
  var sr = document.getElementById('cartSubtotalRow');
  var dr = document.getElementById('cartDiscountRow');
  var subEl = document.getElementById('cartSubtotal');
  var discEl = document.getElementById('cartDiscount');
  if (coupon && discount > 0) {
    if (sr) { sr.style.display = 'flex'; if (subEl) subEl.textContent = formatPrice(subtotal); }
    if (dr) { dr.style.display = 'flex'; if (discEl) discEl.textContent = '- ' + formatPrice(discount) + ' (' + coupon.code + ')'; }
  } else {
    if (sr) sr.style.display = 'none';
    if (dr) dr.style.display = 'none';
  }
}

function applyCouponCode() {
  var input = document.getElementById('couponInput');
  var msg = document.getElementById('couponMsg');
  var code = (input && input.value || '').trim().toUpperCase();
  if (!code) { if (msg) { msg.textContent = 'کد را وارد کنید'; msg.style.color = '#f87171'; } return; }
  var coupons = getData('coupons', typeof DEFAULT_COUPONS !== 'undefined' ? DEFAULT_COUPONS : []);
  var found = coupons.find(function(c) { return c.active && String(c.code).toUpperCase() === code; });
  if (!found) {
    setActiveCoupon(null);
    if (msg) { msg.textContent = 'کد تخفیف معتبر نیست'; msg.style.color = '#f87171'; }
    updateCartUI();
    return;
  }
  setActiveCoupon(found);
  if (msg) {
    msg.textContent = found.type === 'percent'
      ? ('تخفیف ' + found.value + '٪ اعمال شد')
      : ('تخفیف ' + formatPrice(found.value) + ' اعمال شد');
    msg.style.color = '#34d399';
  }
  updateCartUI();
}


function updateCustomerTicketBadge() {
  try {
    var sess = null;
    try { sess = JSON.parse(localStorage.getItem('dekori_customer_session') || 'null'); } catch(e) {}
    var tickets = getData('tickets', []);
    if (!Array.isArray(tickets)) tickets = [];
    var phone = sess && sess.phone ? String(sess.phone) : '';
    var sid = sess && sess.id ? String(sess.id) : '';
    var count = tickets.filter(function(t) {
      if (!t || t.status === 'closed') return false;
      var mine = false;
      if (sid && t.customerId === sid) mine = true;
      if (phone && (t.customerPhone === phone || t.contact === phone)) mine = true;
      if (!mine) return false;
      return t.unreadCustomer || (t.messages && t.messages.length && t.messages[t.messages.length-1].from === 'admin');
    }).length;
    ['headerTicketBadge', 'mobileTicketBadge', 'footerTicketBadge'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (count > 0) {
        el.style.display = id === 'headerTicketBadge' ? 'inline-flex' : 'inline';
        el.textContent = count > 99 ? '99+' : String(count);
      } else {
        el.style.display = 'none';
      }
    });
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function() {
  try { updateCustomerTicketBadge(); } catch(e) {}
  var btn = document.getElementById('applyCouponBtn');
  if (btn) btn.addEventListener('click', applyCouponCode);
  var input = document.getElementById('couponInput');
  if (input) input.addEventListener('keydown', function(e) { if (e.key === 'Enter') applyCouponCode(); });
});


function changeQty(lineKey, delta) {
  var cart = getData('cart', []);
  var item = cart.find(function(c) { return (c.lineKey || c.id) === lineKey; });
  if (!item) return;
  if (delta > 0) {
    var products = getData('products', DEFAULT_PRODUCTS);
    var p = products.find(function(x) { return x.id === item.id; });
    var stock = p ? (p.stock || 0) : 0;
    if (item.qty + delta > stock) {
      showToast('موجودی کافی نیست (حداکثر ' + stock + ' عدد)');
      return;
    }
  }
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(function(c) { return (c.lineKey || c.id) !== lineKey; });
  setData('cart', cart);
  updateCartUI();
}

function removeFromCart(lineKey) {
  setData('cart', getData('cart', []).filter(function(c) { return (c.lineKey || c.id) !== lineKey; }));
  updateCartUI();
}

function updateStats() {
  var products = getData('products', DEFAULT_PRODUCTS);
  var sellers = getData('sellers', DEFAULT_SELLERS);
  var elP = document.getElementById('statProducts');
  var elS = document.getElementById('statSellers');
  if (elP) elP.textContent = (products.length || 0).toLocaleString('fa-IR');
  if (elS) elS.textContent = sellers.filter(function(s) { return s.active; }).length.toLocaleString('fa-IR');
}

function setupEventListeners() {
  // filter buttons are bound inside renderFilters()

  // Mobile menu
  function openMobileNav() {
    var nav = document.getElementById('mobileNav');
    var ov = document.getElementById('mobileNavOverlay');
    if (nav) nav.classList.add('open');
    if (ov) ov.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    var nav = document.getElementById('mobileNav');
    var ov = document.getElementById('mobileNavOverlay');
    if (nav) nav.classList.remove('open');
    if (ov) ov.classList.remove('active');
    document.body.style.overflow = '';
  }
  var mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) mobileBtn.addEventListener('click', openMobileNav);
  var closeMob = document.getElementById('closeMobileNav');
  if (closeMob) closeMob.addEventListener('click', closeMobileNav);
  var mobOv = document.getElementById('mobileNavOverlay');
  if (mobOv) mobOv.addEventListener('click', closeMobileNav);
  document.querySelectorAll('#mobileNav .mobile-nav-links a').forEach(function(a) {
    a.addEventListener('click', closeMobileNav);
  });

  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', function() {
    var s = document.getElementById('cartSidebar');
    var o = document.getElementById('overlay');
    if (s) s.classList.add('open');
    if (o) o.classList.add('active');
  });
  var closeCartBtn = document.getElementById('closeCart');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  var overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', closeCart);
  var closeModal = document.getElementById('closeProductModal');
  if (closeModal) closeModal.addEventListener('click', closeProductModal);
  var productModal = document.getElementById('productModal');
  if (productModal) productModal.addEventListener('click', function(e) {
    if (e.target.id === 'productModal') closeProductModal();
  });
  var searchBtn = document.getElementById('searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', function() {
    var ov = document.getElementById('searchOverlay');
    if (ov) ov.classList.add('active');
    var inp = document.getElementById('searchInput');
    if (inp) inp.focus();
  });
  var closeSearch = document.getElementById('closeSearch');
  if (closeSearch) closeSearch.addEventListener('click', function() {
    var ov = document.getElementById('searchOverlay');
    if (ov) ov.classList.remove('active');
  });
  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', function(e) {
    var q = e.target.value.trim().toLowerCase();
    _currentSearchQuery = q;
    _productsDisplayLimit = 10;
    renderProducts('keep');
  });
  var checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) checkoutBtn.addEventListener('click', function() {
    startCheckout();
  });

  // Auth modal
  var authBtn = document.getElementById('customerAuthBtn');
  if (authBtn) authBtn.addEventListener('click', function(e) {
    e.preventDefault();
    var sess = getCustomerSession();
    if (sess) {
      if (confirm('خروج از حساب ' + (sess.name || sess.phone) + '؟')) {
        localStorage.removeItem('dekori_customer_session');
        updateCustomerUI();
      }
      return;
    }
    openAuthModal();
  });
  var mobAuth = document.getElementById('mobileCustomerAuth');
  if (mobAuth) mobAuth.addEventListener('click', function(e) {
    e.preventDefault();
    var sess = getCustomerSession();
    if (sess) {
      if (confirm('خروج؟')) { localStorage.removeItem('dekori_customer_session'); updateCustomerUI(); }
      return;
    }
    openAuthModal();
  });
  var closeAuth = document.getElementById('closeAuthModal');
  if (closeAuth) closeAuth.addEventListener('click', function() {
    var m = document.getElementById('authModal');
    if (m) m.classList.remove('active');
  });
  var tabLogin = document.getElementById('authTabLogin');
  var tabReg = document.getElementById('authTabRegister');
  if (tabLogin) tabLogin.addEventListener('click', function() {
    tabLogin.classList.add('active'); if (tabReg) tabReg.classList.remove('active');
    document.getElementById('authLoginPanel').style.display = 'block';
    document.getElementById('authRegisterPanel').style.display = 'none';
  });
  if (tabReg) tabReg.addEventListener('click', function() {
    tabReg.classList.add('active'); if (tabLogin) tabLogin.classList.remove('active');
    document.getElementById('authLoginPanel').style.display = 'none';
    document.getElementById('authRegisterPanel').style.display = 'block';
  });
  var doLogin = document.getElementById('doLoginBtn');
  if (doLogin) doLogin.addEventListener('click', customerLogin);
  var doReg = document.getElementById('doRegisterBtn');
  if (doReg) doReg.addEventListener('click', customerRegister);

  var closeCo = document.getElementById('closeCheckoutModal');
  if (closeCo) closeCo.addEventListener('click', function() {
    var m = document.getElementById('checkoutModal');
    if (m) m.classList.remove('active');
  });
  var placeBtn = document.getElementById('placeOrderBtn');
  if (placeBtn) placeBtn.addEventListener('click', placeOrder);
  var locBtn = document.getElementById('coUseLocation');
  if (locBtn) locBtn.addEventListener('click', function() {
    if (!navigator.geolocation) { alert('مرورگر شما از موقعیت پشتیبانی نمی‌کند'); return; }
    navigator.geolocation.getCurrentPosition(function(pos) {
      document.getElementById('coLat').value = pos.coords.latitude.toFixed(6);
      document.getElementById('coLng').value = pos.coords.longitude.toFixed(6);
    }, function() { alert('دسترسی به موقعیت داده نشد'); });
  });

  updateCustomerUI();
}

function getCustomerSession() {
  try { return JSON.parse(localStorage.getItem('dekori_customer_session') || 'null'); } catch(e) { return null; }
}

function updateCustomerUI() {
  var sess = getCustomerSession();
  var label = document.getElementById('customerAuthLabel');
  var ordersLink = document.getElementById('ordersLink');
  var mobAuth = document.getElementById('mobileCustomerAuth');
  if (sess) {
    if (label) label.textContent = sess.name || sess.phone || 'حساب من';
    if (ordersLink) ordersLink.style.display = '';
    if (mobAuth) mobAuth.textContent = 'خروج (' + (sess.name || '') + ')';
  } else {
    if (label) label.textContent = 'ورود خریدار';
    if (ordersLink) ordersLink.style.display = 'none';
    if (mobAuth) mobAuth.textContent = 'ورود / ثبت‌نام خریدار';
  }
}

function openAuthModal() {
  var m = document.getElementById('authModal');
  if (m) m.classList.add('active');
}

function customerRegister() {
  var name = (document.getElementById('regName').value || '').trim();
  var phone = (document.getElementById('regPhone').value || '').trim();
  var email = (document.getElementById('regEmail').value || '').trim();
  var pass = (document.getElementById('regPass').value || '').trim();
  if (!name || !phone || !pass) { alert('نام، موبایل و رمز الزامی است'); return; }
  var customers = getData('customers', []);
  if (customers.some(function(c) { return c.phone === phone; })) {
    alert('این شماره قبلاً ثبت شده — وارد شوید'); return;
  }
  var cust = {
    id: 'cu' + Date.now().toString(36),
    name: name, phone: phone, email: email, password: pass,
    addresses: [], createdAt: Date.now()
  };
  customers.push(cust);
  setData('customers', customers);
  localStorage.setItem('dekori_customer_session', JSON.stringify({ id: cust.id, name: cust.name, phone: cust.phone }));
  document.getElementById('authModal').classList.remove('active');
  updateCustomerUI();
  showToast('ثبت‌نام موفق — خوش آمدید ' + name);
}

function customerLogin() {
  var phone = (document.getElementById('loginPhone').value || '').trim();
  var pass = (document.getElementById('loginPass').value || '').trim();
  if (!phone || !pass) { alert('موبایل و رمز را وارد کنید'); return; }
  var customers = getData('customers', []);
  var cust = customers.find(function(c) { return c.phone === phone && c.password === pass; });
  if (!cust) { alert('شماره یا رمز اشتباه است'); return; }
  localStorage.setItem('dekori_customer_session', JSON.stringify({ id: cust.id, name: cust.name, phone: cust.phone }));
  document.getElementById('authModal').classList.remove('active');
  updateCustomerUI();
  showToast('ورود موفق');
}

function renderPaymentMethods() {
  var payments = getData('payments', typeof DEFAULT_PAYMENT_GATEWAYS !== 'undefined' ? DEFAULT_PAYMENT_GATEWAYS : []);
  var active = payments.filter(function(g) { return g && g.active; });
  var box = document.getElementById('paymentMethodsBox');
  var ctc = document.getElementById('cardToCardInfo');
  if (!box) return;
  if (!active.length) {
    // fallback: enable cardtocard display if configured
    var c = payments.find(function(g) { return g.id === 'cardtocard'; });
    if (c && (c.cardNumber || c.cardOwner)) {
      active = [Object.assign({}, c, { active: true })];
    } else {
      active = [{ id: 'cod', name: 'پرداخت در محل (COD)', active: true }];
    }
  }
  box.innerHTML = active.map(function(g, i) {
    return '<label class="shipping-option">' +
      '<input type="radio" name="paymentMethod" value="' + g.id + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="shipping-option-body"><strong>' + (g.name || g.id) + '</strong>' +
      (g.id === 'cardtocard' ? '<span>واریز به کارت و تأیید توسط مدیریت</span>' : '<span>روش پرداخت</span>') +
      '</span></label>';
  }).join('');

  function updateCtc() {
    var sel = document.querySelector('input[name="paymentMethod"]:checked');
    var id = sel ? sel.value : '';
    var g = payments.find(function(x) { return x.id === id; }) || {};
    if (ctc) {
      if (id === 'cardtocard') {
        ctc.style.display = 'block';
        var n = document.getElementById('ctcCardNumber');
        var o = document.getElementById('ctcCardOwner');
        if (n) n.textContent = g.cardNumber || '—';
        if (o) o.textContent = g.cardOwner || '—';
      } else {
        ctc.style.display = 'none';
      }
    }
  }
  box.querySelectorAll('input[name="paymentMethod"]').forEach(function(r) {
    r.onchange = updateCtc;
  });
  updateCtc();
}

function getShippingSettings() {
  var s = getData('settings', DEFAULT_SETTINGS);
  return {
    daysMin: s.deliveryDaysMin != null ? s.deliveryDaysMin : 7,
    daysMax: s.deliveryDaysMax != null ? s.deliveryDaysMax : 15,
    nearLabel: s.shipNearLabel || 'اطراف فروشگاه',
    nearCost: s.shipNearCost != null ? s.shipNearCost : 200000,
    farLabel: s.shipFarLabel || 'مناطق دورتر',
    farCost: s.shipFarCost != null ? s.shipFarCost : 300000
  };
}

function renderShippingOptions() {
  var ship = getShippingSettings();
  var note = document.getElementById('checkoutDeliveryNote');
  if (note) note.textContent = 'ارسال طی ' + toFaDigits(ship.daysMin) + ' تا ' + toFaDigits(ship.daysMax) + ' روز کاری انجام می‌شود.';

  var prevChecked = (document.querySelector('input[name="shippingZone"]:checked') || {}).value || 'near';
  var box = document.getElementById('shippingOptionsBox');
  if (box) {
    box.innerHTML =
      '<label class="shipping-option">' +
        '<input type="radio" name="shippingZone" value="near"' + (prevChecked === 'near' ? ' checked' : '') + '>' +
        '<span class="shipping-option-body"><strong>' + ship.nearLabel + '</strong>' +
        '<span>هزینه ارسال: ' + formatPrice(ship.nearCost) + '</span></span>' +
      '</label>' +
      '<label class="shipping-option">' +
        '<input type="radio" name="shippingZone" value="far"' + (prevChecked === 'far' ? ' checked' : '') + '>' +
        '<span class="shipping-option-body"><strong>' + ship.farLabel + '</strong>' +
        '<span>هزینه ارسال: ' + formatPrice(ship.farCost) + '</span></span>' +
      '</label>';
    box.querySelectorAll('input[name="shippingZone"]').forEach(function(r) {
      r.onchange = updateCheckoutSummary;
    });
  }
}

function toFaDigits(n) {
  var map = { '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹' };
  return String(n).replace(/[0-9]/g, function(d) { return map[d]; });
}

function startCheckout() {
  var cart = getData('cart', []);
  if (!cart || !cart.length) { alert('سبد خرید خالی است'); return; }
  var sess = getCustomerSession();
  if (!sess) {
    alert('برای خرید باید وارد شوید یا ثبت‌نام کنید');
    openAuthModal();
    return;
  }
  closeCart();
  renderPaymentMethods();
  renderShippingOptions();
  // fill form
  var customers = getData('customers', []);
  var cust = customers.find(function(c) { return c.id === sess.id; }) || {};
  document.getElementById('coName').value = cust.name || sess.name || '';
  document.getElementById('coPhone').value = cust.phone || sess.phone || '';
  var addrs = cust.addresses || [];
  var sa = document.getElementById('savedAddresses');
  if (addrs.length) {
    sa.innerHTML = '<div style="font-size:.85rem;color:var(--text-muted);margin-bottom:8px">آدرس‌های ذخیره‌شده:</div>' +
      addrs.map(function(a, i) {
        return '<button type="button" class="btn btn-outline btn-sm" style="margin:0 0 8px 8px" data-addr="' + i + '">' +
          (a.title || a.city || 'آدرس') + ': ' + (a.address || '').slice(0, 40) + '</button>';
      }).join('');
    sa.querySelectorAll('[data-addr]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var a = addrs[parseInt(btn.getAttribute('data-addr'), 10)];
        if (!a) return;
        document.getElementById('coName').value = a.receiver || cust.name || '';
        document.getElementById('coPhone').value = a.phone || cust.phone || '';
        document.getElementById('coProvince').value = a.province || '';
        document.getElementById('coCity').value = a.city || '';
        document.getElementById('coAddress').value = a.address || '';
        document.getElementById('coPostal').value = a.postal || '';
        document.getElementById('coLat').value = a.lat || '';
        document.getElementById('coLng').value = a.lng || '';
      });
    });
  } else sa.innerHTML = '';

  var total = 0;
  cart.forEach(function(it) { total += (it.price || 0) * (it.qty || 1); });
  window._checkoutSubtotal = total;
  updateCheckoutSummary();

  document.querySelectorAll('input[name="shippingZone"]').forEach(function(r) {
    r.onchange = updateCheckoutSummary;
  });

  document.getElementById('checkoutModal').classList.add('active');
}

function getShippingCost() {
  var ship = getShippingSettings();
  var selected = document.querySelector('input[name="shippingZone"]:checked');
  var zone = selected ? selected.value : 'near';
  return zone === 'far' ? ship.farCost : ship.nearCost;
}

function updateCheckoutSummary() {
  var ship = getShippingSettings();
  var total = window._checkoutSubtotal || 0;
  var disc = window._dekoriCouponDiscount || 0;
  var shipping = getShippingCost();
  var final = Math.max(0, total - disc) + shipping;
  var zone = (document.querySelector('input[name="shippingZone"]:checked') || {}).value || 'near';
  var zoneLabel = zone === 'far' ? ship.farLabel : ship.nearLabel;
  var el = document.getElementById('checkoutSummary');
  if (!el) return;
  el.innerHTML =
    '<div>جمع سبد: <strong>' + formatPrice(total) + '</strong></div>' +
    (disc ? '<div style="color:#34d399">تخفیف: ' + formatPrice(disc) + '</div>' : '') +
    '<div>هزینه ارسال (' + zoneLabel + '): <strong>' + formatPrice(shipping) + '</strong></div>' +
    '<div style="margin-top:6px;font-size:1.05rem">مبلغ قابل پرداخت: <strong style="color:#c4b5fd">' + formatPrice(final) + '</strong></div>' +
    '<div style="margin-top:8px;font-size:.85rem;color:#a78bfa"><i class="fas fa-clock"></i> ارسال طی ' + toFaDigits(ship.daysMin) + ' تا ' + toFaDigits(ship.daysMax) + ' روز کاری</div>';
}

function placeOrder() {
  var sess = getCustomerSession();
  if (!sess) { alert('لطفاً وارد شوید'); openAuthModal(); return; }
  var name = (document.getElementById('coName').value || '').trim();
  var phone = (document.getElementById('coPhone').value || '').trim();
  var province = (document.getElementById('coProvince').value || '').trim();
  var city = (document.getElementById('coCity').value || '').trim();
  var address = (document.getElementById('coAddress').value || '').trim();
  var postal = (document.getElementById('coPostal').value || '').trim();
  var lat = (document.getElementById('coLat').value || '').trim();
  var lng = (document.getElementById('coLng').value || '').trim();
  if (!name || !phone || !province || !city || !address) {
    alert('نام، موبایل، استان، شهر و آدرس الزامی است'); return;
  }
  var cart = getData('cart', []);
  if (!cart.length) { alert('سبد خالی است'); return; }

  var products = getData('products', DEFAULT_PRODUCTS);
  // final stock check (stock may have changed since items were added to cart)
  for (var ci = 0; ci < cart.length; ci++) {
    var cp = products.find(function(x) { return x.id === cart[ci].id; });
    var avail = cp ? (cp.stock || 0) : 0;
    if ((cart[ci].qty || 0) > avail) {
      alert('موجودی «' + cart[ci].title + '» کافی نیست (موجودی فعلی: ' + avail + ' عدد). لطفاً تعداد را در سبد خرید اصلاح کنید.');
      return;
    }
  }

  var subtotal = 0;
  cart.forEach(function(it) { subtotal += (it.price || 0) * (it.qty || 1); });
  var disc = window._dekoriCouponDiscount || 0;
  var shippingZone = (document.querySelector('input[name="shippingZone"]:checked') || {}).value || 'near';
  var shipShip = getShippingSettings();
  var shipping = shippingZone === 'far' ? shipShip.farCost : shipShip.nearCost;
  var total = Math.max(0, subtotal - disc) + shipping;

  var sellerIds = {};
  var items = cart.map(function(it) {
    var p = products.find(function(x) { return x.id === it.id; });
    if (p && p.sellerId) sellerIds[p.sellerId] = true;
    return { id: it.id, title: it.title, price: it.price, qty: it.qty, image: it.image, sellerId: p ? p.sellerId : null };
  });

  var paySel = document.querySelector('input[name="paymentMethod"]:checked');
  var paymentMethod = paySel ? paySel.value : 'cod';
  var payments = getData('payments', []);
  var payGate = payments.find(function(x) { return x.id === paymentMethod; }) || {};
  var paymentStatus = (paymentMethod === 'cardtocard') ? 'awaiting_payment' : (paymentMethod === 'cod' ? 'cod' : 'pending');

  var order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    customerId: sess.id,
    customerName: name,
    customerPhone: phone,
    items: items,
    address: { receiver: name, phone: phone, province: province, city: city, address: address, postal: postal, lat: lat, lng: lng },
    status: paymentMethod === 'cardtocard' ? 'awaiting_payment' : 'pending',
    paymentMethod: paymentMethod,
    paymentStatus: paymentStatus,
    paymentCardNumber: payGate.cardNumber || '',
    paymentCardOwner: payGate.cardOwner || '',
    statusHistory: [{ status: paymentMethod === 'cardtocard' ? 'awaiting_payment' : 'pending', at: Date.now(), note: paymentMethod === 'cardtocard' ? 'در انتظار واریز کارت به کارت' : 'سفارش ثبت شد' }],
    subtotal: subtotal,
    shipping: shipping,
    shippingZone: shippingZone,
    total: total,
    discount: disc,
    sellerIds: Object.keys(sellerIds),
    createdAt: Date.now()
  };

  var orders = getData('orders', []);
  orders.unshift(order);
  setData('orders', orders);

  // decrement stock for purchased items
  cart.forEach(function(it) {
    var p = products.find(function(x) { return x.id === it.id; });
    if (p) p.stock = Math.max(0, (p.stock || 0) - (it.qty || 1));
  });
  setData('products', products);
  if (typeof renderProducts === 'function') try { renderProducts('keep'); } catch(e) {}

  // save address
  if (document.getElementById('coSaveAddr').checked) {
    var customers = getData('customers', []);
    var cust = customers.find(function(c) { return c.id === sess.id; });
    if (cust) {
      if (!Array.isArray(cust.addresses)) cust.addresses = [];
      cust.addresses.unshift({
        title: city || 'آدرس',
        receiver: name, phone: phone, province: province, city: city,
        address: address, postal: postal, lat: lat, lng: lng
      });
      if (cust.addresses.length > 5) cust.addresses = cust.addresses.slice(0, 5);
      setData('customers', customers);
    }
  }

  // clear cart
  setData('cart', []);
  window._dekoriCouponDiscount = 0;
  updateCartUI();
  document.getElementById('checkoutModal').classList.remove('active');

  if (window._dekoriOrderSound) playOrderSound();

  var msg = 'سفارش شما با شماره ' + order.id + ' ثبت شد.\nنام: ' + name + '\nموبایل: ' + phone;
  if (paymentMethod === 'cardtocard') {
    msg += '\n\nلطفاً مبلغ ' + formatPrice(total) + ' را به کارت زیر واریز کنید:\n' +
      (payGate.cardNumber || '—') + '\nبه نام: ' + (payGate.cardOwner || '—') +
      '\n\nپس از واریز، مدیریت پرداخت را تأیید می‌کند.';
  } else {
    var msgShip = getShippingSettings();
    msg += '\nارسال طی ' + toFaDigits(msgShip.daysMin) + ' تا ' + toFaDigits(msgShip.daysMax) + ' روز کاری انجام می‌شود.';
  }
  msg += '\nاز بخش «پیگیری سفارش» می‌توانید وضعیت را ببینید.';
  alert(msg);
  if (typeof showToast === 'function') showToast('سفارش ثبت شد: ' + order.id);
}

function closeCart() {
  var s = document.getElementById('cartSidebar');
  var o = document.getElementById('overlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('active');
}

function showToast(msg) {
  var t = document.getElementById('dekori-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'dekori-toast';
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(80px);background:#1a1a28;color:#fff;padding:14px 28px;border-radius:50px;border:1px solid #3d3d55;z-index:9999;font-weight:600;transition:transform .35s;display:flex;align-items:center;gap:10px';
    document.body.appendChild(t);
  }
  t.innerHTML = '<i class="fas fa-check-circle" style="color:#34d399"></i> ' + msg;
  t.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(function() { t.style.transform = 'translateX(-50%) translateY(80px)'; }, 2500);
}

function fireConfetti() {
  var colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#34d399', '#3b82f6'];
  for (var i = 0; i < 36; i++) {
    var p = document.createElement('div');
    p.style.cssText = 'position:fixed;width:8px;height:8px;border-radius:50%;background:' + colors[i % colors.length] + ';left:50%;top:45%;z-index:10001;pointer-events:none';
    document.body.appendChild(p);
    var angle = Math.random() * Math.PI * 2;
    var dist = 60 + Math.random() * 160;
    var dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist - 80;
    p.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: 0 }
    ], { duration: 700 + Math.random() * 500, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function(el) { el.remove(); }, 1400, p);
  }
}

/* ---- Plugins ---- */
function runPlugins() {
  var plugins = getData('plugins', DEFAULT_PLUGINS);
  if (!Array.isArray(plugins)) return;
  plugins.forEach(function(p) {
    if (!p || !p.enabled) return;
    try {
      switch (p.id) {
        case 'whatsapp': injectWhatsApp(p.settings); break;
        case 'telegram': injectTelegram(p.settings); break;
        case 'instagram': injectInstagram(p.settings); break;
        case 'announcement': injectAnnouncement(p.settings); break;
        case 'backtotop': injectBackToTop(); break;
        case 'toast': window._dekoriToast = true; break;
        case 'productbadge': window._dekoriLowStock = (p.settings && p.settings.threshold) || 3; break;
        case 'smoothscroll': document.documentElement.style.scrollBehavior = 'smooth'; break;
        case 'darkglow': addStyle('.product-card:hover{box-shadow:0 0 40px rgba(124,58,237,.3)!important;border-color:rgba(167,139,250,.5)!important}'); break;
        case 'particles': injectParticles(); break;
        case 'snow': injectSnow(); break;
        case 'exitintent': injectExitIntent(p.settings); break;
        case 'cursorglow': injectCursorGlow(); break;
        case 'typerhero': injectTyperHero(); break;
        case 'confetti': window._dekoriConfetti = true; break;
        case 'marquee': injectMarquee(p.settings); break;
        case 'ripple': injectRipple(); break;
        case 'parallax': injectParallax(); break;
        case 'progressbar': injectProgressBar(); break;
        case 'productshine': addStyle('.product-img{overflow:hidden}.product-img::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transition:left .5s}.product-card:hover .product-img::after{left:120%}'); break;
        case 'stickyfilter': injectStickyFilter(); break;
        case 'countdown': injectCountdown(p.settings); break;
        case 'sharebtn': window._dekoriShareBtn = true; break;
        case 'voicesearch': injectVoiceSearch(); break;
        case 'themetoggle': injectThemeToggle(); break;
        case 'ordersound': window._dekoriOrderSound = true; break;
        case 'neonborder': addStyle('.product-card:has(.product-badge){box-shadow:0 0 0 1px #a78bfa,0 0 20px rgba(167,139,250,.2)}'); break;
        case 'nightmode': document.documentElement.style.setProperty('--bg','#050508'); document.body.style.background='#050508'; break;
        case 'slidein': injectSlideIn(); break;
        case 'cartbounce': window._dekoriCartBounce = true; break;
        case 'sparkle': addStyle('.product-card:has(.product-badge) .product-img::before{content:"✦";position:absolute;top:8px;left:8px;color:#fbbf24;z-index:2}'); break;
        case 'pulsebtn': addStyle('.btn-primary{animation:pulseBtn 2s infinite}@keyframes pulseBtn{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4)}50%{box-shadow:0 0 0 12px rgba(124,58,237,0)}}'); break;
        case 'hover3d': addStyle('.product-card{transition:transform .3s}.product-card:hover{transform:perspective(600px) rotateY(-4deg) translateY(-8px)}'); break;
        case 'imgzoom': addStyle('.product-img img{transition:transform .4s}.product-card:hover .product-img img{transform:scale(1.12)}'); break;
        case 'glassmorphism': addStyle('.product-card,.category-card{background:rgba(26,26,40,.55)!important;backdrop-filter:blur(12px)}'); break;
        case 'btnglow': addStyle('.btn-primary{box-shadow:0 0 24px rgba(139,92,246,.5)!important}'); break;
        case 'rainbowtext': addStyle('#heroTitle{background:linear-gradient(90deg,#a78bfa,#ec4899,#f59e0b,#34d399,#a78bfa)!important;background-size:200%!important;-webkit-background-clip:text!important;animation:rain 4s linear infinite}@keyframes rain{to{background-position:200%}}'); break;
        case 'occasiontheme': injectOccasionTheme(p.settings); break;
        case 'spinwheel': injectSpinWheel(p.settings); break;
        case 'wishlist': window._dekoriWishlist = true; addWishlistHearts(p.settings); break;
        case 'progressbar': break; // already handled
        default: break;
      }
    } catch (err) { console.warn('plugin', p.id, err); }
  });
}

function addStyle(css) {
  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}

function injectWhatsApp(s) {
  if (document.getElementById('wa-float')) return;
  var num = ((s && s.number) || '989121234567').replace(/\D/g, '');
  var a = document.createElement('a');
  a.id = 'wa-float';
  a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent((s && s.message) || 'سلام');
  a.target = '_blank'; a.rel = 'noopener';
  a.innerHTML = '<i class="fab fa-whatsapp"></i>';
  a.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:999;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 20px rgba(37,211,102,.4);text-decoration:none';
  document.body.appendChild(a);
}

function injectTelegram(s) {
  if (document.getElementById('tg-float')) return;
  var a = document.createElement('a');
  a.id = 'tg-float';
  a.href = 'https://t.me/' + ((s && s.username) || 'dekori_support');
  a.target = '_blank';
  a.innerHTML = '<i class="fab fa-telegram"></i>';
  a.style.cssText = 'position:fixed;bottom:90px;left:24px;z-index:999;width:48px;height:48px;border-radius:50%;background:#229ED9;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;text-decoration:none';
  document.body.appendChild(a);
}

function injectInstagram(s) {
  if (document.getElementById('ig-float')) return;
  var a = document.createElement('a');
  a.id = 'ig-float';
  a.href = 'https://instagram.com/' + ((s && s.username) || 'dekori.online');
  a.target = '_blank';
  a.innerHTML = '<i class="fab fa-instagram"></i>';
  a.style.cssText = 'position:fixed;bottom:148px;left:24px;z-index:999;width:48px;height:48px;border-radius:50%;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;text-decoration:none';
  document.body.appendChild(a);
}

function injectAnnouncement(s) {
  if (document.getElementById('announce-bar')) return;
  var bar = document.createElement('div');
  bar.id = 'announce-bar';
  bar.textContent = (s && s.text) || 'پیشنهاد ویژه';
  bar.style.cssText = 'background:' + ((s && s.bg) || '#7c3aed') + ';color:#fff;text-align:center;padding:10px;font-weight:600;font-size:.9rem;z-index:1001;position:relative';
  var header = document.querySelector('.header');
  if (header) document.body.insertBefore(bar, header);
}

function injectBackToTop() {
  if (document.getElementById('back-top')) return;
  var btn = document.createElement('button');
  btn.id = 'back-top';
  btn.type = 'button';
  btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:998;width:48px;height:48px;border-radius:50%;border:none;background:var(--primary,#7c3aed);color:#fff;cursor:pointer;display:none;align-items:center;justify-content:center;font-size:1.1rem';
  btn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.addEventListener('scroll', function() {
    btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });
  document.body.appendChild(btn);
}

function injectParticles() {
  if (document.getElementById('p-style')) return;
  addStyle('.hero-bg::after{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(167,139,250,.3) 1.5px,transparent 1.5px);background-size:48px 48px;animation:pm 20s linear infinite;opacity:.4}@keyframes pm{to{background-position:48px 48px}}');
  document.getElementById && null;
  var styles = document.head.querySelectorAll('style');
  if (styles.length) styles[styles.length - 1].id = 'p-style';
}

function injectSnow() {
  addStyle('@keyframes fall{to{transform:translateY(110vh);opacity:.2}}.snowflake{position:fixed;top:-10px;color:#fff;pointer-events:none;z-index:9998;animation:fall linear infinite}');
  for (var i = 0; i < 30; i++) {
    var f = document.createElement('div');
    f.className = 'snowflake';
    f.textContent = '❄';
    f.style.left = Math.random() * 100 + 'vw';
    f.style.animationDuration = (6 + Math.random() * 10) + 's';
    f.style.animationDelay = Math.random() * 5 + 's';
    f.style.fontSize = (0.5 + Math.random()) + 'rem';
    document.body.appendChild(f);
  }
}

function injectExitIntent(s) {
  var shown = false;
  document.addEventListener('mouseout', function(e) {
    if (shown || e.clientY > 20) return;
    shown = true;
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    ov.innerHTML = '<div style="background:#1a1a28;border:1px solid #333;border-radius:20px;padding:36px;max-width:380px;text-align:center"><h2>' + ((s && s.title) || 'صبر کن!') + '</h2><p style="color:#aaa;margin:12px 0">' + ((s && s.text) || '') + '</p>' +
      (s && s.code ? '<code style="color:#a78bfa;font-size:1.2rem">' + s.code + '</code><br>' : '') +
      '<button type="button" id="exClose" style="margin-top:16px;padding:10px 24px;border-radius:50px;border:none;background:#7c3aed;color:#fff;cursor:pointer;font-family:inherit">باشه</button></div>';
    document.body.appendChild(ov);
    document.getElementById('exClose').onclick = function() { ov.remove(); };
  });
}

function injectCursorGlow() {
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;width:180px;height:180px;border-radius:50%;pointer-events:none;z-index:9997;background:radial-gradient(circle,rgba(124,58,237,.12),transparent 70%);transform:translate(-50%,-50%)';
  document.body.appendChild(d);
  document.addEventListener('mousemove', function(e) {
    d.style.left = e.clientX + 'px';
    d.style.top = e.clientY + 'px';
  });
}

function injectTyperHero() {
  var el = document.getElementById('heroTitle');
  if (!el) return;
  var text = el.textContent;
  el.textContent = '';
  var i = 0;
  function type() {
    if (i < text.length) { el.textContent += text.charAt(i++); setTimeout(type, 40); }
  }
  type();
}

function injectMarquee(s) {
  if (document.getElementById('mq')) return;
  var bar = document.createElement('div');
  bar.id = 'mq';
  var t = (s && s.text) || '✦ ارسال سریع ✦ ضمانت ✦ پشتیبانی ✦ ';
  bar.innerHTML = '<div style="display:inline-block;white-space:nowrap;animation:mq 18s linear infinite">' + t + t + t + '</div>';
  bar.style.cssText = 'background:linear-gradient(90deg,#7c3aed,#ec4899);padding:8px 0;overflow:hidden;color:#fff;font-size:.85rem;font-weight:600';
  addStyle('@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-33%)}}');
  var header = document.querySelector('.header');
  if (header) document.body.insertBefore(bar, header);
}

function injectRipple() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn, .add-cart-btn, .filter-btn');
    if (!btn) return;
    var r = document.createElement('span');
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    r.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:rgba(255,255,255,.25);left:' + (e.clientX - rect.left - size / 2) + 'px;top:' + (e.clientY - rect.top - size / 2) + 'px;pointer-events:none;animation:rip .5s ease-out forwards';
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(r);
    setTimeout(function() { r.remove(); }, 500);
  });
  addStyle('@keyframes rip{to{transform:scale(2.5);opacity:0}}');
}

function injectParallax() {
  var bg = document.querySelector('.hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', function() {
    bg.style.transform = 'translateY(' + (window.scrollY * 0.25) + 'px)';
  });
}

function injectProgressBar() {
  if (document.getElementById('prog')) return;
  var bar = document.createElement('div');
  bar.id = 'prog';
  bar.style.cssText = 'position:fixed;top:0;right:0;height:3px;background:linear-gradient(90deg,#8b5cf6,#ec4899);z-index:10000;width:0';
  document.body.appendChild(bar);
  window.addEventListener('scroll', function() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + '%';
  });
}

function injectStickyFilter() {
  var f = document.querySelector('.filters');
  if (f) f.style.cssText += ';position:sticky;top:70px;z-index:50;background:rgba(9,9,15,.92);backdrop-filter:blur(10px);padding:10px 0;border-radius:12px';
}

function injectCountdown(s) {
  if (document.getElementById('cd-bar')) return;
  var end = new Date((s && s.endDate) || (Date.now() + 24 * 3600 * 1000)).getTime();
  var bar = document.createElement('div');
  bar.id = 'cd-bar';
  bar.style.cssText = 'background:' + ((s && s.bg) || '#111827') + ';color:#fff;text-align:center;padding:10px;font-weight:700;font-size:.9rem;position:relative;z-index:1001';
  var header = document.querySelector('.header');
  if (header) document.body.insertBefore(bar, header); else document.body.insertBefore(bar, document.body.firstChild);
  function tick() {
    var diff = end - Date.now();
    if (diff <= 0) { bar.remove(); clearInterval(timer); return; }
    var d = Math.floor(diff / 86400000), h = Math.floor(diff % 86400000 / 3600000),
        m = Math.floor(diff % 3600000 / 60000), sec = Math.floor(diff % 60000 / 1000);
    bar.innerHTML = '<i class="fas fa-bolt"></i> ' + ((s && s.text) || 'فروش ویژه به پایان می‌رسد:') + ' ' +
      '<span style="font-variant-numeric:tabular-nums">' + (d > 0 ? d + ' روز ' : '') +
      String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + '</span>';
  }
  tick();
  var timer = setInterval(tick, 1000);
}

function injectVoiceSearch() {
  var box = document.querySelector('.search-box');
  if (!box || document.getElementById('voiceSearchBtn')) return;
  var btn = document.createElement('button');
  btn.id = 'voiceSearchBtn';
  btn.type = 'button';
  btn.title = 'جستجوی صوتی';
  btn.innerHTML = '<i class="fas fa-microphone"></i>';
  btn.style.cssText = 'background:var(--primary);color:#fff;border:none;width:40px;height:40px;min-width:40px;border-radius:50%;cursor:pointer;margin-inline-start:8px;flex-shrink:0;font-size:1rem';
  var closeBtn = document.getElementById('closeSearch');
  if (closeBtn && closeBtn.parentNode) closeBtn.parentNode.insertBefore(btn, closeBtn);
  else box.appendChild(btn);
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  btn.addEventListener('click', function() {
    if (!SR) { alert('مرورگر شما از جستجوی صوتی پشتیبانی نمی‌کند'); return; }
    var rec = new SR();
    rec.lang = 'fa-IR';
    btn.style.background = '#ef4444';
    rec.onresult = function(e) {
      var text = e.results[0][0].transcript;
      var inp = document.getElementById('searchInput');
      if (inp) { inp.value = text; inp.dispatchEvent(new Event('input')); }
    };
    rec.onend = function() { btn.style.background = 'var(--primary)'; };
    rec.onerror = function() { btn.style.background = 'var(--primary)'; };
    try { rec.start(); } catch (e) { btn.style.background = 'var(--primary)'; }
  });
}

function injectThemeToggle() {
  if (document.getElementById('theme-toggle-btn')) return;
  var LIGHT = { '--bg': '#f7f6fb', '--bg-card': '#ffffff', '--bg-hover': '#f0eefc', '--text': '#1a1a24', '--text-muted': '#5c5c70', '--border': '#e3e1ee', '--shadow': '0 10px 40px rgba(0,0,0,0.08)' };
  var DARK = { '--bg': '#0f0f13', '--bg-card': '#1a1a24', '--bg-hover': '#242433', '--text': '#f1f1f4', '--text-muted': '#a1a1b5', '--border': '#2e2e3e', '--shadow': '0 10px 40px rgba(0,0,0,0.4)' };
  var btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.title = 'تغییر تم';
  btn.style.cssText = 'position:fixed;bottom:24px;left:88px;z-index:999;width:44px;height:44px;border-radius:50%;background:var(--bg-card);color:var(--text);border:1px solid var(--border);cursor:pointer;box-shadow:var(--shadow);font-size:1rem';
  document.body.appendChild(btn);
  function apply(mode) {
    var vars = mode === 'light' ? LIGHT : DARK;
    Object.keys(vars).forEach(function(k) { document.documentElement.style.setProperty(k, vars[k]); });
    try { localStorage.setItem('dekori_theme', mode); } catch (e) {}
    btn.innerHTML = mode === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  }
  btn.addEventListener('click', function() {
    var cur = (function() { try { return localStorage.getItem('dekori_theme'); } catch (e) { return null; } })() || 'dark';
    apply(cur === 'dark' ? 'light' : 'dark');
  });
  apply((function() { try { return localStorage.getItem('dekori_theme'); } catch (e) { return null; } })() || 'dark');
}

function playOrderSound() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach(function(freq, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      var t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.4);
    });
  } catch (e) {}
}

function injectSlideIn() {
  addStyle('.section{opacity:0;transform:translateY(30px);transition:opacity .6s,transform .6s}.section.visible{opacity:1;transform:none}');
  if (!window.IntersectionObserver) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section').forEach(function(s) { obs.observe(s); });
}

/* ==================================================================
   افزونه تم مناسبت‌های ویژه — پس‌زمینه و تزئینات سایت بر اساس تاریخ روز
   ================================================================== */
function getOccasion(mode, forced) {
  if (mode === 'manual') return (!forced || forced === 'none') ? null : forced;
  var now = new Date();
  var m = now.getMonth() + 1, d = now.getDate();
  if ((m === 3 && d >= 19) || (m === 4 && d <= 3)) return 'nowruz';     // نوروز و سیزده‌به‌در
  if (m === 12 && d >= 20 && d <= 22) return 'yalda';                  // شب یلدا
  if ((m === 10 && d >= 25) || (m === 11 && d === 1)) return 'halloween';
  if ((m === 12 && d >= 23) || (m === 1 && d <= 5)) return 'christmas'; // کریسمس و سال نو میلادی
  return null;
}

var OCCASION_THEMES = {
  nowruz: {
    barText: '🌸 عید نوروز پیروز باد! تخفیف ویژه بهاره فعال است 🌸',
    barBg: 'linear-gradient(90deg,#0f7a4b,#f4b400)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(15,122,75,.35), transparent 60%)',
    emojis: ['🌷', '🌱', '🐟', '🥚', '🌼'],
    badge: '🌷'
  },
  yalda: {
    barText: '🍉 شب یلدا مبارک! هدیه ویژه یلدایی منتظرتان است 🍉',
    barBg: 'linear-gradient(90deg,#5b1846,#c0392b)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(91,24,70,.4), transparent 60%)',
    emojis: ['🍉', '⭐', '🌙', '📖'],
    badge: '🌙'
  },
  halloween: {
    barText: '🎃 هالووین رسید! تخفیف ترسناک منتظر شماست 🎃',
    barBg: 'linear-gradient(90deg,#3d1466,#ff7518)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(61,20,102,.4), transparent 60%)',
    emojis: ['🎃', '👻', '🦇', '🕸️'],
    badge: '🎃'
  },
  christmas: {
    barText: '🎄 کریسمس و سال نو میلادی مبارک! جشن تخفیف شروع شد 🎄',
    barBg: 'linear-gradient(90deg,#0e5c34,#b3141b)',
    glow: 'radial-gradient(circle at 50% 0%, rgba(14,92,52,.4), transparent 60%)',
    emojis: ['🎄', '❄️', '🎁', '⭐'],
    badge: '🎄'
  }
};

function injectOccasionTheme(s) {
  s = s || {};
  var occ = getOccasion(s.mode, s.forceOccasion);
  if (!occ || !OCCASION_THEMES[occ]) return;
  var t = OCCASION_THEMES[occ];
  window._dekoriOccasion = occ;

  if (!document.getElementById('occasion-bar')) {
    var bar = document.createElement('div');
    bar.id = 'occasion-bar';
    bar.textContent = t.barText;
    bar.style.cssText = 'background:' + t.barBg + ';color:#fff;text-align:center;padding:10px;font-weight:700;font-size:.9rem;position:relative;z-index:1001';
    var header = document.querySelector('.header');
    if (header) document.body.insertBefore(bar, header);
    else document.body.insertBefore(bar, document.body.firstChild);
  }

  addStyle('.hero-bg::before{content:"";position:absolute;inset:0;background:' + t.glow + ';pointer-events:none;z-index:0}');

  var heroTitle = document.getElementById('heroTitle');
  if (heroTitle && !heroTitle.querySelector('.occasion-badge')) {
    var badgeEl = document.createElement('span');
    badgeEl.className = 'occasion-badge';
    badgeEl.textContent = ' ' + t.badge;
    heroTitle.appendChild(badgeEl);
  }

  if (s.intensity !== 'subtle') injectFallingEmoji(t.emojis, 24);
}

function injectFallingEmoji(emojis, count) {
  if (document.getElementById('occasion-fall-style')) return;
  var style = document.createElement('style');
  style.id = 'occasion-fall-style';
  style.textContent = '@keyframes occasionFall{to{transform:translateY(110vh) rotate(360deg);opacity:.15}}' +
    '.occasion-flake{position:fixed;top:-40px;pointer-events:none;z-index:9998;animation:occasionFall linear infinite}';
  document.head.appendChild(style);
  for (var i = 0; i < count; i++) {
    var f = document.createElement('div');
    f.className = 'occasion-flake';
    f.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    f.style.left = Math.random() * 100 + 'vw';
    f.style.fontSize = (0.8 + Math.random() * 1) + 'rem';
    f.style.animationDuration = (8 + Math.random() * 10) + 's';
    f.style.animationDelay = Math.random() * 8 + 's';
    document.body.appendChild(f);
  }
}

/* ==================================================================
   افزونه چرخ شانس تخفیف
   ================================================================== */
function parseSpinPrizes(raw) {
  var lines = String(raw || '').split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
  return lines.map(function(l) {
    var parts = l.split('|');
    return { label: (parts[0] || 'پوچ').trim(), code: (parts[1] || '').trim(), color: (parts[2] || '#7c3aed').trim() };
  });
}

function injectSpinWheel(s) {
  s = s || {};
  if (document.getElementById('spin-btn')) return;
  var btn = document.createElement('button');
  btn.id = 'spin-btn';
  btn.type = 'button';
  btn.title = 'چرخ شانس تخفیف';
  btn.innerHTML = '<i class="fas fa-dharmachakra"></i>';
  btn.style.cssText = 'position:fixed;bottom:24px;right:160px;z-index:999;width:52px;height:52px;border-radius:50%;border:none;background:linear-gradient(135deg,#f59e0b,#ec4899);color:#fff;cursor:pointer;font-size:1.3rem;box-shadow:0 4px 20px rgba(236,72,153,.4);animation:spinPulse 2.4s infinite';
  addStyle('@keyframes spinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}');
  document.body.appendChild(btn);

  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'spinWheelModal';
  modal.innerHTML =
    '<div class="modal-content" style="max-width:420px;padding:28px;text-align:center">' +
      '<button type="button" class="modal-close" id="closeSpinModal"><i class="fas fa-times"></i></button>' +
      '<h2 style="margin-bottom:16px">🎡 چرخ شانس تخفیف</h2>' +
      '<div id="spinWheelBody"></div>' +
    '</div>';
  document.body.appendChild(modal);

  btn.addEventListener('click', function() {
    renderSpinWheelBody(s);
    modal.classList.add('active');
  });
  document.getElementById('closeSpinModal').addEventListener('click', function() { modal.classList.remove('active'); });
  modal.addEventListener('click', function(e) { if (e.target.id === 'spinWheelModal') modal.classList.remove('active'); });
}

function renderSpinWheelBody(s) {
  var body = document.getElementById('spinWheelBody');
  if (!body) return;
  var prizes = parseSpinPrizes(s.prizes);
  if (!prizes.length) { body.innerHTML = '<p style="color:#8b8ba0">فعلاً جایزه‌ای تعریف نشده.</p>'; return; }

  var cooldown = (s.cooldownHours || 24) * 3600 * 1000;
  var last = parseInt(localStorage.getItem('dekori_spin_last') || '0', 10);
  var remain = cooldown - (Date.now() - last);
  if (remain > 0) {
    var hrs = Math.max(1, Math.ceil(remain / 3600000));
    body.innerHTML = '<p style="color:#a1a1b5;line-height:1.9">امروز شانستو امتحان کردی! 🎡<br>حدود <strong>' + hrs.toLocaleString('fa-IR') + ' ساعت</strong> دیگه دوباره سر بزن.</p>';
    return;
  }

  var n = prizes.length;
  var slice = 360 / n;
  var gradParts = prizes.map(function(p, i) { return p.color + ' ' + (i * slice) + 'deg ' + ((i + 1) * slice) + 'deg'; });
  var labelsHTML = prizes.map(function(p, i) {
    var mid = i * slice + slice / 2;
    return '<span style="position:absolute;top:50%;left:50%;width:90px;text-align:center;font-size:.66rem;color:#fff;font-weight:700;line-height:1.2;transform:rotate(' + mid + 'deg) translate(0,-92px) rotate(' + (-mid) + 'deg);transform-origin:0 0">' + p.label + '</span>';
  }).join('');

  body.innerHTML =
    '<div style="position:relative;width:240px;height:240px;margin:0 auto 20px">' +
      '<div id="spinWheelDial" style="width:240px;height:240px;border-radius:50%;position:relative;border:4px solid #1a1a28;box-shadow:0 0 0 4px rgba(124,58,237,.3);transition:transform 3.6s cubic-bezier(.15,.9,.25,1);background:conic-gradient(' + gradParts.join(',') + ')">' +
        labelsHTML +
      '</div>' +
      '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);font-size:1.6rem;color:#f59e0b">▼</div>' +
    '</div>' +
    '<button type="button" class="btn btn-primary" id="doSpinBtn" style="min-width:160px">بچرخان!</button>' +
    '<div id="spinResult" style="margin-top:16px"></div>';

  document.getElementById('doSpinBtn').addEventListener('click', function() {
    var spinBtnEl = this;
    spinBtnEl.disabled = true;
    var idx = Math.floor(Math.random() * n);
    var dial = document.getElementById('spinWheelDial');
    var targetMid = idx * slice + slice / 2;
    var rotateTo = (5 * 360) + (360 - targetMid);
    dial.style.transform = 'rotate(' + rotateTo + 'deg)';
    localStorage.setItem('dekori_spin_last', String(Date.now()));
    setTimeout(function() {
      var prize = prizes[idx];
      var resBox = document.getElementById('spinResult');
      if (prize.code) {
        if (typeof fireConfetti === 'function') fireConfetti();
        resBox.innerHTML =
          '<p style="color:#34d399;font-weight:700;margin-bottom:8px">🎉 تبریک! ' + prize.label + '</p>' +
          '<div style="display:flex;gap:8px;justify-content:center;align-items:center">' +
          '<code style="background:#0c0c12;padding:8px 14px;border-radius:8px;color:#a78bfa;font-size:1.05rem;letter-spacing:1px">' + prize.code + '</code>' +
          '<button type="button" class="btn btn-outline" id="copySpinCode" style="padding:8px 12px"><i class="fas fa-copy"></i></button></div>' +
          '<p style="color:#8b8ba0;font-size:.8rem;margin-top:8px">این کد را هنگام تسویه حساب وارد کن</p>';
        var copyBtn = document.getElementById('copySpinCode');
        if (copyBtn) copyBtn.addEventListener('click', function() {
          if (navigator.clipboard) navigator.clipboard.writeText(prize.code);
          copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        });
      } else {
        resBox.innerHTML = '<p style="color:#a1a1b5">😅 پوچ! فردا دوباره شانستو امتحان کن.</p>';
      }
    }, 3700);
  });
}

/* ==================================================================
   افزونه لیست علاقه‌مندی‌ها
   ================================================================== */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('dekori_wishlist') || '[]'); } catch (e) { return []; }
}
function setWishlist(arr) {
  try { localStorage.setItem('dekori_wishlist', JSON.stringify(arr)); } catch (e) {}
}
function toggleWishlist(id) {
  var list = getWishlist();
  var idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1); else list.push(id);
  setWishlist(list);
  updateWishlistBadge();
  return list.indexOf(id) >= 0;
}
function updateWishlistBadge() {
  var badge = document.getElementById('wishlist-badge');
  if (!badge) return;
  var n = getWishlist().length;
  badge.textContent = n > 0 ? n.toLocaleString('fa-IR') : '';
  badge.style.display = n > 0 ? 'flex' : 'none';
}

function ensureWishlistUI(color) {
  if (document.getElementById('wishlist-fab')) { updateWishlistBadge(); return; }
  var fab = document.createElement('button');
  fab.id = 'wishlist-fab';
  fab.type = 'button';
  fab.title = 'علاقه‌مندی‌ها';
  fab.innerHTML = '<i class="fas fa-heart"></i><span id="wishlist-badge"></span>';
  fab.style.cssText = 'position:fixed;bottom:90px;right:24px;z-index:999;width:48px;height:48px;border-radius:50%;border:none;background:' + color + ';color:#fff;cursor:pointer;font-size:1.1rem;box-shadow:0 4px 16px rgba(239,68,68,.4)';
  document.body.appendChild(fab);
  addStyle('#wishlist-badge{position:absolute;top:-4px;left:-4px;background:#1a1a28;border:2px solid var(--bg,#0f0f13);color:#fff;font-size:.65rem;min-width:18px;height:18px;border-radius:9px;display:none;align-items:center;justify-content:center;padding:0 4px}');

  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'wishlistModal';
  modal.innerHTML =
    '<div class="modal-content" style="max-width:640px;padding:24px">' +
      '<button type="button" class="modal-close" id="closeWishlistModal"><i class="fas fa-times"></i></button>' +
      '<h2 style="margin-bottom:16px"><i class="fas fa-heart" style="color:' + color + '"></i> علاقه‌مندی‌های من</h2>' +
      '<div id="wishlistGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px"></div>' +
    '</div>';
  document.body.appendChild(modal);

  fab.addEventListener('click', function() {
    renderWishlistModal();
    modal.classList.add('active');
  });
  document.getElementById('closeWishlistModal').addEventListener('click', function() { modal.classList.remove('active'); });
  modal.addEventListener('click', function(e) { if (e.target.id === 'wishlistModal') modal.classList.remove('active'); });
  updateWishlistBadge();
}

function renderWishlistModal() {
  var grid = document.getElementById('wishlistGrid');
  if (!grid) return;
  var ids = getWishlist();
  var products = getData('products', DEFAULT_PRODUCTS);
  var items = products.filter(function(p) { return ids.indexOf(p.id) >= 0; });
  if (!items.length) {
    grid.innerHTML = '<p style="color:#8b8ba0;grid-column:1/-1;text-align:center;padding:20px 0">هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌ای 💭</p>';
    return;
  }
  grid.innerHTML = items.map(function(p) {
    var img = p.image || 'https://via.placeholder.com/200x200?text=Product';
    return '<div style="background:var(--bg-card,#1a1a24);border:1px solid var(--border,#2e2e3e);border-radius:12px;overflow:hidden;cursor:pointer" data-id="' + p.id + '" class="wishlist-item">' +
      '<img src="' + img + '" style="width:100%;height:110px;object-fit:cover" alt="">' +
      '<div style="padding:10px"><div style="font-size:.85rem;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (p.title || '') + '</div>' +
      '<div style="color:#a78bfa;font-size:.8rem">' + formatPrice(p.price || 0) + '</div></div></div>';
  }).join('');
  grid.querySelectorAll('.wishlist-item').forEach(function(el) {
    el.addEventListener('click', function() {
      document.getElementById('wishlistModal').classList.remove('active');
      if (typeof openProductModal === 'function') openProductModal(el.getAttribute('data-id'));
    });
  });
}

function addWishlistHearts(s) {
  s = s || {};
  var color = s.color || '#ef4444';
  ensureWishlistUI(color);
  var wishlist = getWishlist();
  document.querySelectorAll('#productsGrid .product-card').forEach(function(card) {
    var id = card.getAttribute('data-id');
    if (!id || card.querySelector('.wishlist-heart')) return;
    var img = card.querySelector('.product-img');
    if (!img) return;
    var isSaved = wishlist.indexOf(id) >= 0;
    var heart = document.createElement('button');
    heart.type = 'button';
    heart.className = 'wishlist-heart' + (isSaved ? ' active' : '');
    heart.innerHTML = '<i class="' + (isSaved ? 'fas' : 'far') + ' fa-heart"></i>';
    heart.style.cssText = 'position:absolute;top:8px;left:8px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(10,10,16,.55);color:' + (isSaved ? color : '#fff') + ';cursor:pointer;z-index:5;display:flex;align-items:center;justify-content:center;font-size:.95rem;backdrop-filter:blur(4px)';
    heart.addEventListener('click', function(e) {
      e.stopPropagation();
      var active = toggleWishlist(id);
      heart.classList.toggle('active', active);
      heart.style.color = active ? color : '#fff';
      heart.innerHTML = '<i class="' + (active ? 'fas' : 'far') + ' fa-heart"></i>';
    });
    if (!img.style.position) img.style.position = 'relative';
    img.appendChild(heart);
  });
}

// Re-apply wishlist hearts whenever the product grid re-renders (filter, search, load more)
(function() {
  var origRenderProducts = renderProducts;
  renderProducts = function(filter) {
    origRenderProducts(filter);
    if (window._dekoriWishlist) {
      var plugins = getData('plugins', []);
      var wp = plugins.find(function(x) { return x.id === 'wishlist' && x.enabled; });
      addWishlistHearts(wp && wp.settings);
    }
  };
})();

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.closeProductModal = closeProductModal;

// Contact plugins using site settings
(function() {
  var orig = runPlugins;
  runPlugins = function() {
    orig();
    var plugins = getData('plugins', []);
    var site = getData('settings', DEFAULT_SETTINGS);
    plugins.forEach(function(p) {
      if (!p.enabled) return;
      try {
        if (p.id === 'contactfloat' || p.id === 'quickcall') {
          if (document.getElementById('call-float')) return;
          var phone = (site.contactPhone || '').replace(/\D/g, '');
          if (!phone) return;
          var a = document.createElement('a');
          a.id = 'call-float';
          a.href = 'tel:' + phone;
          a.innerHTML = '<i class="fas fa-phone"></i>';
          a.style.cssText = 'position:fixed;bottom:220px;left:24px;z-index:999;width:48px;height:48px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;text-decoration:none;box-shadow:0 4px 16px rgba(16,185,129,.4)';
          document.body.appendChild(a);
        }
        if (p.id === 'emailfloat') {
          if (document.getElementById('email-float')) return;
          var email = site.contactEmail || '';
          if (!email) return;
          var a = document.createElement('a');
          a.id = 'email-float';
          a.href = 'mailto:' + email;
          a.innerHTML = '<i class="fas fa-envelope"></i>';
          a.style.cssText = 'position:fixed;bottom:280px;left:24px;z-index:999;width:48px;height:48px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;text-decoration:none';
          document.body.appendChild(a);
        }
        if (p.id === 'maplink' && site.contactAddress) {
          // enhance contact section if exists
        }
      } catch (e) {}
    });
  };
})();

// AI Assistant widget
(function setupAI() {
  function injectAIAssistant() {
    var plugins = getData('plugins', []);
    var p = plugins.find(function(x) { return x.id === 'aiassistant' && x.enabled; });
    if (!p || document.getElementById('ai-chat-btn')) return;
    var s = p.settings || {};
    if (!s.apiKey) {
      // still show button but warn on click
    }

    var btn = document.createElement('button');
    btn.id = 'ai-chat-btn';
    btn.type = 'button';
    btn.innerHTML = '<i class="fas fa-robot"></i>';
    btn.title = 'دستیار هوشمند';
    btn.style.cssText = 'position:fixed;bottom:24px;right:90px;z-index:999;width:52px;height:52px;border-radius:50%;border:none;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;cursor:pointer;font-size:1.3rem;box-shadow:0 4px 20px rgba(139,92,246,.4)';
    document.body.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'ai-chat-panel';
    panel.style.cssText = 'display:none;position:fixed;bottom:90px;right:24px;z-index:1000;width:340px;max-width:calc(100vw - 32px);height:420px;background:#16161f;border:1px solid #333;border-radius:16px;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.5);overflow:hidden';
    panel.innerHTML =
      '<div style="padding:14px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);display:flex;justify-content:space-between;align-items:center">' +
      '<strong style="color:#fff"><i class="fas fa-robot"></i> دستیار هوشمند</strong>' +
      '<button type="button" id="ai-close" style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem"><i class="fas fa-times"></i></button></div>' +
      '<div id="ai-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px"></div>' +
      '<div style="padding:10px;border-top:1px solid #333;display:flex;gap:8px">' +
      '<input type="text" id="ai-input" placeholder="سوالت رو بنویس..." style="flex:1;padding:10px 12px;border-radius:10px;border:1px solid #333;background:#0c0c12;color:#eee;font-family:inherit;outline:none">' +
      '<button type="button" id="ai-send" style="padding:10px 14px;border-radius:10px;border:none;background:#7c3aed;color:#fff;cursor:pointer"><i class="fas fa-paper-plane"></i></button></div>';
    document.body.appendChild(panel);

    function addMsg(text, who) {
      var box = document.getElementById('ai-messages');
      var m = document.createElement('div');
      m.style.cssText = 'max-width:85%;padding:10px 14px;border-radius:12px;font-size:.9rem;line-height:1.6;' +
        (who === 'user' ? 'align-self:flex-start;background:#7c3aed;color:#fff' : 'align-self:flex-end;background:#1e1e2e;color:#ddd;border:1px solid #333');
      m.textContent = text;
      box.appendChild(m);
      box.scrollTop = box.scrollHeight;
    }

    var welcome = s.welcome || 'سلام! چطور می‌تونم کمکت کنم؟';
    addMsg(welcome, 'bot');

    btn.onclick = function() {
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
      if (panel.style.display === 'flex') panel.style.display = 'flex';
    };
    document.getElementById('ai-close').onclick = function() { panel.style.display = 'none'; };

    async function send() {
      var input = document.getElementById('ai-input');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg(text, 'user');

      if (!s.apiKey) {
        addMsg('API Key تنظیم نشده. از پنل مدیریت → افزونه‌ها → دستیار هوش مصنوعی، کلید را وارد کنید.', 'bot');
        return;
      }

      addMsg('در حال فکر کردن...', 'bot');
      var msgs = document.getElementById('ai-messages');
      var thinking = msgs.lastChild;

      try {
        var base = (s.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
        var res = await fetch(base + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + s.apiKey
          },
          body: JSON.stringify({
            model: s.model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: s.systemPrompt || 'تو دستیار فروشگاه هستی.' },
              { role: 'user', content: text }
            ]
          })
        });
        var data = await res.json();
        if (thinking) thinking.remove();
        if (data.error) {
          addMsg('خطا: ' + (data.error.message || JSON.stringify(data.error)), 'bot');
        } else if (data.choices && data.choices[0] && data.choices[0].message) {
          addMsg(data.choices[0].message.content, 'bot');
        } else {
          addMsg('پاسخ نامعتبر از API', 'bot');
        }
      } catch (err) {
        if (thinking) thinking.remove();
        addMsg('خطا در ارتباط با API: ' + err.message, 'bot');
      }
    }

    document.getElementById('ai-send').onclick = send;
    document.getElementById('ai-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') send();
    });
  }

  var orig = runPlugins;
  runPlugins = function() {
    orig();
    try { injectAIAssistant(); } catch (e) { console.warn(e); }
  };
})();

/* ---- Reliable plugin runner with settings + custom plugins ---- */
(function() {
  function posStyle(s) {
    s = s || {};
    var pos = s.position || 'bottom-left';
    var x = (s.offsetX != null ? s.offsetX : 24) + 'px';
    var y = (s.offsetY != null ? s.offsetY : 24) + 'px';
    var css = 'position:fixed;z-index:999;';
    if (pos.indexOf('bottom') >= 0) css += 'bottom:' + y + ';';
    if (pos.indexOf('top') >= 0) css += 'top:' + y + ';';
    if (pos.indexOf('left') >= 0) css += 'left:' + x + ';';
    if (pos.indexOf('right') >= 0) css += 'right:' + x + ';';
    if (pos === 'bottom-center' || pos === 'top-center') css += 'left:50%;transform:translateX(-50%);';
    if (pos === 'center') css += 'left:50%;top:50%;transform:translate(-50%,-50%);';
    return css;
  }

  function floatBtn(id, href, iconHtml, s) {
    if (document.getElementById(id)) return;
    var a = document.createElement(href ? 'a' : 'button');
    a.id = id;
    if (href) { a.href = href; a.target = '_blank'; a.rel = 'noopener'; }
    else a.type = 'button';
    a.innerHTML = iconHtml;
    var size = (s && s.size) || 52;
    var color = (s && s.color) || '#7c3aed';
    a.style.cssText = posStyle(s) + 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:none;background:' + color + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:' + (size * 0.4) + 'px;text-decoration:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(a);
    return a;
  }

  function runCustomPlugin(p) {
    var s = p.settings || {};
    var t = s.customType || 'float-btn';
    if (t === 'float-btn') {
      floatBtn('cp-' + p.id, s.link || '#', '<i class="fas ' + (p.icon || 'fa-star') + '"></i>', s);
    } else if (t === 'top-bar') {
      if (document.getElementById('cp-bar-' + p.id)) return;
      var bar = document.createElement('div');
      bar.id = 'cp-bar-' + p.id;
      bar.textContent = s.text || p.name;
      bar.style.cssText = 'background:' + (s.color || '#7c3aed') + ';color:#fff;text-align:center;padding:10px;font-weight:600;font-size:.9rem;position:relative;z-index:1001';
      var header = document.querySelector('.header');
      if (header) document.body.insertBefore(bar, header);
      else document.body.insertBefore(bar, document.body.firstChild);
    } else if (t === 'custom-css' && s.code) {
      var st = document.createElement('style');
      st.textContent = s.code;
      document.head.appendChild(st);
    } else if (t === 'custom-js' && s.code) {
      try {
        var sc = document.createElement('script');
        sc.textContent = s.code;
        document.body.appendChild(sc);
      } catch (e) { console.warn(e); }
    }
  }

  var prevRun = runPlugins;
  runPlugins = function() {
    // clean previous dynamic floats? skip to avoid flicker
    try { prevRun(); } catch (e) { console.warn(e); }

    var plugins = getData('plugins', []);
    if (!Array.isArray(plugins)) return;

    plugins.forEach(function(p) {
      if (!p || !p.enabled) return;
      var s = p.settings || {};
      try {
        // Re-apply positions/colors for core floats if settings differ
        if (p.id === 'whatsapp') {
          var el = document.getElementById('wa-float');
          if (el && s.color) el.style.background = s.color;
          if (el && s.size) { el.style.width = s.size + 'px'; el.style.height = s.size + 'px'; }
          if (!el) {
            var num = (s.number || '989121234567').replace(/\D/g, '');
            floatBtn('wa-float', 'https://wa.me/' + num + '?text=' + encodeURIComponent(s.message || 'سلام'),
              '<i class="fab fa-whatsapp"></i>', Object.assign({ color: '#25D366', size: 56 }, s));
          }
        }
        if (p.id === 'backtotop') {
          var el = document.getElementById('back-top');
          if (el && s.color) el.style.background = s.color;
        }
        if (p.id === 'announcement' && s.text) {
          var bar = document.getElementById('announce-bar');
          if (bar) {
            bar.textContent = s.text;
            if (s.bg) bar.style.background = s.bg;
            if (s.textColor) bar.style.color = s.textColor;
          }
        }
        // Custom plugins
        if (String(p.id).indexOf('custom_') === 0) {
          runCustomPlugin(p);
        }
        // Generic CSS-effect plugins (glow_*, anim_*, etc.) - apply simple CSS if color/section set
        if (s.color && p.id.indexOf('glow_') === 0) {
          addStyle('.product-card:hover{box-shadow:0 0 30px ' + s.color + '66!important}');
        }
        if (s.color && p.id.indexOf('price_') === 0) {
          addStyle('.product-price{color:' + s.color + '!important}');
        }
        if (s.color && p.id.indexOf('btn_') === 0) {
          addStyle('.btn-primary{background:' + s.color + '!important}');
        }
      } catch (err) { console.warn('plugin', p.id, err); }
    });
  };
})();

// Re-apply theme after plugins inject elements
(function() {
  var orig = runPlugins;
  runPlugins = function() {
    orig();
    try { applySettings(); } catch(e) {}
  };
})();

// Live UI refresh when another browser/device updates shared data via Supabase
window.addEventListener('dekori:data-sync', function(e) {
  if (!e || !e.detail || !e.detail.key) return;
  var key = e.detail.key;
  try {
    if (key === 'products') {
      if (typeof renderProducts === 'function') renderProducts();
      if (typeof renderFilters === 'function') renderFilters();
    }
    if (key === 'categories' && typeof renderCategories === 'function') renderCategories();
    if (key === 'settings' && typeof applySettings === 'function') applySettings();
    if (key === 'tickets' && typeof updateCustomerTicketBadge === 'function') updateCustomerTicketBadge();
    if (key === 'reviews' && typeof renderProducts === 'function') renderProducts();
  } catch (err) {
    console.warn('app data-sync UI update error:', err);
  }
});

// دکوری آنلاین data v8 — curated plugin set + occasion themes, spin wheel, wishlist
const DEFAULT_SETTINGS = {"siteName": "دکوری آنلاین", "logo": "", "heroTitle": "دنیای دکوری‌ها و اکشن فیگورهای خاص", "heroSubtitle": "بهترین محصولات دکوری و اکشن فیگور از فروشندگان معتبر", "aboutTitle": "درباره دکوری آنلاین", "aboutText": "پلتفرم خرید و فروش محصولات دکوری، اکشن فیگور و مجسمه.", "contactEmail": "info@dekori.online", "contactPhone": "۰۹۱۲۱۲۳۴۵۶۷", "contactAddress": "تهران، ایران", "footerText": "فروشگاه تخصصی دکوری و اکشن فیگور", "primaryColor": "#7c3aed", "secondaryColor": "#f59e0b", "showHero": true, "showCategories": true, "showAbout": true, "showContact": true, "deliveryDaysMin": 7, "deliveryDaysMax": 15, "shipNearLabel": "اطراف فروشگاه", "shipNearCost": 200000, "shipFarLabel": "مناطق دورتر", "shipFarCost": 300000};
const DEFAULT_CUSTOM_CODE = { customCSS: '', customJS: '', customHeaderHTML: '', customFooterHTML: '' };
const DEFAULT_PAYMENT_GATEWAYS = [{"id": "zarinpal", "name": "زرین‌پال", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "idpay", "name": "آیدی‌پی (IDPay)", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "nextpay", "name": "نکست‌پی", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "vandar", "name": "وندار", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "zibal", "name": "زیبال", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "payping", "name": "پی‌پینگ", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "payir", "name": "پی‌ایر (Pay.ir)", "merchantId": "", "active": false, "icon": "fa-credit-card"}, {"id": "sadad", "name": "سداد", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "mellat", "name": "به‌پرداخت ملت", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "saman", "name": "سامان کیش", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "parsian", "name": "پارسیان", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "pasargad", "name": "پاسارگاد", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "sepehr", "name": "سپهر", "merchantId": "", "active": false, "icon": "fa-building-columns"}, {"id": "cardtocard", "name": "کارت به کارت", "merchantId": "", "cardNumber": "", "cardOwner": "", "active": false, "icon": "fa-money-bill-transfer"}, {"id": "cod", "name": "پرداخت در محل (COD)", "merchantId": "", "active": false, "icon": "fa-hand-holding-dollar"}];
const DEFAULT_PLUGINS = [{"id": "whatsapp", "name": "دکمه واتساپ", "desc": "دکمه شناور واتساپ. شماره، پیام، رنگ و موقعیت قابل تنظیم است.", "icon": "fa-brands fa-whatsapp", "enabled": true, "settings": {"number": "989121234567", "message": "سلام، سوال داشتم", "color": "#25D366", "position": "bottom-left", "offsetX": 24, "offsetY": 24, "size": 56}}, {"id": "telegram", "name": "دکمه تلگرام", "desc": "لینک شناور تلگرام با یوزرنیم، رنگ و جای دکمه.", "icon": "fa-brands fa-telegram", "enabled": false, "settings": {"username": "dekori_support", "color": "#229ED9", "position": "bottom-left", "offsetX": 24, "offsetY": 90, "size": 48}}, {"id": "instagram", "name": "دکمه اینستاگرام", "desc": "دکمه شناور اینستاگرام با یوزرنیم و موقعیت.", "icon": "fa-brands fa-instagram", "enabled": false, "settings": {"username": "dekori.online", "position": "bottom-left", "offsetX": 24, "offsetY": 148, "size": 48}}, {"id": "announcement", "name": "نوار اعلان", "desc": "بنر رنگی بالای سایت برای تخفیف یا خبر. متن، رنگ و محل نمایش.", "icon": "fa-bullhorn", "enabled": false, "settings": {"text": "🎉 ارسال رایگان بالای ۲ میلیون تومان", "bg": "#7c3aed", "textColor": "#ffffff", "section": "top", "speed": 0}}, {"id": "backtotop", "name": "بازگشت به بالا", "desc": "دکمه اسکرول به بالا. رنگ، اندازه و گوشه صفحه.", "icon": "fa-arrow-up", "enabled": true, "settings": {"color": "#7c3aed", "position": "bottom-right", "offsetX": 24, "offsetY": 24, "size": 48, "showAfter": 400}}, {"id": "productbadge", "name": "بج موجودی کم", "desc": "وقتی موجودی کم است بج نشان می‌دهد. آستانه و رنگ.", "icon": "fa-fire", "enabled": true, "settings": {"threshold": 3, "color": "#ef4444", "text": "تنها {n} عدد", "section": "products"}}, {"id": "reviews", "name": "نظرات محصول", "desc": "امکان ثبت نظر و امتیاز برای هر محصول. تایید خودکار یا دستی.", "icon": "fa-star", "enabled": true, "settings": {"autoApprove": true, "minStars": 1, "showOnCard": true}}, {"id": "toast", "name": "اعلان سبد خرید", "desc": "پیام هنگام افزودن به سبد. متن، رنگ، مدت نمایش و موقعیت.", "icon": "fa-bell", "enabled": true, "settings": {"text": "به سبد خرید اضافه شد", "bg": "#1a1a28", "duration": 2000, "position": "bottom-center"}}, {"id": "smoothscroll", "name": "اسکرول نرم", "desc": "اسکرول روان در کل صفحه.", "icon": "fa-water", "enabled": true, "settings": {"behavior": "smooth"}}, {"id": "darkglow", "name": "درخشش کارت‌ها", "desc": "نور رنگی دور کارت محصول در هاور. رنگ و شدت.", "icon": "fa-lightbulb", "enabled": true, "settings": {"color": "#7c3aed", "intensity": 0.3, "section": "products"}}, {"id": "particles", "name": "ذرات Hero", "desc": "نقاط متحرک در بخش قهرمان. رنگ، اندازه، سرعت.", "icon": "fa-sparkles", "enabled": true, "settings": {"color": "#a78bfa", "size": 1.5, "speed": 20, "section": "hero"}}, {"id": "snow", "name": "افکت برف", "desc": "دانه‌های برف. تعداد، سرعت، اندازه.", "icon": "fa-snowflake", "enabled": false, "settings": {"count": 30, "speed": 8, "size": 1, "color": "#ffffff"}}, {"id": "exitintent", "name": "پاپ‌آپ خروج", "desc": "وقتی موس از صفحه خارج می‌شود. عنوان، متن، کد تخفیف، رنگ.", "icon": "fa-door-open", "enabled": false, "settings": {"title": "صبر کن!", "text": "۱۰٪ تخفیف با کد WELCOME10", "code": "WELCOME10", "bg": "#1a1a28", "btnColor": "#7c3aed"}}, {"id": "cursorglow", "name": "رد نور موس", "desc": "دایره نورانی دنبال‌کننده موس. رنگ و اندازه.", "icon": "fa-mouse-pointer", "enabled": false, "settings": {"color": "#7c3aed", "size": 180, "opacity": 0.12}}, {"id": "typerhero", "name": "تایپ عنوان Hero", "desc": "انیمیشن تایپ عنوان. سرعت تایپ.", "icon": "fa-keyboard", "enabled": false, "settings": {"speed": 40, "section": "hero"}}, {"id": "confetti", "name": "کانفتی سبد", "desc": "انفجار رنگ وقتی به سبد اضافه می‌شود. تعداد و رنگ‌ها.", "icon": "fa-cake-candles", "enabled": true, "settings": {"count": 36, "colors": "#8b5cf6,#ec4899,#f59e0b,#34d399"}}, {"id": "marquee", "name": "متن متحرک", "desc": "نوار متن متحرک. متن، سرعت، رنگ پس‌زمینه.", "icon": "fa-text-width", "enabled": false, "settings": {"text": "✦ ارسال سریع ✦ ضمانت اصالت ✦ پشتیبانی ۲۴ ساعته ✦ ", "speed": 18, "bg": "#7c3aed", "textColor": "#fff", "section": "top"}}, {"id": "ripple", "name": "ریپل دکمه", "desc": "موج دایره‌ای روی کلیک. رنگ موج.", "icon": "fa-circle", "enabled": true, "settings": {"color": "rgba(255,255,255,0.25)"}}, {"id": "parallax", "name": "پارالاکس Hero", "desc": "حرکت پس‌زمینه با اسکرول. شدت.", "icon": "fa-layer-group", "enabled": false, "settings": {"intensity": 0.25, "section": "hero"}}, {"id": "progressbar", "name": "نوار پیشرفت اسکرول", "desc": "نوار بالای صفحه. رنگ و ضخامت.", "icon": "fa-bars-progress", "enabled": true, "settings": {"color": "#8b5cf6", "height": 3, "position": "top"}}, {"id": "productshine", "name": "درخشش عکس", "desc": "نوار نور روی عکس محصول.", "icon": "fa-sun", "enabled": true, "settings": {"section": "products", "speed": 0.5}}, {"id": "stickyfilter", "name": "فیلتر چسبان", "desc": "فیلتر هنگام اسکرول می‌چسبد.", "icon": "fa-thumbtack", "enabled": false, "settings": {"section": "products", "topOffset": 70}}, {"id": "neonborder", "name": "حاشیه نئون", "desc": "حاشیه نئونی محصولات ویژه. رنگ.", "icon": "fa-border-all", "enabled": false, "settings": {"color": "#a78bfa", "section": "products"}}, {"id": "nightmode", "name": "حالت شب عمیق", "desc": "تم خیلی تیره. رنگ پس‌زمینه.", "icon": "fa-moon", "enabled": false, "settings": {"bg": "#050508"}}, {"id": "slidein", "name": "ورود اسلایدی بخش‌ها", "desc": "بخش‌ها با اسکرول ظاهر می‌شوند.", "icon": "fa-arrows-left-right", "enabled": true, "settings": {"distance": 30, "duration": 0.6}}, {"id": "cartbounce", "name": "پرش آیکون سبد", "desc": "آیکون سبد هنگام افزودن می‌پرد.", "icon": "fa-cart-shopping", "enabled": true, "settings": {"scale": 1.25, "duration": 300}}, {"id": "contactfloat", "name": "تماس شناور", "desc": "دکمه تماس از شماره سایت. رنگ و موقعیت.", "icon": "fa-phone", "enabled": false, "settings": {"useSitePhone": true, "color": "#10b981", "position": "bottom-left", "offsetY": 220}}, {"id": "emailfloat", "name": "ایمیل شناور", "desc": "دکمه ایمیل از ایمیل سایت.", "icon": "fa-envelope", "enabled": false, "settings": {"useSiteEmail": true, "color": "#6366f1", "position": "bottom-left", "offsetY": 280}}, {"id": "aiassistant", "name": "دستیار هوش مصنوعی", "desc": "چت‌بات با API Key خودتان. مدل، پرامپت، رنگ ویجت.", "icon": "fa-robot", "enabled": false, "settings": {"provider": "openai", "apiKey": "", "model": "gpt-4o-mini", "baseUrl": "https://api.openai.com/v1", "systemPrompt": "تو دستیار فروشگاه دکوری آنلاین هستی.", "welcome": "سلام! چطور می‌تونم کمکت کنم؟", "position": "bottom-right", "btnColor": "#8b5cf6"}}, {"id": "aiproductdesc", "name": "تولید توضیح با AI", "desc": "تولید توضیح محصول با API.", "icon": "fa-wand-magic-sparkles", "enabled": false, "settings": {"provider": "openai", "apiKey": "", "model": "gpt-4o-mini", "baseUrl": "https://api.openai.com/v1"}}, {"id": "hover3d", "name": "افکت سه‌بعدی کارت", "desc": "کارت محصول با هاور موس کمی می‌چرخد و بالا می‌آید؛ حس عمق و لمسی می‌دهد.", "icon": "fa-cube", "enabled": true, "settings": {"section": "products"}}, {"id": "imgzoom", "name": "زوم عکس محصول", "desc": "عکس محصول روی هاور به‌آرامی بزرگ‌نمایی می‌شود.", "icon": "fa-magnifying-glass-plus", "enabled": true, "settings": {"section": "products"}}, {"id": "glassmorphism", "name": "افکت شیشه‌ای (Glassmorphism)", "desc": "پس‌زمینه کارت‌ها به شکل شیشه‌ی مات و بلور می‌شود؛ ظاهری مدرن و لوکس.", "icon": "fa-vector-square", "enabled": false, "settings": {"section": "cards"}}, {"id": "btnglow", "name": "درخشش دکمه اصلی", "desc": "دکمه‌های اصلی سایت (خرید، ثبت‌نام و ...) هاله نوری ملایم می‌گیرند.", "icon": "fa-wand-sparkles", "enabled": false, "settings": {"section": "buttons"}}, {"id": "pulsebtn", "name": "ضربان دکمه اصلی", "desc": "دکمه‌های اصلی به‌آرامی می‌تپند تا توجه کاربر را جلب کنند.", "icon": "fa-heart-pulse", "enabled": false, "settings": {"section": "buttons"}}, {"id": "sparkle", "name": "ستاره روی محصول ویژه", "desc": "روی محصولاتی که بج دارند یک ستاره‌ی کوچک طلایی نمایش داده می‌شود.", "icon": "fa-star", "enabled": false, "settings": {"section": "products"}}, {"id": "rainbowtext", "name": "عنوان رنگین‌کمانی Hero", "desc": "عنوان اصلی صفحه اول با گرادیان رنگی متحرک نمایش داده می‌شود.", "icon": "fa-rainbow", "enabled": false, "settings": {"section": "hero"}}, {"id": "countdown", "name": "شمارش معکوس فروش ویژه", "desc": "نوار بالای سایت با تایمر واقعی تا پایان یک تخفیف یا رویداد؛ تاریخ پایان و متن قابل تنظیم.", "icon": "fa-hourglass-half", "enabled": false, "settings": {"endDate": "", "text": "فروش ویژه به پایان می‌رسد:", "bg": "#111827"}}, {"id": "sharebtn", "name": "اشتراک‌گذاری محصول", "desc": "دکمه اشتراک‌گذاری در صفحه هر محصول؛ لینک را با اپ‌های گوشی به اشتراک می‌گذارد یا کپی می‌کند.", "icon": "fa-share-nodes", "enabled": true, "settings": {}}, {"id": "voicesearch", "name": "جستجوی صوتی", "desc": "دکمه میکروفون کنار جستجو؛ با صحبت کردن محصول مورد نظر را پیدا می‌کند (مرورگرهای پشتیبان).", "icon": "fa-microphone", "enabled": false, "settings": {}}, {"id": "themetoggle", "name": "تغییر تم روشن/تاریک", "desc": "دکمه شناور برای سوییچ بین حالت تاریک و روشن سایت؛ انتخاب کاربر ذخیره می‌شود.", "icon": "fa-circle-half-stroke", "enabled": true, "settings": {}}, {"id": "ordersound", "name": "صدای تایید سفارش", "desc": "یک ملودی کوتاه و دلنشین هنگام ثبت موفق سفارش پخش می‌شود.", "icon": "fa-music", "enabled": true, "settings": {}}, {"id": "occasiontheme", "name": "تم مناسبت‌های ویژه 🎉", "desc": "پس‌زمینه، نوار بالای سایت و افکت‌های ریزشی سایت بر اساس مناسبت روز خودکار عوض می‌شود: نوروز، شب یلدا، هالووین، کریسمس و سال نو میلادی. حالت خودکار یا انتخاب دستی برای تست.", "icon": "fa-gift", "enabled": true, "settings": {"mode": "auto", "forceOccasion": "", "intensity": "normal"}}, {"id": "spinwheel", "name": "چرخ شانس تخفیف 🎡", "desc": "دکمه شناور «چرخ شانس»؛ کاربر با یک چرخش شانسی، کد تخفیف واقعی (متصل به سیستم کدهای تخفیف) می‌برد. هر کاربر روزی یک‌بار می‌تواند بچرخاند.", "icon": "fa-dharmachakra", "enabled": false, "settings": {"cooldownHours": 24, "prizes": "۱۰٪ تخفیف|OFF10|#8b5cf6\n۲۰٪ تخفیف ویژه|WELCOME20|#ec4899\n۵۰,۰۰۰ تومان تخفیف|SAVE50K|#f59e0b\nپوچ، شانس بعدی!||#334155\nارسال رایگان بگیر!|FREESHIP|#34d399\nپوچ، شانس بعدی!||#334155"}}, {"id": "wishlist", "name": "لیست علاقه‌مندی‌ها ❤️", "desc": "دکمه قلب روی هر محصول برای ذخیره در علاقه‌مندی‌ها، به‌همراه دکمه شناور برای مشاهده لیست ذخیره‌شده‌ها. کاملاً کار می‌کند و روی مرورگر کاربر ذخیره می‌شود.", "icon": "fa-heart", "enabled": true, "settings": {"color": "#ef4444"}}];

const DEFAULT_COUPONS = [
  { id: 'c1', code: 'OFF10', type: 'percent', value: 10, active: true, maxUses: 0, used: 0 },
  { id: 'c2', code: 'WELCOME20', type: 'percent', value: 20, active: true, maxUses: 0, used: 0 },
  { id: 'c3', code: 'SAVE50K', type: 'fixed', value: 50000, active: true, maxUses: 0, used: 0 }
];

const DEFAULT_CATEGORIES = [
  { id: 'action-figure', name: 'اکشن فیگور', icon: 'fa-robot' },
  { id: 'decor', name: 'دکوری', icon: 'fa-home' },
  { id: 'statue', name: 'مجسمه', icon: 'fa-monument' },
  { id: 'other', name: 'سایر', icon: 'fa-gift' }
];
const DEFAULT_PRODUCTS = [];
const DEFAULT_SELLERS = [];
// ========== Supabase Config ==========
const SUPABASE_URL = 'https://uvzbstoiiapvnfehgmex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jzyJdFozoJDDu7IpTHo1gA_9xX5y_sR';

var supabaseClient = null;
var _dekoriWriteQueue = {};
var _dekoriWriteTimers = {};
var _dekoriRealtimeChannel = null;
var _dekoriRealtimeStarted = false;
var _dekoriPollTimer = null;
var _dekoriBooting = false;

try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
} catch (e) { console.warn('Supabase init error:', e); }

// اطلاعات زیر بین تمام دستگاه‌ها مشترک است.
// cart و نشست ورود عمداً فقط روی همان دستگاه می‌مانند.
var SHARED_KEYS = [
  'products', 'settings', 'categories', 'sellers', 'customCode',
  'coupons', 'tickets', 'pendingSellers', 'reviews', 'qa',
  'customers', 'orders', 'payments', 'plugins'
];
var LOCAL_ONLY_KEYS = ['cart', 'customer_session', 'seller'];

function _localKey(key) { return 'dekori_' + key; }
function _tsKey(key) { return 'dekori_ts_' + key; }
function _dirtyKey(key) { return 'dekori_dirty_' + key; }

function getData(key, defaultVal) {
  try {
    var raw = localStorage.getItem(_localKey(key));
    if (raw == null) return defaultVal;
    return JSON.parse(raw);
  } catch (e) { return defaultVal; }
}

function _setLocal(key, value) {
  localStorage.setItem(_localKey(key), JSON.stringify(value));
}
function _getLocalTs(key) {
  return parseInt(localStorage.getItem(_tsKey(key)) || '0', 10) || 0;
}
function _markDirty(key, yes) {
  if (yes) localStorage.setItem(_dirtyKey(key), '1');
  else localStorage.removeItem(_dirtyKey(key));
}
function _isDirty(key) { return localStorage.getItem(_dirtyKey(key)) === '1'; }

function _remotePayload(key, value, ts) {
  return { key: key, value: { __dekori_ts: Number(ts) || Date.now(), __dekori_val: value } };
}

function _unwrapRemote(rawValue) {
  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue) &&
      Object.prototype.hasOwnProperty.call(rawValue, '__dekori_ts') &&
      Object.prototype.hasOwnProperty.call(rawValue, '__dekori_val')) {
    return { ts: Number(rawValue.__dekori_ts) || 0, val: rawValue.__dekori_val };
  }
  // رکوردهای قدیمی بدون timestamp: سرور منبع اصلی است.
  return { ts: 0, val: rawValue };
}

function _writeRemote(key, value, ts, useKeepalive, attempt) {
  if (!supabaseClient || SHARED_KEYS.indexOf(key) === -1) return Promise.resolve(false);
  attempt = attempt || 1;
  var payload = _remotePayload(key, value, ts);

  return supabaseClient.from('app_data').upsert(payload, { onConflict: 'key' }).then(function(res) {
    if (res.error) {
      console.warn('Supabase save error [' + key + ']:', res.error.message);
      if (attempt < 5) {
        return new Promise(function(resolve) {
          setTimeout(function() { resolve(_writeRemote(key, value, ts, useKeepalive, attempt + 1)); }, attempt * 700);
        });
      }
      if (useKeepalive) _keepaliveWrite(payload);
      return false;
    }
    localStorage.setItem(_tsKey(key), String(ts));
    _markDirty(key, false);
    return true;
  }).catch(function(err) {
    console.warn('Supabase network error [' + key + ']:', err);
    if (attempt < 5) {
      return new Promise(function(resolve) {
        setTimeout(function() { resolve(_writeRemote(key, value, ts, useKeepalive, attempt + 1)); }, attempt * 700);
      });
    }
    if (useKeepalive) _keepaliveWrite(payload);
    return false;
  });
}

function _keepaliveWrite(payload) {
  try {
    fetch(SUPABASE_URL + '/rest/v1/app_data?on_conflict=key', {
      method: 'POST', keepalive: true,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(function(){});
  } catch (e) {}
}

function _queueRemoteWrite(key, value, ts) {
  if (!supabaseClient || SHARED_KEYS.indexOf(key) === -1) return Promise.resolve(false);
  _dekoriWriteQueue[key] = { value: value, ts: ts };
  clearTimeout(_dekoriWriteTimers[key]);
  return new Promise(function(resolve) {
    _dekoriWriteTimers[key] = setTimeout(function() {
      _flushRemoteWrite(key).then(resolve);
    }, 120);
  });
}

function _flushRemoteWrite(key) {
  var item = _dekoriWriteQueue[key];
  if (!item) return Promise.resolve(true);
  delete _dekoriWriteQueue[key];
  return _writeRemote(key, item.value, item.ts, true).then(function(ok) {
    var newer = _dekoriWriteQueue[key];
    if (newer && newer.ts > item.ts) return _flushRemoteWrite(key);
    return ok;
  });
}

function flushPendingWrites() {
  Object.keys(_dekoriWriteQueue).forEach(function(key) {
    var item = _dekoriWriteQueue[key];
    if (!item) return;
    delete _dekoriWriteQueue[key];
    _keepaliveWrite(_remotePayload(key, item.value, item.ts));
  });
}
window.addEventListener('pagehide', flushPendingWrites);
window.addEventListener('beforeunload', flushPendingWrites);
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') flushPendingWrites();
});
window.addEventListener('online', function() {
  Object.keys(_dekoriWriteQueue).forEach(function(key) { _flushRemoteWrite(key); });
});

// هر تغییر مشترک ابتدا محلی نمایش داده می‌شود و همزمان به سرور ارسال می‌شود.
// dirty flag باعث می‌شود یک تغییر ذخیره‌نشده با پاسخ قدیمی سرور جایگزین نشود.
function setData(key, value) {
  _setLocal(key, value);
  if (supabaseClient && SHARED_KEYS.indexOf(key) !== -1) {
    var ts = Date.now();
    localStorage.setItem(_tsKey(key), String(ts));
    _markDirty(key, true);
    _queueRemoteWrite(key, value, ts);
  }
}

function _applyRemoteRow(row, force) {
  if (!row || !row.key || row.value === undefined || row.value === null) return false;
  if (SHARED_KEYS.indexOf(row.key) === -1) return false;

  var remote = _unwrapRemote(row.value);
  var localTs = _getLocalTs(row.key);
  var dirty = _isDirty(row.key);

  // فقط تغییر واقعاً ذخیره‌نشده محلی از سرور قدیمی محافظت می‌شود.
  // در غیر این صورت سرور همیشه منبع اصلی بین دستگاه‌هاست.
  if (!force && dirty && localTs > remote.ts) return false;

  var newVal = JSON.stringify(remote.val);
  var oldVal = localStorage.getItem(_localKey(row.key));
  if (oldVal === newVal) {
    localStorage.setItem(_tsKey(row.key), String(remote.ts || 0));
    if (remote.ts >= localTs) _markDirty(row.key, false);
    return false;
  }

  _setLocal(row.key, remote.val);
  localStorage.setItem(_tsKey(row.key), String(remote.ts || Date.now()));
  _markDirty(row.key, false);

  try {
    window.dispatchEvent(new CustomEvent('dekori:data-sync', {
      detail: { key: row.key, value: remote.val }
    }));
  } catch (e) {}
  return true;
}

function loadFromSupabase(callback) {
  if (!supabaseClient) {
    console.warn('Supabase client is not available.');
    if (callback) callback(false, false);
    return;
  }

  supabaseClient.from('app_data').select('key,value').then(function(res) {
    if (res.error) {
      console.warn('Supabase load error:', res.error.message);
      if (callback) callback(false, false);
      return;
    }

    var rows = res.data || [];
    var remoteMap = {};
    rows.forEach(function(row) { if (row && row.key) remoteMap[row.key] = row; });
    var changed = false;

    // بسیار مهم: ابتدا داده‌های واقعی سرور را روی دستگاه اعمال می‌کنیم.
    SHARED_KEYS.forEach(function(key) {
      if (remoteMap[key]) {
        if (_applyRemoteRow(remoteMap[key], false)) changed = true;
      }
    });

    // فقط کلیدهایی که واقعاً در سرور وجود ندارند seed می‌شوند.
    // بنابراین یک گوشی تازه هیچ‌وقت داده پیش‌فرض خودش را روی گوشی‌های دیگر تحمیل نمی‌کند.
    var missing = SHARED_KEYS.filter(function(key) { return !remoteMap[key]; });
    if (missing.length) {
      var i = 0;
      function seedNext() {
        if (i >= missing.length) {
          if (callback) callback(true, changed);
          return;
        }
        var key = missing[i++];
        var val = getData(key, null);
        if (val === null) { seedNext(); return; }
        var ts = Date.now();
        _setLocal(key, val);
        localStorage.setItem(_tsKey(key), String(ts));
        _markDirty(key, true);
        _writeRemote(key, val, ts, true).then(function(){ seedNext(); });
      }
      seedNext();
      return;
    }

    if (callback) callback(true, changed);
  }).catch(function(err) {
    console.warn('Supabase network error:', err);
    if (callback) callback(false, false);
  });
}

function _refreshSharedKeyFromServer(key) {
  if (!supabaseClient || SHARED_KEYS.indexOf(key) === -1) return Promise.resolve(false);
  return supabaseClient.from('app_data').select('key,value').eq('key', key).maybeSingle().then(function(res) {
    if (res.error || !res.data) return false;
    return _applyRemoteRow(res.data, false);
  }).catch(function(){ return false; });
}

function startLiveSync() {
  if (!supabaseClient || _dekoriRealtimeStarted) return;
  _dekoriRealtimeStarted = true;

  try {
    _dekoriRealtimeChannel = supabaseClient.channel('dekori-app-data-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_data' }, function(payload) {
        if (payload.eventType !== 'DELETE') _applyRemoteRow(payload.new, false);
      })
      .subscribe(function(status) { console.log('Dekori live sync:', status); });
  } catch (e) { console.warn('Realtime unavailable:', e); }

  clearInterval(_dekoriPollTimer);
  _dekoriPollTimer = setInterval(function() {
    if (document.visibilityState === 'hidden' || !navigator.onLine) return;
    SHARED_KEYS.forEach(function(key) { _refreshSharedKeyFromServer(key); });
  }, 2500);
}

(function setupStorageSync() {
  if (window._dekoriStorageListener) return;
  window._dekoriStorageListener = true;
  window.addEventListener('storage', function(e) {
    if (!e.key || e.key.indexOf('dekori_') !== 0 || e.key.indexOf('dekori_ts_') === 0 || e.key.indexOf('dekori_dirty_') === 0) return;
    var key = e.key.replace(/^dekori_/, '');
    if (SHARED_KEYS.indexOf(key) === -1) return;
    try {
      window.dispatchEvent(new CustomEvent('dekori:data-sync', { detail: { key: key, value: e.newValue ? JSON.parse(e.newValue) : null } }));
    } catch (err) {}
  });
})();

function ensureDefaultsLocal() {
  if (!localStorage.getItem('dekori_products')) localStorage.setItem('dekori_products', JSON.stringify(DEFAULT_PRODUCTS));
  else {
    try { if (!Array.isArray(JSON.parse(localStorage.getItem('dekori_products')))) localStorage.setItem('dekori_products', JSON.stringify(DEFAULT_PRODUCTS)); }
    catch(e) { localStorage.setItem('dekori_products', JSON.stringify(DEFAULT_PRODUCTS)); }
  }
  if (!localStorage.getItem('dekori_settings')) localStorage.setItem('dekori_settings', JSON.stringify(DEFAULT_SETTINGS));
  if (!localStorage.getItem('dekori_categories')) localStorage.setItem('dekori_categories', JSON.stringify(DEFAULT_CATEGORIES));
  if (!localStorage.getItem('dekori_sellers')) localStorage.setItem('dekori_sellers', JSON.stringify(DEFAULT_SELLERS));
  if (!localStorage.getItem('dekori_customCode')) localStorage.setItem('dekori_customCode', JSON.stringify(DEFAULT_CUSTOM_CODE));
  if (!localStorage.getItem('dekori_cart')) localStorage.setItem('dekori_cart', JSON.stringify([]));
  if (!localStorage.getItem('dekori_coupons')) localStorage.setItem('dekori_coupons', JSON.stringify(DEFAULT_COUPONS));
  if (!localStorage.getItem('dekori_tickets')) localStorage.setItem('dekori_tickets', JSON.stringify([]));
  if (!localStorage.getItem('dekori_pendingSellers')) localStorage.setItem('dekori_pendingSellers', JSON.stringify([]));
  if (!localStorage.getItem('dekori_reviews')) localStorage.setItem('dekori_reviews', JSON.stringify([]));
  if (!localStorage.getItem('dekori_qa')) localStorage.setItem('dekori_qa', JSON.stringify([]));
  if (!localStorage.getItem('dekori_customers')) localStorage.setItem('dekori_customers', JSON.stringify([]));
  if (!localStorage.getItem('dekori_orders')) localStorage.setItem('dekori_orders', JSON.stringify([]));
  if (!localStorage.getItem('dekori_payments')) localStorage.setItem('dekori_payments', JSON.stringify(DEFAULT_PAYMENT_GATEWAYS));
  if (!localStorage.getItem('dekori_plugins')) localStorage.setItem('dekori_plugins', JSON.stringify(DEFAULT_PLUGINS));
}

function pushAllToSupabase() {
  if (!supabaseClient) return Promise.resolve(false);
  var keys = SHARED_KEYS.slice();
  var results = {};
  var i = 0;
  function next() {
    if (i >= keys.length) return Promise.resolve(results);
    var key = keys[i++], val = getData(key, null);
    if (val === null) return next();
    var ts = Date.now();
    _markDirty(key, true);
    return _writeRemote(key, val, ts, true).then(function(ok) {
      results[key] = ok;
      return new Promise(function(resolve){ setTimeout(function(){ resolve(next()); }, 100); });
    });
  }
  return next();
}

window.dekoriSyncNow = function() {
  return Promise.all(Object.keys(_dekoriWriteQueue).map(function(key){ return _flushRemoteWrite(key); })).then(function(){ return true; });
};
window.forcePushAll = function() {
  return pushAllToSupabase().then(function(res) {
    var failed = Object.keys(res || {}).filter(function(k){ return !res[k]; });
    alert(failed.length ? 'این موارد ارسال نشدند: ' + failed.join(', ') : 'همه داده‌ها روی سرور ذخیره شدند ✅');
    return res;
  });
};

function initData() {
  if (_dekoriBooting) return;
  _dekoriBooting = true;
  ensureDefaultsLocal();

  loadFromSupabase(function(ok, changed) {
    if (typeof applySettings === 'function') try { applySettings(); } catch(e) {}
    if (typeof renderCategories === 'function') try { renderCategories(); } catch(e) {}
    if (typeof renderProducts === 'function') try { renderProducts(); } catch(e) {}
    if (typeof renderFilters === 'function') try { renderFilters(); } catch(e) {}
    startLiveSync();
  });
}

function formatPrice(num) { return new Intl.NumberFormat('fa-IR').format(num) + ' تومان'; }
function generateId(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function generatePassword(len) {
  len = len || 8; var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; var pass='';
  for (var i=0;i<len;i++) pass += chars.charAt(Math.floor(Math.random()*chars.length)); return pass;
}
initData();

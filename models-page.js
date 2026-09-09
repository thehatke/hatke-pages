/* The Hatke — "Shop by phone model" hub page.
   Served to the storefront via jsDelivr from thehatke/hatke-pages.
   Editing this file does NOT touch the Railway chatbot.
   Brand + Model dropdown filters, a grid of the selected brand's models,
   and a full brand/model link index below. Hides models with no stock.
   Mount with: <div id="hatke-models-root"></div>
   Config: window.HM_CONFIG = { brand: "Samsung" }  -> single-brand page
           window.HM_CONFIG = { mode: "accessories" } -> links to /collections/<h>/accessories */
(function () {
  var MIN_PRICE = 0;
  var PROBE = 12, CONC = 2;
  var STOCK_KEY = "b3stock2";

  var BRANDS = [[/iqoo/, "iQOO"], [/iphone|apple/, "Apple"], [/samsung|galaxy/, "Samsung"], [/oneplus/, "OnePlus"], [/pixel|google/, "Google"], [/motorola|moto /, "Motorola"], [/nothing|cmf/, "Nothing"], [/oppo/, "Oppo"], [/vivo/, "Vivo"], [/redmi|xiaomi|poco/, "Xiaomi"], [/realme/, "Realme"], [/infinix/, "Infinix"], [/tecno/, "Tecno"], [/honor/, "Honor"], [/lava/, "Lava"]];
  var ORDER = ["Apple", "Samsung", "OnePlus", "Google", "Motorola", "Nothing", "Oppo", "Vivo", "Xiaomi", "Realme", "iQOO", "Infinix", "Tecno", "Honor", "Lava"];
  var SKIP = /watch|iwatch|strap|airpod|buds|wallet|charger|cable|lens|mask|stand|poster|earbud|protector|printed case|spritual|accessor|bestseller|best selling|new products|home page|discount eligible|all cases|magsafe|combo|signature|\d+mm|encho|enco|selling products|bundle/i;
  var NOISE = /\b(cases|case|covers|cover|mobile|original|printed|spritual|spiritual|back|premium|new|for|the|and|shockproof|silicone|phone|phones)\b/gi;
  var BAD = /^(apple|samsung|oneplus|google|motorola|nothing|oppo|vivo|xiaomi|redmi|realme|iqoo|infinix|tecno|honor|lava|cmf|poco|galaxy|series|all|other|others)$/i;
  var KEEP = ["pro", "max", "air", "mini", "plus", "ultra", "neo", "lite", "fold", "flip", "note", "play", "hot", "edge", "nord", "pixel", "galaxy", "stylus", "fusion", "open"];
  var EXCLUDE = ["accessories", "screen guard", "lens", "metallic camera ring", "metal camera ring", "apple charger", "charging lightning adapter", "posters"];
  var NOTCASE = /screen protector|camera lens|lens guard|charging|charger|earphone|cable|sticky mobile wallet|dust protector|waterproof mobile cover|tempered|glass/i;

  var MODELS = {}, STOCK = {}, brand = null;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

  try { STOCK = JSON.parse(sessionStorage.getItem(STOCK_KEY) || "{}"); } catch (e) { STOCK = {}; }
  function saveStock() { try { sessionStorage.setItem(STOCK_KEY, JSON.stringify(STOCK)); } catch (e) {} }

  var CSS = "#hm{--muted:#6b6b6b;--line:#e5e5e5;font-family:'Montserrat',sans-serif;font-weight:600;color:#000;background:#fff;-webkit-text-size-adjust:100%}#hm *{box-sizing:border-box;margin:0;padding:0}#hm h1,#hm h2,#hm h3{font-family:'Poppins',sans-serif;font-weight:500}#hm .wrap{max-width:1100px;margin:0 auto;padding:0 0 28px}#hm .head{text-align:center;margin-bottom:14px}#hm h1{font-size:clamp(21px,6vw,32px);line-height:1.2;margin-bottom:6px}#hm .intro{color:var(--muted);font-size:12px;font-weight:500;max-width:40ch;margin:0 auto;line-height:1.5}#hm .bar{position:sticky;top:0;z-index:40;background:#fff;padding:8px 0 8px;border-bottom:1px solid var(--line);margin-bottom:14px}#hm .flabel{text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}#hm .sels{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;max-width:560px;margin:0 auto}#hm .sel{position:relative}#hm .sel:after{content:\"\\25BE\";position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}#hm .sel select{width:100%;appearance:none;-webkit-appearance:none;border:1.5px solid #000;background:#fff;color:#000;padding:12px 30px 12px 12px;font-size:16px;font-weight:700;font-family:'Montserrat',sans-serif;border-radius:0;letter-spacing:.02em}#hm .sel select.empty{color:#888;font-weight:600}#hm .sel select:disabled{opacity:.45}#hm .sec{margin-bottom:24px;scroll-margin-top:110px}#hm #hmBody{scroll-margin-top:96px}#hm .bcard{min-height:84px;padding:18px 12px 16px;text-align:center;align-items:center}#hm .bcard .lbl{font-size:19px;font-weight:600;padding-right:0}#hm .bcard .n{margin-top:2px}#hm .back{display:inline-block;font-size:13px;font-weight:700;color:#000;text-decoration:none;padding:6px 0 10px;letter-spacing:.02em}#hm .back:active{opacity:.6}#hm .sec h2{font-size:16px;margin-bottom:2px;display:flex;align-items:baseline;gap:7px;justify-content:center;flex-wrap:wrap}#hm .sec .cnt{font-family:'Montserrat',sans-serif;font-size:10.5px;color:var(--muted);font-weight:600}#hm .rule{width:40px;height:2px;background:#000;margin:8px auto 12px}#hm .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}@media(min-width:520px){#hm .grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:900px){#hm .grid{grid-template-columns:repeat(4,1fr);gap:10px}}#hm .card{position:relative;border:1px solid var(--line);background:#fff;color:#000;text-decoration:none;padding:12px 12px 10px;display:flex;flex-direction:column;justify-content:center;gap:3px;min-height:64px}#hm .card .lbl{font-family:'Poppins',sans-serif;font-weight:500;font-size:16px;line-height:1.2;letter-spacing:.01em;padding-right:36px}#hm .card .n{font-size:10.5px;color:var(--muted);font-weight:600;white-space:nowrap}#hm .card:active{border-color:#000;background:#fafafa}@media(hover:hover){#hm .card:hover{border-color:#000}}#hm .hm-flag{position:absolute!important;top:6px!important;right:6px!important;left:auto!important;bottom:auto!important;width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;display:inline-block!important;font:800 8.5px/1 'Montserrat',sans-serif!important;letter-spacing:.12em!important;text-transform:uppercase!important;padding:3px 6px!important;border-radius:3px!important;color:#fff!important;background:#111!important;border:0!important;box-shadow:none!important;transform:none!important;margin:0!important;text-align:center!important;font-style:normal!important;pointer-events:none}#hm .hm-flag-new{background:#16a34a!important}#hm .hm-flag-hot{background:#e42c00!important}#hm .card .lbl{padding-right:34px}#hm .note{border:1px dashed #c9c9c9;padding:22px 16px;text-align:center;color:var(--muted);font-size:13px;font-weight:500}#hm .back{display:none!important}#hm .bar{position:relative}#hm .bar.pinned{position:fixed;z-index:2147483000;background:#fff;margin:0;padding:8px 0 9px;border-bottom:1px solid var(--line);box-shadow:0 2px 10px rgba(0,0,0,.07)}#hm .bar.pinned .sels{max-width:560px}#hm-barback{display:none;position:absolute;left:0;top:8px;background:0;border:0;font:700 12px 'Montserrat',sans-serif;color:#000;cursor:pointer;padding:3px 2px;z-index:2}#hm .bar.pinned #hm-barback.on,#hm #hm-barback.on{display:inline-block}#hm-barback:active{opacity:.6}#hm .spin{width:24px;height:24px;border:3px solid #e5e5e5;border-top-color:#000;border-radius:50%;margin:0 auto 8px;animation:hmspin .8s linear infinite}@keyframes hmspin{to{transform:rotate(360deg)}}#hm .index{border-top:0;padding-top:0;margin-top:26px}#hm .idx{border:0}#hm .idx summary{list-style:none;cursor:pointer;padding:8px;display:flex;justify-content:center;align-items:center;gap:4px;text-align:center}#hm .idx summary::-webkit-details-marker{display:none}#hm .idx summary:after{content:\"\\25BE\";font-size:9px;color:#d0d0d0}#hm .idx[open] summary:after{content:\"\\25B4\"}#hm .sum-t{font-family:'Montserrat',sans-serif;font-weight:500;font-size:10px;color:#c8c8c8;text-decoration:none;letter-spacing:.04em}#hm .idx-body{padding:6px 0 8px}#hm .index h2{font-size:15px;text-align:center;margin-bottom:3px}#hm .index p.s{text-align:center;color:var(--muted);font-size:11.5px;font-weight:500;margin-bottom:16px}#hm .ibrand{margin:14px 0 6px}#hm .ibrand h3{font-size:11.5px;font-family:'Montserrat',sans-serif;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--line)}#hm .ilinks{display:flex;flex-wrap:wrap;gap:6px}#hm .ilinks a{color:#000;text-decoration:none;font-size:13.5px;font-weight:600;padding:9px 12px;border:1px solid var(--line);line-height:1.2}#hm .ilinks a:active{border-color:#000}@media(hover:hover){#hm .ilinks a:hover{border-color:#000}}";

  function brandOf(t) { for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i][0].test(t)) return BRANDS[i][1]; return null; }
  function deviceBrand() { var ua = navigator.userAgent || ""; if (/iPhone|iPad|iPod/i.test(ua)) return "Apple"; if (/OnePlus/i.test(ua)) return "OnePlus"; if (/Pixel/i.test(ua)) return "Google"; if (/SM-|Samsung/i.test(ua)) return "Samsung"; if (/moto|motorola/i.test(ua)) return "Motorola"; if (/Nothing|CMF/i.test(ua)) return "Nothing"; if (/OPPO|CPH/i.test(ua)) return "Oppo"; if (/iQOO/i.test(ua)) return "iQOO"; if (/vivo/i.test(ua)) return "Vivo"; if (/Redmi|Xiaomi|POCO/i.test(ua)) return "Xiaomi"; if (/realme|RMX/i.test(ua)) return "Realme"; if (/Infinix/i.test(ua)) return "Infinix"; if (/TECNO/i.test(ua)) return "Tecno"; return null; }
  function tcase(tok) { var l = tok.toLowerCase(); if (l === "iphone") return "iPhone"; if (l === "ipad") return "iPad"; if (KEEP.indexOf(l) > -1) return l.charAt(0).toUpperCase() + l.slice(1); if (/\d/.test(tok)) return tok.toUpperCase(); if (tok.length <= 3) return tok.toUpperCase(); return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase(); }
  function label(title, b) {
    var s = String(title).split("&")[0];
    s = " " + s + " ";
    s = s.replace(/[\-\u2013\u2014]/g, " ").replace(NOISE, " ");
    if (b === "Apple") s = s.replace(/\bapple\b/gi, " "); else s = s.replace(new RegExp("\\b" + b + "\\b", "gi"), " ");
    s = s.replace(/[&,+]+/g, " ").replace(/\s{2,}/g, " ").trim();
    if (!s || BAD.test(s)) return "";
    if (!/\d/.test(s) && s.split(" ").length < 2 && b !== "Apple") return "";
    return s.split(" ").map(tcase).join(" ");
  }
  function gen(l, b) { var n = l.match(/\d+/g); if (!n) { if (/\bx\b|xs|xr/i.test(l)) return 10; if (/\bse\b/i.test(l)) return 0; return b === "Apple" ? 999 : 0; } var v = parseInt(n[0], 10); if (/^a\d/i.test(l)) v = v / 2.2; if (v > 100) v = v / 10; return v; }
  function rank(l) { l = l.toLowerCase(); if (/pro\s*max|ultra/.test(l)) return 4; if (/\bpro\b|\bxl\b/.test(l)) return 3; if (/plus|\+/.test(l)) return 2; if (/mini|\bfe\b|lite|\be\b/.test(l)) return -1; return 0; }
  function fullName(m) { return m.brand === "Apple" ? m.label : m.brand + " " + m.label; }

  var SERIES_ORDER = {
    "Samsung": ["s", "z fold", "fold", "z flip", "flip", "note", "a", "m", "f"],
    "OnePlus": ["", "nord", "nord ce"],
    "Vivo": ["x", "v", "t", "y"],
    "iQOO": ["", "neo", "z"],
    "Xiaomi": ["", "redmi note", "redmi", "poco"],
    "Realme": ["gt", "", "narzo", "c"],
    "Oppo": ["find", "reno", "f", "k", "a"],
    "Motorola": ["edge", "razr", "g", "e"],
    "Google": ["pixel"],
    "Nothing": ["phone", "cmf phone", "cmf"],
    "Apple": ["iphone", ""]
  };
  function seriesRank(b, s) {
    var ord = SERIES_ORDER[b] || [];
    var i = ord.indexOf(s);
    if (i > -1) return i;
    if (s === "") return ord.length;
    return ord.length + 1;
  }
  function cmpModels(a, c) {
    var sa = seriesRank(a.brand, seriesOf(a.label)), sc = seriesRank(c.brand, seriesOf(c.label));
    if (sa !== sc) return sa - sc;
    if (c.g !== a.g) return c.g - a.g;
    if (c.r !== a.r) return c.r - a.r;
    return a.label.localeCompare(c.label);
  }
  var CACHE_KEY = "hm_models_v4", CACHE_TTL = 6 * 3600 * 1000;
  function notEmpty(m) { return m && Object.keys(m).some(function (b) { return m[b] && m[b].length; }); }
  function ingest(list, out) {
    list.forEach(function (c) {
      var title = c.title || "";
      if (SKIP.test(title)) return;
      if ((c.products_count || 0) < 1) return;
      var b = brandOf(title.toLowerCase());
      if (!b) return;
      var lab = label(title, b);
      if (!lab || lab.length > 26) return;
      var key = b + "|" + lab.toLowerCase().replace(/[^a-z0-9]/g, "");
      var prev = out[key], isCases = /^cases-/.test(c.handle);
      var pub = Date.parse(c.published_at || c.updated_at || "") || 0;
      if (!prev || (isCases && !prev.isCases) || (isCases === prev.isCases && (c.products_count || 0) > prev.n)) {
        var keepPub = prev && prev.pub ? Math.min(prev.pub, pub || prev.pub) : pub;
        out[key] = { brand: b, label: lab, handle: c.handle, n: c.products_count || 0, isCases: isCases, g: gen(lab, b), r: rank(lab), pub: keepPub };
      } else if (prev && pub && (!prev.pub || pub < prev.pub)) {
        prev.pub = pub;
      }
    });
  }
  function group(out) {
    var m = {};
    Object.keys(out).forEach(function (k) { var o = out[k]; (m[o.brand] = m[o.brand] || []).push(o); });
    Object.keys(m).forEach(function (b) { m[b].sort(cmpModels); });
    return m;
  }
  function fetchPage(p, tries) {
    tries = tries || 0;
    return fetch("/collections.json?limit=250&page=" + p)
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) { return (d && d.collections) || []; })
      .catch(function () {
        if (tries < 2) return new Promise(function (res) { setTimeout(res, 800 * (tries + 1)); }).then(function () { return fetchPage(p, tries + 1); });
        return [];
      });
  }
  function load() {
    var out = {}, page = 1;
    function grab() {
      return fetchPage(page).then(function (list) {
        ingest(list, out);
        if (list.length === 250 && page < 6) { page++; return grab(); }
      });
    }
    return grab().then(function () {
      var m = group(out);
      if (notEmpty(m)) { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), m: m })); } catch (e) {} }
      return m;
    });
  }
  function cached() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && notEmpty(c.m) && Date.now() - (c.t || 0) < CACHE_TTL) return c.m;
    } catch (e) {}
    return null;
  }
  function preloaded() {
    var p = window.HM_PRELOAD;
    if (!p || typeof p !== "object") return null;
    var m = {};
    Object.keys(p).forEach(function (b) { m[b] = (p[b] || []).map(function (x) { return { brand: b, label: x[0], handle: x[1], n: x[2], isCases: false, g: gen(x[0], b), r: rank(x[0]), pub: x[3] || 0 }; }); });
    return m;
  }
  /* build tool: window.__hmBuild(collections) -> compact preload object */
  try { window.__hmBuild = function (list) { var out = {}; ingest(list, out); var m = group(out), p = {}; Object.keys(m).forEach(function (b) { p[b] = m[b].map(function (x) { return [x.label, x.handle, x.n, x.pub || 0]; }); }); return p; }; } catch (e) {}

  /* ---- stock: only the selected brand, gently, and errors never mean "empty" ---- */
  function sellable(p) {
    var tags = (p.tags || []).map(function (t) { return String(t).toLowerCase(); });
    if (EXCLUDE.some(function (x) { return tags.indexOf(x) > -1; })) return false;
    if (NOTCASE.test(p.title)) return false;
    if (!/case|cover/i.test(p.title)) return false;
    for (var i = 0; i < (p.variants || []).length; i++) if (p.variants[i].available && parseFloat(p.variants[i].price) > MIN_PRICE) return true;
    return false;
  }
  function probe(handle) {
    if (STOCK[handle] !== undefined) return Promise.resolve(STOCK[handle]);
    return fetch("/collections/" + handle + "/products.json?limit=" + PROBE)
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) {
        var prods = (d && d.products) || [];
        if (!prods.length) return true;           /* empty response = unknown, keep it */
        var ok = prods.some(sellable);
        STOCK[handle] = ok; saveStock();
        return ok;
      })
      .catch(function () { return true; });        /* network / rate limit = unknown, keep it */
  }
  var pruning = {};
  function pruneBrand(b) {
    if (ACC) return Promise.resolve();
    if (pruning[b]) return pruning[b];
    var list = (MODELS[b] || []).slice();
    list.forEach(function (m) { if (STOCK[m.handle] === false) drop(m); });
    var todo = list.filter(function (m) { return STOCK[m.handle] === undefined; });
    var i = 0, changed = false;
    function next() {
      if (i >= todo.length) return Promise.resolve();
      var m = todo[i++];
      return probe(m.handle).then(function (ok) { if (!ok) { drop(m); changed = true; } return next(); });
    }
    var runners = [];
    for (var c = 0; c < CONC; c++) runners.push(next());
    pruning[b] = Promise.all(runners).then(function () { if (changed && brand === b) { renderModelSelect(); renderGrid(); renderIndex(); } });
    return pruning[b];
  }
  function drop(m) {
    var arr = MODELS[m.brand] || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].handle === m.handle) { arr.splice(i, 1); break; }
    if (!arr.length) { delete MODELS[m.brand]; if (!LOCK) renderBrandSelect(); }
  }

  /* ---- render ---- */
  function brandList() { if (LOCK) return (MODELS[LOCK] && MODELS[LOCK].length) ? [LOCK] : []; var b = ORDER.filter(function (x) { return MODELS[x] && MODELS[x].length; }); Object.keys(MODELS).forEach(function (x) { if (b.indexOf(x) < 0) b.push(x); }); return b; }

  function renderBrandSelect() {
    var sel = $("hmBrand"); sel.innerHTML = '<option value="">Choose brand</option>';
    brandList().forEach(function (b) { var o = document.createElement("option"); o.value = b; o.textContent = b; sel.appendChild(o); });
    if (brand && brandList().indexOf(brand) < 0) brand = null;
    sel.value = brand || "";
    sel.classList.toggle("empty", !brand);
  }
  function renderModelSelect() {
    var sel = $("hmModel"); sel.innerHTML = '<option value="">Choose model</option>';
    ordered(MODELS[brand] || []).forEach(function (r) { var m = r.m; var o = document.createElement("option"); o.value = href(m.handle); o.textContent = m.label + (r.t === "new" ? "  \u2022 New" : (r.t === "hot" ? "  \u2022 Hot" : "")); sel.appendChild(o); });
    sel.value = ""; sel.classList.add("empty"); sel.disabled = !brand;
  }
  function seriesOf(label) {
    var m = String(label).match(/^([A-Za-z][A-Za-z ]*?)\s*\d/);
    return m ? m[1].trim().toLowerCase() : "";
  }
  function launchKey(m) { return (m.brand + " " + m.label).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim(); }
  function launchTs(m) {
    var tbl = window.HM_LAUNCH || {};
    var k = launchKey(m), v = tbl[k];
    if (!v && m.brand === "Apple") v = tbl[k.replace(/^apple /, "apple iphone ")];
    if (v) { var t = Date.parse(/^\d{4}-\d{2}$/.test(v) ? v + "-01" : v); if (t) return t; }
    return m.pub || 0;
  }
  var NEW_COUNT = 5;
  function badges(list) {
    var cfg = window.HM_CONFIG || {};
    var newH = cfg.newHandles || [], hotH = cfg.hotHandles || [];
    var newSet = {};
    if (newH.length) newH.forEach(function (h) { newSet[h] = 1; });
    else list.slice().map(function (m) { return { m: m, t: launchTs(m) }; }).filter(function (x) { return x.t > 0; }).sort(function (a, b) { return b.t - a.t; }).slice(0, cfg.newCount || NEW_COUNT).forEach(function (x) { newSet[x.m.handle] = 1; });
    var byCount = list.slice().sort(function (a, b) { return b.n - a.n; });
    var hotSet = {};
    hotH.forEach(function (h) { hotSet[h] = 1; });
    if (!hotH.length) byCount.slice(0, 3).forEach(function (m) { hotSet[m.handle] = 1; });
    return list.map(function (m) {
      var isNew = !!newSet[m.handle];
      var isHot = !!hotSet[m.handle] && !isNew;
      return isNew ? "new" : (isHot ? "hot" : "");
    });
  }
  function ordered(list) {
    var tags = badges(list);
    var w = { "new": 0, "hot": 1, "": 2 };
    return list.map(function (m, i) { return { m: m, t: tags[i], i: i }; })
      .sort(function (a, b) { if (w[a.t] !== w[b.t]) return w[a.t] - w[b.t]; if (a.t === "new" && b.t === "new") return launchTs(b.m) - launchTs(a.m); return a.i - b.i; });
  }
  function brandSection(b) {
    var list = MODELS[b] || [];
    var rows = ordered(list);
    var sec = document.createElement("section");
    sec.className = "sec";
    var grid = rows.map(function (r) {
      var m = r.m, tag = r.t;
      var badge = tag === "new" ? '<i class="hm-flag hm-flag-new">New</i>' : (tag === "hot" ? '<i class="hm-flag hm-flag-hot">Hot</i>' : '');
      return '<a class="card" href="' + href(m.handle) + '">' + badge + '<span class="lbl">' + esc(m.label) + '</span><span class="n">' + (ACC ? "Accessories \u203a" : m.n + ' designs \u203a') + '</span></a>';
    }).join("");
    sec.innerHTML = '<h2 id="brand-' + esc(b.toLowerCase()) + '">' + esc(b) + ' <span class="cnt">' + list.length + ' models</span></h2><div class="rule"></div><div class="grid">' + grid + '</div>';
    return sec;
  }
  var LOCK = (window.HM_CONFIG && window.HM_CONFIG.brand) || null;
  var ACC = !!(window.HM_CONFIG && window.HM_CONFIG.mode === "accessories");
  function href(h) { return "/collections/" + h + (ACC ? "/accessories" : ""); }
  function renderGrid() {
    var host = $("hmBody"); host.innerHTML = "";
    if (LOCK) {
      var ml = MODELS[LOCK] || [];
      if (!ml.length) { host.innerHTML = '<div class="note">No models in stock right now.</div>'; return; }
      host.appendChild(brandSection(LOCK));
      var all = document.createElement("a");
      all.className = "back"; all.href = "/pages/phonecases"; all.textContent = "\u2190 All brands";
      all.style.cssText = "display:block;text-align:center;padding:14px 0 0";
      host.appendChild(all);
      return;
    }
    if (!brand) {
      var bs = brandList();
      if (!bs.length) { host.innerHTML = '<div class="note">No models in stock right now.</div>'; return; }
      var sec = document.createElement("section");
      sec.className = "sec";
      sec.innerHTML = '<h2>Shop by brand</h2><div class="rule"></div><div class="grid bgrid">' + bs.map(function (b) {
        return '<a class="card bcard" href="#" data-brand="' + esc(b) + '"><span class="lbl">' + esc(b) + '</span><span class="n">' + MODELS[b].length + ' models \u203a</span></a>';
      }).join("") + '</div>';
      host.appendChild(sec);
      host.querySelectorAll(".bcard").forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); navBrand(a.getAttribute("data-brand")); });
      });
      return;
    }
    var list = MODELS[brand] || [];
    var back = document.createElement("a");
    back.className = "back"; back.href = "#"; back.textContent = "\u2190 All brands";
    back.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.history && history.length > 1) { history.back(); return; }
      navBrand(null);
      try { $("hmBody").scrollIntoView({ block: "start" }); } catch (err) {}
    });
    host.appendChild(back);
    if (!list.length) { host.insertAdjacentHTML("beforeend", '<div class="note">No models in stock for ' + esc(brand || "this brand") + ' right now.</div>'); return; }
    host.appendChild(brandSection(brand));
  }
  function renderIndex() {
    var el = $("hmIndex");
    var html = '<details class="idx"><summary><span class="sum-t">All models</span></summary><div class="idx-body">';
    brandList().forEach(function (b) {
      var links = MODELS[b].map(function (m) { return '<a href="' + href(m.handle) + '">' + esc(fullName(m)) + '</a>'; }).join("");
      html += '<div class="ibrand"><h3 id="all-' + esc(b.toLowerCase()) + '">' + esc(b) + (ACC ? ' accessories' : ' cases') + '</h3><div class="ilinks">' + links + '</div></div>';
    });
    html += '</div></details>';
    el.innerHTML = html;
    jsonld();
  }
  function jsonld() {
    var old = document.getElementById("hmLd"); if (old) old.remove();
    var items = [], i = 1;
    brandList().forEach(function (b) { MODELS[b].forEach(function (m) { if (i > 200) return; items.push({ "@type": "ListItem", position: i++, name: fullName(m) + " cases", url: location.origin + "/collections/" + m.handle }); }); });
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "hmLd";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Phone cases by model \u2014 The Hatke", itemListElement: items });
    document.head.appendChild(s);
  }

  function onBrand() { brand = $("hmBrand").value || null; $("hmBrand").classList.toggle("empty", !brand); renderModelSelect(); renderGrid(); syncFloat(); if (brand) { pruneBrand(brand); try { $("hmBody").scrollIntoView({ block: "start" }); } catch (e) {} } }
  function onModel() { var v = $("hmModel").value; if (v) location.href = v; }

  /* ---- history ----
     Selecting a brand swaps the page content with JS. Without a history entry
     the browser back button leaves the page entirely, skipping the brand grid.
     A hash per brand makes back walk the steps, and makes a brand link shareable. */
  function brandFromHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (h.indexOf("brand=") !== 0) return null;
    var v = decodeURIComponent(h.slice(6));
    return v || null;
  }
  function navBrand(b) {
    try {
      history.pushState({ hmBrand: b || null }, "",
        b ? "#brand=" + encodeURIComponent(b) : location.pathname + location.search);
    } catch (e) {}
    $("hmBrand").value = b || "";
    onBrand();
  }

  /* Floating back button. Mounted on <body> rather than inside the theme's
     content wrapper, which clips position:sticky. */
  /* The filter bar is pinned to the top once scrolled past, with the back
     control living inside it. position:sticky can't be used — the theme's
     content wrapper has overflow:hidden, which kills it — so the bar is
     switched to position:fixed and a spacer holds its place in the flow. */
  var barSpacer = null, barHome = null, pinLeft = 0, pinWidth = 0;
  function ensureFloat() {
    var bar = document.querySelector("#hm .bar");
    if (!bar) return null;
    if (!document.getElementById("hm-barback")) {
      var b = document.createElement("button");
      b.id = "hm-barback";
      b.type = "button";
      b.textContent = "\u2190 All brands";
      b.addEventListener("click", function () {
        if (LOCK) { location.href = "/pages/phonecases"; return; }
        if (window.history && history.length > 1) history.back();
        else navBrand(null);
      });
      bar.appendChild(b);
    }
    if (!barSpacer) {
      barSpacer = document.createElement("div");
      barSpacer.style.display = "none";
      bar.parentNode.insertBefore(barSpacer, bar);
    }
    return bar;
  }
  // Probe down the top of the viewport for whatever is actually pinned there
  // (announcement bar, header, app bars). Selector guessing missed the theme's
  // real header, which left the bar parked behind it.
  function headerBottom() {
    var low = 0, x = Math.round(window.innerWidth / 2), lim = window.innerHeight * 0.45;
    if (!document.elementsFromPoint) return 0;
    for (var y = 2; y <= 300; y += 10) {
      var els = document.elementsFromPoint(x, y) || [];
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!el || el === document.body || el === document.documentElement) continue;
        if (el.id === "hm-barback" || (el.closest && el.closest("#hm"))) continue;
        var cs = window.getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") continue;
        var b = el.getBoundingClientRect().bottom;
        if (b > low && b < lim) low = b;
      }
    }
    return low;
  }
  function syncFloat() {
    var bar = ensureFloat();
    if (!bar) return;
    var back = document.getElementById("hm-barback");
    if (back) back.classList.toggle("on", !!brand || !!LOCK);

    var top = Math.max(0, Math.round(headerBottom()));
    var pinned = bar.classList.contains("pinned");
    var anchor = pinned ? barSpacer.getBoundingClientRect().top : bar.getBoundingClientRect().top;

    // The bar stays inside #hm: every style rule is scoped to that id, so
    // relocating it to <body> strips its styling and it vanishes.
    if (!pinned && anchor < top) {
      // Measure the slot BEFORE the bar leaves the flow, and cache it. Reading
      // it every scroll frame let the value drift smaller and smaller.
      var slot = bar.getBoundingClientRect();
      pinLeft = Math.round(slot.left);
      pinWidth = Math.round(slot.width);
      barSpacer.style.height = bar.offsetHeight + "px";
      barSpacer.style.display = "block";
      bar.classList.add("pinned");
      pinned = true;
    } else if (pinned && anchor >= top) {
      bar.classList.remove("pinned");
      barSpacer.style.display = "none";
      bar.style.top = "";
      bar.style.left = "";
      bar.style.width = "";
      pinned = false;
    }
    if (pinned) {
      bar.style.top = top + "px";
      bar.style.left = pinLeft + "px";
      bar.style.width = pinWidth + "px";
    }
  }

  function start() {
    var root = document.getElementById("hatke-models-root");
    if (!root) return;
    var f = document.createElement("link");
    f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(f);
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root.id = "hm";
    try { document.querySelectorAll("h1").forEach(function (h) { if (!h.closest("#hm")) { h.style.display = "none"; var sh = h.closest(".section-header"); if (sh) { sh.style.display = "none"; sh.style.margin = "0"; } } }); } catch (e) {}
    root.innerHTML =
      '<div class="wrap"><div class="head"><h1>' + esc(ACC ? "Accessories by phone" : (LOCK ? LOCK + " phone cases" : "Phone cases by model")) + '</h1><p class="intro">' + esc(ACC ? "Pick your phone \u2014 chargers, screen guards, lens protectors and more" : (LOCK ? "Pick your " + LOCK + " model" : "Pick your brand, then your model")) + '</p></div>' +
      '<div class="bar"><div class="flabel">Your phone</div><div class="sels"' + (LOCK ? ' style="grid-template-columns:1fr"' : '') + '>' + (LOCK ? '' : '<div class="sel"><select id="hmBrand" aria-label="Brand"></select></div>') + '<div class="sel"><select id="hmModel" aria-label="Model" class="empty"><option value="">Select model</option></select></div></div></div>' +
      '<div id="hmBody"><div class="note"><div class="spin"></div>Loading models\u2026</div></div>' +
      '<div class="index" id="hmIndex"></div></div>';
    if (!LOCK) $("hmBrand").addEventListener("change", function () { navBrand($("hmBrand").value || null); });
    $("hmModel").addEventListener("change", onModel);
    if (!LOCK) {
      window.addEventListener("popstate", function () {
        var b = brandFromHash();
        $("hmBrand").value = b || "";
        onBrand();
      });
    }
    window.addEventListener("scroll", syncFloat, { passive: true });
    window.addEventListener("resize", function () {
      // Unpin first so the next syncFloat re-measures the slot at the new width.
      var bar = document.querySelector("#hm .bar");
      if (bar && bar.classList.contains("pinned")) {
        bar.classList.remove("pinned");
        bar.style.top = ""; bar.style.left = ""; bar.style.width = "";
        if (barSpacer) barSpacer.style.display = "none";
      }
      syncFloat();
    }, { passive: true });

    function applyModels(m) {
      MODELS = m;
      if (LOCK) { brand = LOCK; }
      else {
        renderBrandSelect();
        var deep = brandFromHash();
        if (deep && MODELS[deep]) { brand = deep; $("hmBrand").value = deep; $("hmBrand").classList.remove("empty"); }
      }
      renderModelSelect(); renderGrid(); renderIndex(); syncFloat();
    }
    var quick = cached() || preloaded();
    if (quick) { applyModels(quick); if (LOCK) pruneBrand(LOCK); }
    function refresh(attempt) {
      return load().then(function (m) {
        if (!notEmpty(m)) {
          if (attempt < 2) return new Promise(function (r) { setTimeout(r, 1200 * (attempt + 1)); }).then(function () { return refresh(attempt + 1); });
          return;
        }
        if (!quick || JSON.stringify(Object.keys(m).map(function (b) { return [b, m[b].map(function (x) { return x.handle + x.n; })]; })) !== JSON.stringify(Object.keys(MODELS).map(function (b) { return [b, MODELS[b].map(function (x) { return x.handle + x.n; })]; }))) {
          applyModels(m);
          if (brand) pruneBrand(brand);
        }
      });
    }
    refresh(0).catch(function () {
      if (!quick) $("hmBody").innerHTML = '<div class="note">Couldn\u2019t load models. Please refresh.</div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

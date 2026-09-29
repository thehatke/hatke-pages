/* The Hatke — Anti-Yellow case landing page.
   Reads the smart collection /collections/anti-yellow-cases (rule: title contains
   "Anti Yellow"), parses the phone model out of each product title, and shows a
   brand -> model picker that lands on the product page for that model.

   Add a new anti-yellow product in Shopify and it appears here automatically —
   no code change needed, as long as the title ends with the model name.

   Mount: <div id="hatke-ay-root"></div>
   Optional config before this script:
     window.AY_CONFIG = {
       collection: "anti-yellow-cases",   // source collection handle
       title: "Anti-Yellow MagSafe Case",
       intro: "Stays crystal clear. Never turns yellow.",
       price: "599",                      // headline price shown in hero
       mrp: "2499"                        // struck-through price
     };
*/
(function () {
  var C = window.AY_CONFIG || {};
  var COLL = C.collection || "anti-yellow-cases";
  var CACHE_KEY = "hk_ay_v1", CACHE_TTL = 30 * 60 * 1000;

  var BRANDS = [[/iqoo/, "iQOO"], [/iphone|apple/, "Apple"], [/samsung|galaxy/, "Samsung"], [/oneplus|one plus/, "OnePlus"], [/pixel|google/, "Google"], [/motorola|moto /, "Motorola"], [/nothing|cmf/, "Nothing"], [/oppo/, "Oppo"], [/vivo/, "Vivo"], [/redmi|xiaomi|poco/, "Xiaomi"], [/realme/, "Realme"], [/infinix/, "Infinix"], [/tecno/, "Tecno"], [/honor/, "Honor"], [/lava/, "Lava"]];
  var ORDER = ["Apple", "Samsung", "OnePlus", "Google", "Motorola", "Nothing", "Oppo", "Vivo", "Xiaomi", "Realme", "iQOO", "Infinix", "Tecno", "Honor", "Lava"];
  /* words stripped from the title to leave just the model */
  var NOISE = /\b(invisi|anti|yellow|magsafe|mag safe|clear|transparent|silicone|case|cases|cover|covers|for|the|premium|shockproof|hybrid|shine|black|white|crystal|titanium|new)\b/gi;
  var KEEP = ["pro", "max", "air", "mini", "plus", "ultra", "neo", "lite", "fold", "flip", "note", "edge", "nord", "pixel", "fe", "se"];

  var MODELS = {}, brand = null;
  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function inr(p) { return "\u20b9" + Math.round(parseFloat(p)); }

  var CSS = "#ay{--muted:#6b6b6b;--line:#e5e5e5;--go:#0d9065;font-family:'Montserrat',sans-serif;font-weight:600;color:#000}#ay *{box-sizing:border-box;margin:0;padding:0}#ay h1,#ay h2{font-family:'Poppins',sans-serif;font-weight:500}#ay .wrap{max-width:1100px;margin:0 auto;padding:0 0 30px}"
    + "#ay .hero{text-align:center;padding:4px 0 18px}#ay h1{font-size:clamp(22px,6.5vw,34px);line-height:1.15;margin-bottom:8px}#ay .sub{color:var(--muted);font-size:13px;font-weight:500;max-width:40ch;margin:0 auto 14px;line-height:1.5}"
    + "#ay .pricerow{display:flex;align-items:baseline;justify-content:center;gap:9px;margin-bottom:6px}#ay .price{font-family:'Poppins',sans-serif;font-weight:600;font-size:30px}#ay .mrp{color:#a8a29a;text-decoration:line-through;font-size:15px;font-weight:500}#ay .save{background:var(--go);color:#fff;font-size:11px;font-weight:700;letter-spacing:.05em;padding:4px 8px;border-radius:4px}"
    + "#ay .usps{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:18px 0 22px;border:1px solid var(--line);background:#faf9f7;padding:14px}@media(min-width:640px){#ay .usps{grid-template-columns:repeat(4,1fr)}}#ay .usps div{text-align:center;font-size:10.5px;color:var(--muted);font-weight:600;line-height:1.35}#ay .usps b{display:block;font-family:'Poppins',sans-serif;font-weight:600;font-size:13px;color:#000;margin-bottom:3px}"
    + "#ay .bar{position:sticky;top:0;z-index:3;background:#fff;padding:9px 0;border-bottom:1px solid var(--line);margin-bottom:16px}#ay .flabel{text-align:center;font-size:10.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}#ay .sels{display:grid;grid-template-columns:1fr 1.35fr;gap:8px;max-width:560px;margin:0 auto}#ay .sel{position:relative}#ay .sel:after{content:\"\\25BE\";position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:13px;pointer-events:none}#ay select{width:100%;appearance:none;-webkit-appearance:none;border:1.5px solid #000;background:#fff;color:#000;padding:12px 30px 12px 12px;font-size:16px;font-weight:700;font-family:'Montserrat',sans-serif;border-radius:0}#ay select.empty{color:#888;font-weight:600}#ay select:disabled{opacity:.45}"
    + "#ay .sec{margin-bottom:24px}#ay .sec h2{font-size:16px;text-align:center}#ay .rule{width:40px;height:2px;background:#000;margin:8px auto 12px}"
    + "#ay .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}@media(min-width:560px){#ay .grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:900px){#ay .grid{grid-template-columns:repeat(4,1fr)}}"
    + "#ay .card{position:relative;border:1px solid var(--line);background:#fff;color:#000;text-decoration:none;padding:15px 11px;display:flex;flex-direction:column;justify-content:center;gap:3px;min-height:68px;text-align:center}#ay .card:active{border-color:#000}@media(hover:hover){#ay .card:hover{border-color:#000}}#ay .card .lbl{font-family:'Poppins',sans-serif;font-weight:500;font-size:15.5px;line-height:1.2}#ay .card .n{font-size:10.5px;color:var(--muted);font-weight:600}#ay .card .oos{color:#c0392b}"
    + "#ay .bcard{min-height:82px}#ay .bcard .lbl{font-size:18px;font-weight:600}"
    + "#ay .back{display:inline-block;font-size:13px;font-weight:700;color:#000;text-decoration:none;padding:4px 0 12px}"
    + "#ay .note{border:1px dashed #c9c9c9;padding:22px 16px;text-align:center;color:var(--muted);font-size:13px;font-weight:500}#ay .spin{width:24px;height:24px;border:3px solid #e5e5e5;border-top-color:#000;border-radius:50%;margin:0 auto 8px;animation:ayspin .8s linear infinite}@keyframes ayspin{to{transform:rotate(360deg)}}"
    + "#ay .mgrid{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:640px){#ay .mgrid{grid-template-columns:repeat(2,1fr)}}@media(min-width:960px){#ay .mgrid{grid-template-columns:repeat(3,1fr)}}"
    + "#ay .mcard{border:1px solid var(--line);padding:13px 13px 11px}#ay .mname{font-family:'Poppins',sans-serif;font-weight:500;font-size:16px;margin-bottom:9px}#ay .opts{display:grid;grid-template-columns:1fr 1fr;gap:7px}#ay .opt{border:1px solid #dcd8d2;padding:9px 7px;text-align:center;text-decoration:none;color:#000;display:block}#ay .opt .on{display:block;font-size:12.5px;font-weight:700}#ay .opt .op{display:block;font-size:10.5px;color:var(--muted);font-weight:600;margin-top:2px}#ay .opt:active{border-color:#000}@media(hover:hover){#ay .opt:hover{border-color:#000}}#ay .opt.off{opacity:.45;pointer-events:none}"
    + "#ay .trust{margin-top:16px;text-align:center;font-size:11.5px;color:var(--muted);font-weight:600}";

  function brandOf(t) { for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i][0].test(t)) return BRANDS[i][1]; return null; }
  function tcase(tok) {
    var l = tok.toLowerCase();
    if (l === "iphone") return "iPhone";
    if (KEEP.indexOf(l) > -1) return l.charAt(0).toUpperCase() + l.slice(1);
    if (/\d/.test(tok)) return tok.toUpperCase();
    if (tok.length <= 3) return tok.toUpperCase();
    return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase();
  }
  function label(title, b) {
    var s = " " + String(title) + " ";
    s = s.replace(/\(.*?\)/g, " ").replace(/[\-\u2013\u2014\/]/g, " ").replace(NOISE, " ");
    if (b === "Apple") s = s.replace(/\bapple\b/gi, " ");
    else s = s.replace(new RegExp("\\b" + b + "\\b", "gi"), " ");
    s = s.replace(/\s{2,}/g, " ").trim();
    if (!s) return "";
    return s.split(" ").map(tcase).join(" ");
  }
  function gen(l) { var m = l.match(/\d+/); return m ? parseInt(m[0], 10) : 0; }
  function rank(l) { l = l.toLowerCase(); if (/pro\s*max|ultra/.test(l)) return 4; if (/\bpro\b|\bxl\b/.test(l)) return 3; if (/plus/.test(l)) return 2; if (/mini|\bfe\b|lite|\be\b/.test(l)) return -1; return 0; }

  function typeOf(title) { return /magsafe|mag safe/i.test(title) ? "magsafe" : "invisi"; }

  function ingest(list, out) {
    list.forEach(function (p) {
      var t = p.title || "";
      var b = brandOf(t.toLowerCase());
      if (!b) return;
      var lab = label(t, b);
      if (!lab || lab.length > 28) return;
      var avail = (p.variants || []).some(function (v) { return v.available; });
      var price = (p.variants && p.variants[0] && p.variants[0].price) || null;
      var ty = typeOf(t);
      var key = b + "|" + lab.toLowerCase().replace(/[^a-z0-9]/g, "");
      var row = out[key];
      if (!row) { row = out[key] = { brand: b, label: lab, g: gen(lab), r: rank(lab), opts: {} }; }
      var prev = row.opts[ty];
      if (!prev || (avail && !prev.avail)) {
        row.opts[ty] = { handle: p.handle, avail: avail, price: price, type: ty };
      }
    });
  }
  function group(out) {
    var m = {};
    Object.keys(out).forEach(function (k) {
      var o = out[k];
      o.avail = Object.keys(o.opts).some(function (t) { return o.opts[t].avail; });
      (m[o.brand] = m[o.brand] || []).push(o);
    });
    Object.keys(m).forEach(function (b) {
      m[b].sort(function (a, c) {
        if (a.avail !== c.avail) return a.avail ? -1 : 1;
        if (c.g !== a.g) return c.g - a.g;
        if (c.r !== a.r) return c.r - a.r;
        return a.label.localeCompare(c.label);
      });
    });
    return m;
  }
  function notEmpty(m) { return m && Object.keys(m).some(function (b) { return m[b] && m[b].length; }); }

  function fetchPage(p, tries) {
    tries = tries || 0;
    return fetch("/collections/" + COLL + "/products.json?limit=250&page=" + p)
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) { return (d && d.products) || []; })
      .catch(function () {
        if (tries < 2) return new Promise(function (res) { setTimeout(res, 700 * (tries + 1)); }).then(function () { return fetchPage(p, tries + 1); });
        return [];
      });
  }
  function load() {
    var out = {}, page = 1;
    function grab() {
      return fetchPage(page).then(function (list) {
        ingest(list, out);
        if (list.length === 250 && page < 8) { page++; return grab(); }
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

  function brandList() {
    var b = ORDER.filter(function (x) { return MODELS[x] && MODELS[x].length; });
    Object.keys(MODELS).forEach(function (x) { if (b.indexOf(x) < 0) b.push(x); });
    return b;
  }
  function renderBrandSelect() {
    var sel = $("ayBrand"); sel.innerHTML = '<option value="">Choose brand</option>';
    brandList().forEach(function (b) { var o = document.createElement("option"); o.value = b; o.textContent = b; sel.appendChild(o); });
    if (brand && brandList().indexOf(brand) < 0) brand = null;
    sel.value = brand || "";
    sel.classList.toggle("empty", !brand);
  }
  function renderModelSelect() {
    var sel = $("ayModel"); sel.innerHTML = '<option value="">Choose model</option>';
    (MODELS[brand] || []).forEach(function (m) {
      ["invisi", "magsafe"].forEach(function (ty) {
        var o = m.opts && m.opts[ty];
        if (!o) return;
        var opt = document.createElement("option");
        opt.value = "/products/" + o.handle;
        opt.textContent = m.label + " \u2014 " + (ty === "magsafe" ? "MagSafe \u20b9699" : "Invisi \u20b9599") + (o.avail ? "" : "  \u2022 Out of stock");
        opt.disabled = !o.avail;
        sel.appendChild(opt);
      });
    });
    sel.value = ""; sel.classList.add("empty"); sel.disabled = !brand;
  }
  function renderBody() {
    var host = $("ayBody"); host.innerHTML = "";
    if (!brand) {
      var bs = brandList();
      if (!bs.length) { host.innerHTML = '<div class="note">Nothing in stock right now \u2014 please check back shortly.</div>'; return; }
      var sec = document.createElement("section");
      sec.className = "sec";
      sec.innerHTML = '<h2>Choose your brand</h2><div class="rule"></div><div class="grid">' + bs.map(function (b) {
        var n = MODELS[b].filter(function (m) { return m.avail; }).length;
        return '<a class="card bcard" href="#" data-b="' + esc(b) + '"><span class="lbl">' + esc(b) + '</span><span class="n">' + n + ' models \u203a</span></a>';
      }).join("") + '</div>';
      host.appendChild(sec);
      host.querySelectorAll("[data-b]").forEach(function (a) {
        a.addEventListener("click", function (e) { e.preventDefault(); $("ayBrand").value = a.getAttribute("data-b"); onBrand(); });
      });
      return;
    }
    var back = document.createElement("a");
    back.className = "back"; back.href = "#"; back.textContent = "\u2190 All brands";
    back.addEventListener("click", function (e) { e.preventDefault(); $("ayBrand").value = ""; onBrand(); });
    host.appendChild(back);
    var list = MODELS[brand] || [];
    if (!list.length) { host.insertAdjacentHTML("beforeend", '<div class="note">No ' + esc(brand) + ' models available right now.</div>'); return; }
    var s2 = document.createElement("section");
    s2.className = "sec";
    s2.innerHTML = '<h2>' + esc(brand) + '</h2><div class="rule"></div><div class="mgrid">' + list.map(function (m) {
      var inv = m.opts.invisi, mag = m.opts.magsafe;
      var opts = "";
      if (inv) opts += '<a class="opt' + (inv.avail ? '' : ' off') + '" href="' + (inv.avail ? "/products/" + esc(inv.handle) : "#") + '"><span class="on">Invisi</span><span class="op">' + (inv.avail ? "\u20b9599 combo" : "Out of stock") + '</span></a>';
      if (mag) opts += '<a class="opt' + (mag.avail ? '' : ' off') + '" href="' + (mag.avail ? "/products/" + esc(mag.handle) : "#") + '"><span class="on">MagSafe</span><span class="op">' + (mag.avail ? "\u20b9699 combo" : "Out of stock") + '</span></a>';
      return '<div class="mcard"><div class="mname">' + esc(m.label) + '</div><div class="opts">' + opts + '</div></div>';
    }).join("") + '</div>';
    host.appendChild(s2);
  }
  function onBrand() {
    brand = $("ayBrand").value || null;
    $("ayBrand").classList.toggle("empty", !brand);
    renderModelSelect(); renderBody();
    if (brand) { try { $("ayBody").scrollIntoView({ block: "start" }); } catch (e) {} }
  }
  function onModel() { var v = $("ayModel").value; if (v) location.href = v; }

  function jsonld() {
    var old = $("ayLd"); if (old) old.remove();
    var items = [], i = 1;
    brandList().forEach(function (b) {
      MODELS[b].forEach(function (m) {
        if (i > 150) return;
        items.push({ "@type": "ListItem", position: i++, name: "Anti-Yellow Case for " + (b === "Apple" ? m.label : b + " " + m.label), url: location.origin + "/products/" + m.handle });
      });
    });
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.id = "ayLd";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Anti-Yellow Cases \u2014 The Hatke", itemListElement: items });
    document.head.appendChild(s);
  }

  function start() {
    var root = $("hatke-ay-root");
    if (!root) return;
    var f = document.createElement("link"); f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(f);
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root.id = "ay";
    try { document.querySelectorAll("h1").forEach(function (h) { if (!h.closest("#ay")) { h.style.display = "none"; var sh = h.closest(".section-header"); if (sh) { sh.style.display = "none"; sh.style.margin = "0"; } } }); } catch (e) {}

    var price = C.price || "599", mrp = C.mrp || "";
    var off = mrp ? Math.round((parseFloat(mrp) - parseFloat(price)) * 100 / parseFloat(mrp)) : 0;
    root.innerHTML =
      '<div class="wrap">' +
      '<div class="hero"><h1>' + esc(C.title || "Anti-Yellow MagSafe Case") + '</h1>' +
      '<p class="sub">' + esc(C.intro || "Stays crystal clear. Never turns yellow.") + '</p>' +
      '<div class="pricerow"><span class="price">\u20b9' + esc(price) + '</span>' +
      (mrp ? '<span class="mrp">\u20b9' + esc(mrp) + '</span><span class="save">' + off + '% OFF</span>' : '') +
      '</div></div>' +
      '<div class="usps"><div><b>Anti-Yellow</b>Stays clear for years</div><div><b>MagSafe</b>N52 magnets</div><div><b>Drop Tested</b>Raised bezels</div><div><b>Metal Buttons</b>Tactile click</div></div>' +
      '<div class="bar"><div class="flabel">Your phone</div><div class="sels">' +
      '<div class="sel"><select id="ayBrand" class="empty"><option value="">Choose brand</option></select></div>' +
      '<div class="sel"><select id="ayModel" class="empty" disabled><option value="">Choose model</option></select></div>' +
      '</div></div>' +
      '<div id="ayBody"><div class="note"><div class="spin"></div>Loading models\u2026</div></div>' +
      '<div class="trust">10% off on prepaid \u00b7 Free COD \u00b7 Easy returns</div>' +
      '</div>';
    $("ayBrand").addEventListener("change", onBrand);
    $("ayModel").addEventListener("change", onModel);

    function apply(m) { MODELS = m; renderBrandSelect(); renderModelSelect(); renderBody(); jsonld(); }
    var quick = cached();
    if (quick) apply(quick);
    load().then(function (m) {
      if (!notEmpty(m)) return;
      apply(m);
    }).catch(function () {
      if (!quick) $("ayBody").innerHTML = '<div class="note">Couldn\u2019t load. Please refresh.</div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

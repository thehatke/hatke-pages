/* The Hatke — anti-yellow post-add offer page (v3: one combo line per model).
   Reads the cart, finds the anti-yellow case, and swaps it for the matching
   model variant of the combo product (case + 6 essentials) in one tap.
   The cart line reads e.g. "Anti-Yellow MagSafe Case + 6 Essentials Combo - Vivo V30",
   so the model shows in Shiprocket Smart Cart and there is no separate add-on
   line that could be left behind.

   Combo products: anti-yellow-combo-599 (no MagSafe), anti-yellow-magsafe-combo-699.
   Their "Phone Model" variants are matched against the model in the case title.
   A case with no matching (available) combo variant gets no offer.

   Mount: <div id="hatke-offer-root"></div>
   Optional window.OFFER_CONFIG = { image: "...", combos: { invisi: "handle", magsafe: "handle" } }
*/
(function () {
  var D = {
    match: "anti yellow",
    combos: { invisi: "anti-yellow-combo-599", magsafe: "anti-yellow-magsafe-combo-699" },
    image: "",
    gifts: [
      ["Sticky Pod", "strong grip, sticks anywhere"],
      ["Charging Cable", "fast charging"],
      ["Cable Protector", "stops bending & fraying"],
      ["Phone Stand", "hands-free viewing"],
      ["Tempered Glass", "crystal-clear screen protection"],
      ["Camera Lens Protector", "keeps your lenses scratch-free"]
    ]
  };
  var C = window.OFFER_CONFIG || {};
  var MATCH = String(C.match || D.match).toLowerCase();
  var HANDLES = C.combos || D.combos;
  var GIFTS = C.gifts || D.gifts;
  var PRODUCTS = {};
  var COMBO_IDS = [];

  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function inr(p) { return "\u20b9" + Math.round(p); }
  function typeOf(title) { return /magsafe|mag safe/i.test(String(title)) ? "magsafe" : "invisi"; }
  function modelOf(title) {
    var m = String(title).split(/\bfor\b/i);
    return m.length > 1 ? m[m.length - 1].replace(/\(.*?\)/g, "").trim() : "";
  }
  function norm(m) { return String(m || "").toLowerCase().replace(/\s+/g, " ").trim(); }
  function sized(url, w) { return String(url).replace(/(\.[a-z]+)(\?|$)/i, "_" + w + "x$1$2"); }

  var CSS = "#hkof{--muted:#6b6b6b;--line:#e5e5e5;--go:#0d9065;--hot:#f26a1b;font-family:'Montserrat',sans-serif;font-weight:600;color:#000}#hkof *{box-sizing:border-box;margin:0;padding:0}#hkof h1{font-family:'Poppins',sans-serif;font-weight:500}#hkof .wrap{max-width:620px;margin:0 auto;padding:0 0 34px}"
    + "#hkof .tick{text-align:center;padding:6px 0 2px;font-size:12.5px;color:var(--go);font-weight:700;letter-spacing:.04em}"
    + "#hkof .head{text-align:center;margin-bottom:14px}#hkof h1{font-size:clamp(21px,6vw,30px);line-height:1.2;margin-bottom:7px}#hkof .sub{color:var(--muted);font-size:13px;font-weight:500;line-height:1.5;max-width:38ch;margin:0 auto}"
    + "#hkof .hero{display:block;width:100%;height:auto;margin:0 0 14px;border:1px solid var(--line);background:#faf9f7}"
    + "#hkof .card{border:2px solid #000;overflow:hidden;margin-bottom:14px}"
    + "#hkof .cardtop{background:#faf9f7;padding:12px 14px;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center;text-align:left}#hkof .thumb{width:62px;height:62px;flex:0 0 62px;object-fit:cover;background:#fff;border:1px solid var(--line)}#hkof .ct{min-width:0}#hkof .cardtop .k{font-family:'Poppins',sans-serif;font-weight:600;font-size:15px;line-height:1.25}#hkof .cardtop .m{font-size:12px;color:var(--muted);font-weight:600;margin-top:3px}"
    + "#hkof .gifts{padding:14px 16px 4px}#hkof .gifts li{list-style:none;display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.45;margin-bottom:9px}#hkof .gifts li i{flex:0 0 auto;width:18px;height:18px;border-radius:50%;background:var(--hot);color:#fff;font-style:normal;font-size:10px;line-height:18px;text-align:center;font-weight:700;margin-top:1px}#hkof .gifts li i.ok{background:var(--go)}#hkof .gifts li b{font-weight:700}#hkof .gifts li span{color:var(--muted);font-weight:500}"
    + "#hkof .pricebox{padding:12px 16px 16px;border-top:1px solid var(--line);text-align:center}#hkof .pr{display:flex;align-items:baseline;justify-content:center;gap:9px;margin-bottom:4px}#hkof .pr .p{font-family:'Poppins',sans-serif;font-weight:600;font-size:28px}#hkof .pr .m2{color:#a8a29a;text-decoration:line-through;font-size:14px;font-weight:500}#hkof .pr .s{background:var(--go);color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px}#hkof .youpay{font-size:11.5px;color:var(--muted);font-weight:600}"
    + "#hkof .stick{position:sticky;bottom:0;z-index:5;background:#fff;padding:10px 0 calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);margin-top:4px}"
    + "#hkof .cta{display:block;width:100%;padding:16px 10px;border:0;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:opacity .15s,transform .06s}#hkof .cta:active{opacity:.78;transform:translateY(1px)}#hkof .cta[disabled]{background:#cfcbc5;cursor:not-allowed}"
    + "#hkof .skip{display:block;text-align:center;margin:14px 0 4px;font-size:12.5px;color:var(--muted);font-weight:600;text-decoration:underline;cursor:pointer}"
    + "#hkof .note{border:1px dashed #c9c9c9;padding:24px 16px;text-align:center;color:var(--muted);font-size:13px;font-weight:500;line-height:1.6}#hkof .note a{color:#000}"
    + "#hkof .spin{width:24px;height:24px;border:3px solid #e5e5e5;border-top-color:#000;border-radius:50%;margin:0 auto 10px;animation:hkofspin .8s linear infinite}@keyframes hkofspin{to{transform:rotate(360deg)}}"
    + "#hkof .errline{margin:8px 0 2px;padding:9px 12px;background:#fdf2f0;border:1px solid #f0c8c0;color:#a13b28;font-size:12px;font-weight:600;line-height:1.4;text-align:center}"
    + "#hkof .trust{margin-top:16px;text-align:center;font-size:11.5px;color:var(--muted);font-weight:600}";

  function getJSON(u) { return fetch(u, { headers: { "Accept": "application/json" } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }

  function loadCombos() {
    return Promise.all(Object.keys(HANDLES).map(function (t) {
      return getJSON("/products/" + HANDLES[t] + ".js").then(function (p) {
        PRODUCTS[t] = p;
        (p.variants || []).forEach(function (v) { COMBO_IDS.push(String(v.id)); });
      }).catch(function () {});
    }));
  }
  function heroImage() {
    if (C.image || D.image) return C.image || D.image;
    for (var t in PRODUCTS) if (PRODUCTS[t] && PRODUCTS[t].featured_image) return PRODUCTS[t].featured_image;
    return "";
  }

  function findCase(cart) {
    var items = (cart && cart.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (COMBO_IDS.indexOf(String(items[i].variant_id)) > -1) continue;
      var t = (items[i].product_title || items[i].title || "").toLowerCase();
      if (t.indexOf(MATCH) > -1) return items[i];
    }
    return null;
  }
  function hasCombo(cart) {
    return ((cart && cart.items) || []).some(function (it) { return COMBO_IDS.indexOf(String(it.variant_id)) > -1; });
  }

  function goCart() {
    try { if (typeof window.slideShiprocketSmartCartInFrame === "function") { window.slideShiprocketSmartCartInFrame(); return; } } catch (e) {}
    location.href = "/cart";
  }

  function dealFor(item) {
    var type = typeOf(item.product_title || item.title);
    var p = PRODUCTS[type];
    if (!p) return null;
    var model = norm(modelOf(item.product_title || item.title));
    if (!model) return null;
    var vs = (p.variants || []).filter(function (v) { return v.available !== false; });
    var v = vs.filter(function (x) { return norm(x.title) === model; })[0] ||
      vs.filter(function (x) {
        var t = norm(x.title);
        return t.slice(-(model.length + 1)) === " " + model || model.slice(-(t.length + 1)) === " " + t;
      })[0];
    if (!v) return null;
    var unit = (item.original_price != null ? item.original_price : item.price) / 100;
    var total = v.price / 100;
    if (total <= unit) return null;
    return { type: type, total: total, compareAt: (v.compare_at_price || v.price) / 100, topup: Math.round(total - unit), variant: v.id };
  }

  function swap(item, deal, btn) {
    btn.disabled = true;
    btn.textContent = "Adding\u2026";
    var qty = item.quantity || 1;
    function post(u, b) { return fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); }
    /* remove the standalone case FIRST - line keys shift after an add */
    post("/cart/change.js", { id: String(item.key), quantity: 0 })
      .then(function (r) {
        if (!r.ok) throw new Error("remove " + r.status);
        return post("/cart/add.js", { id: Number(deal.variant), quantity: qty, properties: { "_combo": "anti-yellow-" + deal.type } });
      })
      .then(function (r) {
        if (r.ok) return r.json();
        /* add failed: put the case back so the customer never loses it */
        return r.text().then(function (t) {
          return post("/cart/add.js", { id: Number(item.variant_id), quantity: qty })
            .then(function () { throw new Error("add " + r.status + " " + t.slice(0, 140)); });
        });
      })
      .then(function () { btn.textContent = "Added \u2713"; setTimeout(goCart, 400); })
      .catch(function (e) {
        btn.disabled = false;
        btn.textContent = "Get the combo \u2014 " + inr(deal.total);
        var d = $("hkofErr");
        if (d) { d.style.display = "block"; d.textContent = "Couldn\u2019t add: " + (e && e.message ? e.message : "unknown error"); }
      });
  }

  function render(cart) {
    var host = $("hkofBody");
    var img = heroImage();
    if (hasCombo(cart)) {
      host.innerHTML = '<div class="note">The combo is already in your cart.<br><a href="#" id="hkofGo">Go to cart \u2192</a></div>';
      $("hkofGo").addEventListener("click", function (e) { e.preventDefault(); goCart(); });
      return;
    }
    var item = findCase(cart);
    if (!item) {
      host.innerHTML = '<div class="note">No anti-yellow case in your cart yet.<br><a href="/pages/anti-yellow-preview">Pick your phone \u2192</a></div>';
      return;
    }
    var deal = dealFor(item);
    if (!deal) {
      host.innerHTML = '<div class="note">This offer isn\u2019t available for that case.<br><a href="#" id="hkofGo2">Go to cart \u2192</a></div>';
      $("hkofGo2").addEventListener("click", function (e) { e.preventDefault(); goCart(); });
      return;
    }
    var model = modelOf(item.product_title || item.title);
    var off = Math.round((deal.compareAt - deal.total) * 100 / deal.compareAt);
    var qty = item.quantity || 1;

    host.innerHTML =
      (img ? '<img class="hero" src="' + esc(sized(img, 1080)) + '" alt="6-in-1 gift pack: sticky pod, charging cable, cable protector, phone stand, tempered glass, camera lens protector" onerror="this.remove()">' : '') +
      '<div class="card">' +
      '<div class="cardtop">' +
      (item.image ? '<img class="thumb" src="' + esc(sized(item.image, 200)) + '" alt="' + esc(item.product_title || item.title) + '">' : '') +
      '<div class="ct"><div class="k">' + esc(item.product_title || item.title) + '</div>' +
      (model ? '<div class="m">For ' + esc(model) + '</div>' : '') + '</div></div>' +
      '<ul class="gifts">' +
      '<li><i class="ok">\u2713</i><span><b>Your anti-yellow case</b> \u2014 already in cart</span></li>' +
      GIFTS.map(function (g, n) {
        var name = Array.isArray(g) ? g[0] : g, why = Array.isArray(g) ? g[1] : "";
        return '<li><i>' + (n + 1) + '</i><span><b>' + esc(name) + '</b>' + (why ? " \u2014 " + esc(why) : "") + '</span></li>';
      }).join("") +
      '</ul>' +
      '<div class="pricebox">' +
      '<div class="pr"><span class="p">' + inr(deal.total) + '</span><span class="m2">' + inr(deal.compareAt) + '</span><span class="s">' + off + '% OFF</span></div>' +
      '<div class="youpay">Case + all 6 essentials \u00b7 just ' + inr(deal.topup) + ' more than the case' + (qty > 1 ? ' per case (\u00d7' + qty + ')' : '') + '</div>' +
      '</div></div>' +
      '<a class="skip" id="hkofSkip">No thanks, just the case</a>' +
      '<div class="errline" id="hkofErr" style="display:none"></div>' +
      '<div class="stick"><button type="button" class="cta" id="hkofCta">Get the combo \u2014 ' + inr(deal.total) + '</button></div>';

    $("hkofCta").addEventListener("click", function () { swap(item, deal, this); });
    $("hkofSkip").addEventListener("click", function (e) { e.preventDefault(); goCart(); });
  }

  function start() {
    var root = $("hatke-offer-root");
    if (!root) return;
    var f = document.createElement("link"); f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(f);
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root.id = "hkof";
    root.removeAttribute("style");
    try { document.querySelectorAll("h1").forEach(function (h) { if (!h.closest("#hkof")) { h.style.display = "none"; var sh = h.closest(".section-header"); if (sh) { sh.style.display = "none"; sh.style.margin = "0"; } } }); } catch (e) {}

    root.innerHTML =
      '<div class="wrap">' +
      '<div class="tick">\u2713 CASE ADDED TO CART</div>' +
      '<div class="head"><h1>Upgrade to the 6-in-1 combo</h1>' +
      '<p class="sub">6 everyday essentials with your case \u2014 packed together in one box.</p></div>' +
      '<div id="hkofBody"><div class="note"><div class="spin"></div>Checking your cart\u2026</div></div>' +
      '<div class="trust">10% off on prepaid \u00b7 Free COD \u00b7 Easy returns</div>' +
      '</div>';

    loadCombos()
      .then(function () { return getJSON("/cart.js"); })
      .then(render)
      .catch(function () { $("hkofBody").innerHTML = '<div class="note">Couldn\u2019t read your cart. Please refresh.</div>'; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

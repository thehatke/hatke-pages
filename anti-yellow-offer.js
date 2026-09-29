/* The Hatke — anti-yellow post-add offer page.
   Reads the customer's cart, finds the anti-yellow case they just added, and
   offers to upgrade it to the ₹599 combo (case + 5 gifts) in one tap.
   The swap removes the plain case line and adds the combo with the phone model
   recorded as a line-item property so packing knows what to put in the box.

   Mount: <div id="hatke-offer-root"></div>
   Config before this script:
     window.OFFER_CONFIG = {
       variant: 67580972302499,        // combo variant id
       price: 599,
       compareAt: 1099,
       match: "anti yellow",           // substring that identifies the base case
       gifts: ["Camera Lens Protector","Tempered Glass","Cable Protector","Suction Pad","Charging Cable"]
     };
*/
(function () {
  var C = window.OFFER_CONFIG || {};
  var COMBOS = C.combos || {};
  var MATCH = (C.match || "anti yellow").toLowerCase();
  var GIFTS = C.gifts || ["Camera Lens Protector", "Tempered Glass", "Cable Protector", "Suction Pad", "Charging Cable"];

  function typeOf(title) { return /magsafe|mag safe/i.test(String(title)) ? "magsafe" : "invisi"; }
  function comboFor(item) { return COMBOS[typeOf(item.product_title || item.title)] || null; }

  var $ = function (i) { return document.getElementById(i); };
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function inr(p) { return "\u20b9" + Math.round(p); }

  /* pull the phone model out of a case title, e.g.
     "Anti Yellow Magsafe Transparent Case for Vivo X300 Pro" -> "Vivo X300 Pro" */
  function modelOf(title) {
    var m = String(title).split(/\bfor\b/i);
    if (m.length > 1) return m[m.length - 1].replace(/\(.*?\)/g, "").trim();
    return "";
  }

  var CSS = "#hkof{--muted:#6b6b6b;--line:#e5e5e5;--go:#0d9065;font-family:'Montserrat',sans-serif;font-weight:600;color:#000}#hkof *{box-sizing:border-box;margin:0;padding:0}#hkof h1,#hkof h2{font-family:'Poppins',sans-serif;font-weight:500}#hkof .wrap{max-width:620px;margin:0 auto;padding:0 0 34px}"
    + "#hkof .tick{text-align:center;padding:6px 0 2px;font-size:12.5px;color:var(--go);font-weight:700;letter-spacing:.04em}"
    + "#hkof .head{text-align:center;margin-bottom:16px}#hkof h1{font-size:clamp(21px,6vw,30px);line-height:1.2;margin-bottom:7px}#hkof .sub{color:var(--muted);font-size:13px;font-weight:500;line-height:1.5;max-width:38ch;margin:0 auto}"
    + "#hkof .card{border:2px solid #000;padding:0;overflow:hidden;margin-bottom:14px}"
    + "#hkof .cardtop{background:#faf9f7;padding:12px 14px;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center;text-align:left}#hkof .thumb{width:62px;height:62px;flex:0 0 62px;object-fit:cover;background:#fff;border:1px solid var(--line)}#hkof .ct{min-width:0}#hkof .cardtop .k{font-family:'Poppins',sans-serif;font-weight:600;font-size:15px;line-height:1.25}#hkof .cardtop .m{font-size:12px;color:var(--muted);font-weight:600;margin-top:3px}"
    + "#hkof .stick{position:sticky;bottom:0;z-index:5;background:#fff;padding:10px 0 calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);margin-top:4px}"
    + "#hkof .gifts{padding:14px 16px 4px}#hkof .gifts li{list-style:none;display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.45;margin-bottom:9px}#hkof .gifts li i{flex:0 0 auto;width:16px;height:16px;border-radius:50%;background:var(--go);color:#fff;font-style:normal;font-size:10px;line-height:16px;text-align:center;font-weight:700;margin-top:2px}#hkof .gifts li b{font-weight:700}#hkof .gifts li span{color:var(--muted);font-weight:500}"
    + "#hkof .pricebox{padding:12px 16px 16px;border-top:1px solid var(--line);text-align:center}#hkof .pr{display:flex;align-items:baseline;justify-content:center;gap:9px;margin-bottom:4px}#hkof .pr .p{font-family:'Poppins',sans-serif;font-weight:600;font-size:28px}#hkof .pr .m2{color:#a8a29a;text-decoration:line-through;font-size:14px;font-weight:500}#hkof .pr .s{background:var(--go);color:#fff;font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px}#hkof .youpay{font-size:11.5px;color:var(--muted);font-weight:600}"
    + "#hkof .cta{display:block;width:100%;margin:0;padding:16px 10px;border:0;background:#111;color:#fff;font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:opacity .15s,transform .06s}#hkof .cta:active{opacity:.78;transform:translateY(1px)}#hkof .cta[disabled]{background:#cfcbc5;cursor:not-allowed}"
    + "#hkof .skip{display:block;text-align:center;margin:14px 0 4px;font-size:12.5px;color:var(--muted);font-weight:600;text-decoration:underline;cursor:pointer}"
    + "#hkof .note{border:1px dashed #c9c9c9;padding:24px 16px;text-align:center;color:var(--muted);font-size:13px;font-weight:500;line-height:1.6}#hkof .note a{color:#000}"
    + "#hkof .spin{width:24px;height:24px;border:3px solid #e5e5e5;border-top-color:#000;border-radius:50%;margin:0 auto 10px;animation:hkofspin .8s linear infinite}@keyframes hkofspin{to{transform:rotate(360deg)}}"
    + "#hkof .trust{margin-top:16px;text-align:center;font-size:11.5px;color:var(--muted);font-weight:600}";

  function getCart() {
    return fetch("/cart.js", { headers: { "Accept": "application/json" } }).then(function (r) { return r.json(); });
  }

  function findCase(cart) {
    var items = (cart && cart.items) || [];
    for (var i = 0; i < items.length; i++) {
      var t = (items[i].product_title || items[i].title || "").toLowerCase();
      if (t.indexOf(MATCH) > -1) return items[i];
    }
    return null;
  }
  function hasCombo(cart) {
    var ids = Object.keys(COMBOS).map(function (k) { return String(COMBOS[k].variant); });
    return ((cart && cart.items) || []).some(function (it) { return ids.indexOf(String(it.variant_id)) > -1; });
  }

  function goCart() { location.href = "/cart"; }

  function upgrade(item, combo, btn) {
    var model = modelOf(item.product_title || item.title);
    btn.disabled = true;
    btn.textContent = "Adding\u2026";
    var props = { "_combo": combo.tag || "anti-yellow" };
    if (model) props["Phone model"] = model;
    props["Includes"] = GIFTS.join(", ");

    /* remove the standalone case FIRST — line keys shift after an add */
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: String(item.key), quantity: 0 })
    })
      .then(function () {
        return fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(combo.variant), quantity: 1, properties: props })
        });
      })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw new Error("add " + r.status + " " + t.slice(0, 140)); });
        return r.json();
      })
      .then(function () {
        btn.textContent = "Added \u2713";
        setTimeout(goCart, 400);
      })
      .catch(function (e) {
        btn.disabled = false;
        btn.textContent = "Add combo \u2014 " + inr(combo.price);
        var d = $("hkofErr");
        if (d) { d.style.display = "block"; d.textContent = "Couldn\u2019t add: " + (e && e.message ? e.message : "unknown error"); }
      });
  }

  function render(cart) {
    var host = $("hkofBody");
    if (hasCombo(cart)) {
      host.innerHTML = '<div class="note">The combo is already in your cart.<br><a href="#" id="hkofGo">Go to cart \u2192</a></div>';
      $("hkofGo").addEventListener("click", function (e) { e.preventDefault(); goCart(); });
      return;
    }
    var item = findCase(cart);
    if (!item) {
      host.innerHTML = '<div class="note">No anti-yellow case in your cart yet.<br><a href="/pages/anti-yellow">Pick your phone \u2192</a></div>';
      return;
    }
    var combo = comboFor(item);
    if (!combo) {
      host.innerHTML = '<div class="note">This offer isn\u2019t available for that case.<br><a href="#" id="hkofGo2">Go to cart \u2192</a></div>';
      $("hkofGo2").addEventListener("click", function (e) { e.preventDefault(); goCart(); });
      return;
    }
    var model = modelOf(item.product_title || item.title);
    var paid = (item.final_line_price || item.line_price || 0) / 100;
    var extra = Math.max(0, combo.price - paid);
    var off = Math.round((combo.compareAt - combo.price) * 100 / combo.compareAt);

    host.innerHTML =
      '<div class="card">' +
      '<div class="cardtop">' +
      (item.image ? '<img class="thumb" src="' + esc(String(item.image).replace(/(\.[a-z]+)(\?|$)/i, "_200x$1$2")) + '" alt="' + esc(item.product_title || item.title) + '">' : '') +
      '<div class="ct"><div class="k">' + esc(item.product_title || item.title) + '</div>' +
      (model ? '<div class="m">For ' + esc(model) + '</div>' : '') + '</div></div>' +
      '<ul class="gifts">' +
      '<li><i>\u2713</i><span><b>Your anti-yellow case</b> \u2014 already chosen</span></li>' +
      GIFTS.map(function (g) { return '<li><i>+</i><span><b>' + esc(g) + '</b> free</span></li>'; }).join("") +
      '</ul>' +
      '<div class="pricebox">' +
      '<div class="pr"><span class="p">' + inr(combo.price) + '</span><span class="m2">' + inr(combo.compareAt) + '</span><span class="s">' + off + '% OFF</span></div>' +
      '<div class="youpay">' + (extra > 0 ? "Just " + inr(extra) + " more than the case alone" : "Same price \u2014 gifts on us") + '</div>' +
      '</div></div>' +
      '<a class="skip" id="hkofSkip">No thanks, just the case</a>' +
      '<div class="errline" id="hkofErr" style="display:none"></div>' +
      '<div class="stick"><button type="button" class="cta" id="hkofCta">Add combo \u2014 ' + inr(combo.price) + '</button></div>';

    $("hkofCta").addEventListener("click", function () { upgrade(item, combo, this); });
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
    try { document.querySelectorAll("h1").forEach(function (h) { if (!h.closest("#hkof")) { h.style.display = "none"; var sh = h.closest(".section-header"); if (sh) { sh.style.display = "none"; sh.style.margin = "0"; } } }); } catch (e) {}

    root.innerHTML =
      '<div class="wrap">' +
      '<div class="tick">\u2713 CASE ADDED TO CART</div>' +
      '<div class="head"><h1>Add 5 gifts to your case</h1>' +
      '<p class="sub">Everything your phone needs, matched to your model \u2014 in one box.</p></div>' +
      '<div id="hkofBody"><div class="note"><div class="spin"></div>Checking your cart\u2026</div></div>' +
      '<div class="trust">10% off on prepaid \u00b7 Free COD \u00b7 Easy returns</div>' +
      '</div>';

    if (!Object.keys(COMBOS).length) { $("hkofBody").innerHTML = '<div class="note">Offer not configured.</div>'; return; }
    getCart().then(render).catch(function () {
      $("hkofBody").innerHTML = '<div class="note">Couldn\u2019t read your cart. Please refresh.</div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

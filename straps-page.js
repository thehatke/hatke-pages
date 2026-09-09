/* The Hatke — "Find your watch strap" page.
   Served to the storefront via jsDelivr from thehatke/hatke-pages.
   Editing this file does NOT touch the Railway chatbot.

   Two paths:
     Apple Watch — pick the watch, pick the case size, see the straps.
     Other watch — search the model (or pick a width), then see the straps.

   Mount with: <div id="hatke-straps-root"></div>
   Data: straps-catalog.json (same repo, refreshed by strap-catalog-export.js)
   Lug table: watch-lugs.json (same repo, hand-maintained) */
(function () {
  var BASE = "https://cdn.jsdelivr.net/gh/thehatke/hatke-pages@main/";

  // Two band groups. Named after the NEWEST case sizes (Nomad's convention)
  // rather than listing every number, because 42mm belongs to BOTH groups:
  // Series 1-3 at 42mm takes the large band, Series 10 at 42mm takes the small.
  // The series list below is what actually resolves that for a customer.
  var APPLE_SIZES = [
    {
      key: "42/44/45/46/49mm", label: "46mm / Ultra", sub: "Fits 49 \u00b7 46 \u00b7 45 \u00b7 44mm, and 42mm on Series 1\u20133",
      series: ["Ultra & Ultra 2 (49mm)", "Series 10 (46mm)", "Series 9, 8, 7 (45mm)", "SE, Series 6, 5, 4 (44mm)", "Series 3, 2, 1 (42mm)"]
    },
    {
      key: "38/40/41mm", label: "42mm / 41mm", sub: "Fits 42mm on Series 10, and 41 \u00b7 40 \u00b7 38mm",
      series: ["Series 10 (42mm)", "Series 9, 8, 7 (41mm)", "SE, Series 6, 5, 4 (40mm)", "Series 3, 2, 1 (38mm)"]
    }
  ];
  // Non-Apple fit options come from the catalogue, so a fit with no products
  // never shows and a new one (Mi Band, 18mm...) appears on its own.
  var FIT_LABEL = { "mi-band": "Mi Band", "18mm": "18mm", "19mm": "19mm", "20mm": "20mm", "22mm": "22mm" };
  function fitOptions() {
    var seen = {}, out = [];
    (DATA.products || []).forEach(function (p) {
      if (!p.fit || p.fit === "apple" || seen[p.fit]) return;
      seen[p.fit] = 1; out.push(p.fit);
    });
    return out.sort(function (a, b) {
      var na = parseInt(a, 10), nb = parseInt(b, 10);
      if (isNaN(na) && isNaN(nb)) return a.localeCompare(b);
      if (isNaN(na)) return 1;
      if (isNaN(nb)) return -1;
      return na - nb;
    });
  }

  var DATA = null, LUGTBL = null;
  var state = { fit: null, size: null, style: null };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function money(n) { return "\u20B9" + Math.round(n); }
  function titleCase(s) { return String(s).replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }

  var CSS = "#hs{--muted:#6b6b6b;--line:#e5e5e5;font-family:'Montserrat',sans-serif;font-weight:600;color:#000;background:#fff;-webkit-text-size-adjust:100%}#hs *{box-sizing:border-box;margin:0;padding:0}#hs h1,#hs h2{font-family:'Poppins',sans-serif;font-weight:500}#hs .wrap{max-width:1100px;margin:0 auto;padding:0 0 28px}#hs .head{text-align:center;margin-bottom:16px}#hs h1{font-size:clamp(21px,6vw,32px);line-height:1.2;margin-bottom:6px}#hs .intro{color:var(--muted);font-size:12px;font-weight:500;max-width:42ch;margin:0 auto;line-height:1.5}#hs .steps{display:flex;justify-content:center;gap:6px;margin:14px 0 18px;flex-wrap:wrap}#hs .step{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#c4c4c4;display:flex;align-items:center;gap:6px}#hs .step.on{color:#000}#hs .step.done{color:var(--muted)}#hs .step i{font-style:normal;width:17px;height:17px;border-radius:50%;border:1.5px solid currentColor;display:inline-flex;align-items:center;justify-content:center;font-size:9.5px}#hs .step.on i{background:#000;color:#fff;border-color:#000}#hs .sep{color:#dcdcdc;font-size:10px}#hs .sec{margin-bottom:22px}#hs .sec h2{font-size:16px;text-align:center;margin-bottom:2px}#hs .rule{width:40px;height:2px;background:#000;margin:8px auto 14px}#hs .pick{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-width:560px;margin:0 auto}@media(min-width:520px){#hs .pick.lugs{grid-template-columns:repeat(4,1fr)}}#hs .opt{border:1px solid var(--line);background:#fff;color:#000;padding:16px 12px;text-align:center;cursor:pointer;font-family:inherit;font-weight:600;display:flex;flex-direction:column;gap:3px;min-height:74px;justify-content:center}#hs .opt .l{font-family:'Poppins',sans-serif;font-weight:500;font-size:17px;line-height:1.2}#hs .opt .s{font-size:10.5px;color:var(--muted);font-weight:600}#hs .opt:active{background:#fafafa;border-color:#000}@media(hover:hover){#hs .opt:hover{border-color:#000}}#hs .search{max-width:460px;margin:0 auto}#hs .search input{width:100%;border:1.5px solid #000;padding:13px 12px;font-size:16px;font-family:'Montserrat',sans-serif;font-weight:600;border-radius:0;outline:none}#hs .hint{text-align:center;color:var(--muted);font-size:11.5px;font-weight:500;margin-top:9px;line-height:1.5}#hs .sug{max-width:460px;margin:6px auto 0;border:1px solid var(--line);max-height:230px;overflow:auto}#hs .sug button{display:block;width:100%;text-align:left;background:#fff;border:0;border-bottom:1px solid var(--line);padding:11px 12px;font:600 14px 'Montserrat',sans-serif;cursor:pointer}#hs .sug button:last-child{border-bottom:0}#hs .sug button:active{background:#f6f6f6}#hs .sug .w{float:right;color:var(--muted);font-size:11.5px;font-weight:700}#hs .chips{display:flex;gap:6px;overflow-x:auto;padding:0 0 10px;margin-bottom:6px;-webkit-overflow-scrolling:touch}#hs .chips::-webkit-scrollbar{display:none}#hs .chip{flex:0 0 auto;border:1px solid var(--line);background:#fff;padding:7px 13px;font:600 12px 'Montserrat',sans-serif;cursor:pointer;white-space:nowrap}#hs .chip.on{background:#000;color:#fff;border-color:#000}#hs .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}@media(min-width:520px){#hs .grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:900px){#hs .grid{grid-template-columns:repeat(4,1fr);gap:10px}}#hs .p{border:1px solid var(--line);background:#fff;color:#000;text-decoration:none;display:flex;flex-direction:column;position:relative}#hs .p .im{aspect-ratio:1/1;background:#f7f7f7;overflow:hidden;display:block}#hs .p .im img{width:100%;height:100%;object-fit:cover;display:block}#hs .p .b{padding:9px 10px 11px;display:flex;flex-direction:column;gap:3px}#hs .p .n{font-family:'Poppins',sans-serif;font-weight:500;font-size:13px;line-height:1.3}#hs .p .pr{font-size:12.5px;font-weight:700}#hs .p:active{border-color:#000}@media(hover:hover){#hs .p:hover{border-color:#000}}#hs .soon{position:absolute;top:6px;right:6px;font:800 8.5px/1 'Montserrat',sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:4px 6px;border-radius:3px;background:#111;color:#fff}#hs .navbar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);margin-bottom:14px;padding:9px 0}#hs .back{display:inline-block;font-size:13px;font-weight:700;color:#000;padding:4px 2px;cursor:pointer;background:0;border:0;font-family:inherit}#hs .back:active{opacity:.6}#hs .opt.tall{min-height:0;padding:18px 14px;gap:5px}#hs .srs{display:flex;flex-direction:column;gap:4px;margin:8px 0 6px;padding:9px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}#hs .sr{font-size:11.5px;font-weight:600;color:#000;line-height:1.35}#hs .note{border:1px dashed #c9c9c9;padding:22px 16px;text-align:center;color:var(--muted);font-size:13px;font-weight:500;line-height:1.6}#hs .spin{width:24px;height:24px;border:3px solid #e5e5e5;border-top-color:#000;border-radius:50%;margin:0 auto 8px;animation:hsspin .8s linear infinite}@keyframes hsspin{to{transform:rotate(360deg)}}#hs .banner{border:1px solid #000;background:#fffbe6;padding:10px 12px;font-size:11.5px;font-weight:600;text-align:center;margin-bottom:14px}";

  function getJSON(file) {
    return fetch(BASE + file, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(file + " http " + r.status);
      return r.json();
    });
  }

  function forApple(size) {
    return (DATA.products || []).filter(function (p) {
      if (p.fit !== "apple") return false;
      return p.v.some(function (v) { return v.size === size; });
    });
  }
  function forLug(w) {
    return (DATA.products || []).filter(function (p) { return p.fit === w; });
  }
  function variantFor(p, size) {
    if (!size) return p.v[0];
    for (var i = 0; i < p.v.length; i++) if (p.v[i].size === size) return p.v[i];
    return p.v[0];
  }
  function buyable(p, size) {
    var v = variantFor(p, size);
    return p.live && v && v.avail && v.qty > 0;
  }
  function stylesOf(list) {
    var seen = {}, out = [];
    list.forEach(function (p) { if (p.style && !seen[p.style]) { seen[p.style] = 1; out.push(p.style); } });
    return out.sort();
  }

  function steps() {
    var atResults = !!(state.fit && state.size);
    var s1 = state.fit ? "done" : "on";
    var s2 = !state.fit ? "" : (state.size ? "done" : "on");
    var s3 = atResults ? "on" : "";
    return '<div class="steps">' +
      '<span class="step ' + s1 + '"><i>1</i>Your watch</span><span class="sep">\u203A</span>' +
      '<span class="step ' + s2 + '"><i>2</i>Size</span><span class="sep">\u203A</span>' +
      '<span class="step ' + s3 + '"><i>3</i>Straps</span></div>';
  }

  function chooseWatch() {
    return '<section class="sec"><h2>Which watch do you have?</h2><div class="rule"></div>' +
      '<div class="pick">' +
      '<button class="opt" data-fit="apple"><span class="l">Apple Watch</span><span class="s">All series \u203a</span></button>' +
      '<button class="opt" data-fit="other"><span class="l">Other watch</span><span class="s">Samsung, Noise, boAt\u2026 \u203a</span></button>' +
      '</div></section>';
  }

  function chooseAppleSize() {
    var opts = APPLE_SIZES.map(function (s) {
      var n = forApple(s.key).length;
      var series = (s.series || []).map(function (x) {
        return '<span class="sr">' + esc(x) + '</span>';
      }).join("");
      return '<button class="opt tall" data-size="' + esc(s.key) + '">' +
        '<span class="l">' + esc(s.label) + '</span>' +
        '<span class="s">' + esc(s.sub) + '</span>' +
        '<span class="srs">' + series + '</span>' +
        '<span class="s">' + n + ' straps \u203a</span></button>';
    }).join("");
    return '<button class="back" data-back="fit">\u2190 Change watch</button>' +
      '<section class="sec"><h2>Which Apple Watch do you have?</h2><div class="rule"></div>' +
      '<div class="pick">' + opts + '</div>' +
      '<p class="hint">Find your series above. The lug area hasn\u2019t changed across Apple Watch generations, so any strap in your group fits \u2014 or check the case size printed on the back of your watch.</p></section>';
  }

  function chooseOther() {
    var lugOpts = fitOptions().map(function (w) {
      var n = forLug(w).length;
      return '<button class="opt" data-lug="' + esc(w) + '"><span class="l">' + esc(FIT_LABEL[w] || w) + '</span><span class="s">' + n + ' straps \u203a</span></button>';
    }).join("");
    var hasTable = !!(LUGTBL && LUGTBL.watches && LUGTBL.watches.length);
    var searchBlock = hasTable
      ? '<section class="sec"><h2>Find your strap size</h2><div class="rule"></div>' +
        '<div class="search"><input id="hsQ" type="search" autocomplete="off" placeholder="Search your watch, e.g. Noise ColorFit Pro 4" aria-label="Search your watch model"></div>' +
        '<div class="sug" id="hsSug" hidden></div>' +
        '<p class="hint">Can\u2019t find it? Measure the gap where the strap meets the case, in millimetres.</p></section>'
      : "";
    return '<button class="back" data-back="fit">\u2190 Change watch</button>' + searchBlock +
      '<section class="sec"><h2>' + (hasTable ? "Or choose the width" : "Choose your strap width") + '</h2><div class="rule"></div>' +
      '<div class="pick lugs">' + lugOpts + '</div>' +
      (hasTable ? "" : '<p class="hint">The width is the gap where the strap meets the watch case \u2014 often printed on the back of the watch.</p>') +
      '</section>';
  }

  function card(p, size) {
    var v = variantFor(p, size);
    var ok = buyable(p, size);
    var img = p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.t) + '" loading="lazy" width="400" height="400">' : "";
    var flag = ok ? "" : '<span class="soon">Coming soon</span>';
    var inner = '<span class="im">' + img + '</span><span class="b"><span class="n">' + esc(p.t) + '</span><span class="pr">' + money(v.price) + '</span></span>' + flag;
    return ok
      ? '<a class="p" href="/products/' + esc(p.h) + '">' + inner + '</a>'
      : '<span class="p" aria-disabled="true">' + inner + '</span>';
  }

  function results() {
    var size = state.size, list, heading;
    if (state.fit === "apple") {
      list = forApple(size);
      var meta = APPLE_SIZES.filter(function (s) { return s.key === size; })[0];
      heading = "Apple Watch \u2014 " + (meta ? meta.label : size);
    } else {
      list = forLug(size);
      heading = (FIT_LABEL[size] || size) + " straps";
    }
    var all = list.slice();
    if (state.style) list = list.filter(function (p) { return p.style === state.style; });

    var chips = '<div class="chips"><button class="chip' + (state.style ? "" : " on") + '" data-style="">All</button>' +
      stylesOf(all).map(function (s) {
        return '<button class="chip' + (state.style === s ? " on" : "") + '" data-style="' + esc(s) + '">' + esc(titleCase(s.replace(/-/g, " "))) + '</button>';
      }).join("") + '</div>';

    var body = list.length
      ? '<div class="grid">' + list.map(function (p) { return card(p, state.fit === "apple" ? size : null); }).join("") + '</div>'
      : '<div class="note">No straps in this style yet.</div>';

    var banner = DATA.allDraft
      ? '<div class="banner">Preview \u2014 these straps aren\u2019t on sale yet. Layout and links are live for review.</div>' : "";

    return '<button class="back" data-back="size">\u2190 Change size</button>' + banner +
      '<section class="sec"><h2>' + esc(heading) + '</h2><div class="rule"></div>' + chips + body +
      '<p class="hint">Showing ' + list.length + ' of ' + all.length + ' straps</p></section>';
  }

  function render() {
    var host = $("hsBody");
    var html = steps();
    if (!state.fit) html += chooseWatch();
    else if (state.fit === "apple" && !state.size) html += chooseAppleSize();
    else if (state.fit === "other" && !state.size) html += chooseOther();
    else html += results();
    host.innerHTML = html;
    wire();
  }

  function wire() {
    var host = $("hsBody");
    function on(sel, fn) {
      host.querySelectorAll(sel).forEach(function (b) { b.addEventListener("click", function () { fn(b); }); });
    }
    on("[data-fit]", function (b) { state.fit = b.getAttribute("data-fit"); state.size = null; state.style = null; render(); });
    on("[data-size]", function (b) { state.size = b.getAttribute("data-size"); state.style = null; render(); });
    on("[data-lug]", function (b) { state.size = b.getAttribute("data-lug"); state.style = null; render(); });
    on("[data-style]", function (b) { state.style = b.getAttribute("data-style") || null; render(); });
    on("[data-back]", function (b) {
      if (b.getAttribute("data-back") === "fit") { state.fit = null; }
      state.size = null; state.style = null; render();
    });
    var q = $("hsQ");
    if (q) q.addEventListener("input", onSearch);
  }

  function onSearch() {
    var box = $("hsSug"), term = ($("hsQ").value || "").toLowerCase().trim();
    if (term.length < 2 || !LUGTBL) { box.hidden = true; box.innerHTML = ""; return; }
    var hits = (LUGTBL.watches || []).filter(function (w) {
      return ((w.b ? w.b + " " : "") + w.n).toLowerCase().indexOf(term) > -1;
    }).slice(0, 12);
    box.hidden = false;
    if (!hits.length) {
      box.innerHTML = '<div style="padding:14px 12px;font-size:12.5px;color:#6b6b6b;font-weight:500;line-height:1.6">' +
        'That model isn\u2019t listed yet. Check the strap width on the back of your watch, then pick it below.</div>';
      return;
    }
    box.innerHTML = hits.map(function (w) {
      return '<button data-w="' + esc(w.w) + '">' + esc((w.b ? w.b + " " : "") + w.n) + '<span class="w">' + esc(w.w) + '</span></button>';
    }).join("");
    box.querySelectorAll("[data-w]").forEach(function (b) {
      b.addEventListener("click", function () { state.size = b.getAttribute("data-w"); state.style = null; render(); });
    });
  }

  function start() {
    var root = document.getElementById("hatke-straps-root");
    if (!root) return;
    var f = document.createElement("link");
    f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap";
    document.head.appendChild(f);
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    root.id = "hs";
    try {
      document.querySelectorAll("h1").forEach(function (h) {
        if (!h.closest("#hs")) { h.style.display = "none"; var sh = h.closest(".section-header"); if (sh) { sh.style.display = "none"; sh.style.margin = "0"; } }
      });
    } catch (e) {}

    root.innerHTML = '<div class="wrap"><div class="head"><h1>Find your watch strap</h1>' +
      '<p class="intro">Tell us your watch and we\u2019ll show the straps that fit it.</p></div>' +
      '<div id="hsBody"><div class="note"><div class="spin"></div>Loading straps\u2026</div></div></div>';

    Promise.all([
      getJSON("straps-catalog.json"),
      getJSON("watch-lugs.json").catch(function () { return { watches: [] }; })
    ]).then(function (r) {
      DATA = r[0]; LUGTBL = r[1];
      if (!DATA || !DATA.products || !DATA.products.length) throw new Error("empty catalogue");
      render();
    }).catch(function (e) {
      $("hsBody").innerHTML = '<div class="note">Couldn\u2019t load straps right now. Please refresh.</div>';
      if (window.console) console.warn("[straps]", e.message);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

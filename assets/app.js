/* Chaulas Wale Hakim Ji storefront. Plain JavaScript, no libraries.
   Content comes from data.js; the 3D models come from viewer3d.js.
   Routes use the hash (#/shop) so the site works in any folder. */
(function () {
  'use strict';

  var D = window.CWHJ;
  var app = document.getElementById('app');
  var overlays = document.getElementById('overlays');
  var toastEl = document.getElementById('toast');

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function media(name) { return (window.__MEDIA && window.__MEDIA[name]) || 'media/' + name; }
  function money(n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); }
  function product(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function cutout(p) { return p.small ? p.gallery[1].src : p.gallery[0].src; }
  function model(id) { return (typeof spatialModelData !== 'undefined' && spatialModelData[id]) || null; }

  var PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/>',
    bag: '<path d="M5 8h14l1 13H4L5 8Z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/>',
    menu: '<path d="M3 7h18M3 12h18M3 17h18"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    leaf: '<path d="M20 4C10 3 4 8 4 15c0 3 2 5 5 5 7 0 11-6 11-16Z"/><path d="M4 20c3-6 7-9 12-12"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    bottle: '<path d="M10 2h4v4l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3V2Z"/><path d="M8 13h8"/>',
    gift: '<path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14"/><path d="M12 7C8 7 7 3 9.5 2.5 11.5 2 12 5 12 7Zm0 0c4 0 5-4 2.5-4.5C12.5 2 12 5 12 7Z"/>',
    book: '<path d="M12 6C9.5 4 6.5 4 4 5v14c2.5-1 5.5-1 8 1 2.5-2 5.5-2 8-1V5c-2.5-1-5.5-1-8 1Zm0 0v14"/>',
    label: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8M12 17v.2"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5M11 8v6M8 11h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
    cube: '<path d="M12 3 4 7.5v9l8 4.5 8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>'
  };
  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (PATHS[name] || PATHS.leaf) + '</svg>';
  }

  /* ---------- storage and state ---------- */
  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable: bag lasts for this visit */ }
    }
  };
  var BAG_KEY = 'cwhj:bag:v1';
  var OFFER_KEY = 'cwhj:offer:v7';
  var MAX_QTY = 20;

  function cleanCart(raw) {
    if (!Array.isArray(raw)) return [];
    var seen = {};
    return raw.filter(function (l) {
      var ok = l && product(l.id) && Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY && !seen[l.id];
      if (ok) seen[l.id] = true;
      return ok;
    }).map(function (l) { return { id: l.id, qty: l.qty }; });
  }

  var cart = cleanCart(store.get(BAG_KEY, []));
  var coupon = store.get(OFFER_KEY, '') === D.offer.code ? D.offer.code : '';
  var route = { path: '/', query: new URLSearchParams() };
  var qty = 1;
  var galleryIndex = 0;          /* a number, or '3d' for the 3D view */
  var lightboxIndex = 0;
  var home3D = D.products[0].id; /* product shown in the homepage 3D showcase */
  var shopFilter = 'all';
  var shopSort = 'featured';
  var checkoutDone = false;
  var overlay = '';
  var opener = null;
  var slideIndex = 0;
  var slideTimer = 0;
  var buyObserver = null;
  var toastTimer = 0;
  var viewers = [];
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function saveCart() { store.set(BAG_KEY, cart); }
  function cartCount() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function totals() {
    var subtotal = cart.reduce(function (n, l) { return n + product(l.id).price * l.qty; }, 0);
    var discount = coupon ? Math.round(subtotal * D.offer.percent / 100) : 0;
    return { subtotal: subtotal, discount: discount, total: subtotal - discount };
  }
  function addToCart(id, amount) {
    var p = product(id);
    if (!p) return false;
    var line = cart.filter(function (l) { return l.id === id; })[0];
    var next = (line ? line.qty : 0) + amount;
    if (next > MAX_QTY) { toast('You can add up to ' + MAX_QTY + ' of each product.'); return false; }
    if (line) line.qty = next; else cart.push({ id: id, qty: amount });
    saveCart();
    syncCart();
    return true;
  }

  /* ---------- shared pieces ---------- */
  var NAV = [['Home', '/'], ['Shop', '/shop'], ['Gift sets', '/gift-sets'], ['Our story', '/our-story'], ['Blog', '/journal'], ['Contact', '/contact']];

  function announcement() {
    var items = '';
    for (var i = 0; i < 3; i++) {
      items += D.announcements.map(function (t) { return '<span class="marquee__item">' + icon('leaf') + esc(t) + '</span>'; }).join('');
    }
    return '<div class="marquee" role="region" aria-label="Announcements"><div class="marquee__track">' +
      '<div class="marquee__group">' + items + '</div><div class="marquee__group" aria-hidden="true">' + items + '</div></div></div>';
  }

  function header() {
    var cur = route.path;
    function isCurrent(to) {
      if (to === '/shop') return cur === '/shop' || cur.indexOf('/products/') === 0;
      if (to === '/journal') return cur.indexOf('/journal') === 0 || cur === '/blog';
      return cur === to;
    }
    var count = cartCount();
    return '<header class="header"><div class="wrap header__bar">' +
      '<a class="header__logo" href="#/" data-link aria-label="Chaulas Wale Hakim Ji, home"><img src="' + media('logo.webp') + '" alt="Chaulas Wale Hakim Ji" width="560" height="500"></a>' +
      '<nav class="nav" aria-label="Main">' + NAV.map(function (n) {
        return '<a href="#' + n[1] + '" data-link' + (isCurrent(n[1]) ? ' aria-current="page"' : '') + '>' + n[0] + '</a>';
      }).join('') + '</nav>' +
      '<div class="header__tools"><button class="tool" data-act="open-search" aria-label="Search">' + icon('search') + '</button>' +
      '<button class="tool" data-act="open-cart" aria-label="Open bag, ' + count + ' items">' + icon('bag') +
      '<span class="tool__count" data-cart-count' + (count ? '' : ' hidden') + '>' + count + '</span></button>' +
      '<button class="tool menu-btn" data-act="open-menu" aria-label="Open menu">' + icon('menu') + '</button></div>' +
      '</div></header>';
  }

  function footer() {
    function li(name, to) { return '<li><a href="#' + to + '" data-link>' + name + '</a></li>'; }
    return '<section class="news section"><div class="wrap news__grid">' +
      '<div><h2 class="caps h-lg">Notes from the house</h2><p class="lede" style="margin-top:10px">Thoughtful reading and a closer look at our world, now and then.</p></div>' +
      '<form data-form="newsletter"><label class="label" for="news-email">Your email address</label>' +
      '<div class="field-row"><input class="input" id="news-email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required maxlength="254">' +
      '<button class="btn" type="submit">Subscribe</button></div><p class="form-msg" role="status"></p></form></div></section>' +
      '<footer class="footer"><div class="wrap"><div class="footer__grid">' +
      '<div class="footer__brand"><img src="' + media('logo.webp') + '" alt="Chaulas Wale Hakim Ji" width="560" height="500" loading="lazy">' +
      '<p>A ' + esc(D.brand.parent) + ' brand, with Ayurvedic heritage dating to ' + D.brand.since + '.</p></div>' +
      '<div><h3 class="caps">Shop</h3><ul>' + D.products.map(function (p) { return li(esc(p.name), '/products/' + p.id); }).join('') + li('Gift sets', '/gift-sets') + '</ul></div>' +
      '<div><h3 class="caps">Explore</h3><ul>' + li('Our story', '/our-story') + li('Ayurveda', '/ayurveda') + li('Blog', '/journal') + li('Licences and certifications', '/licences') + '</ul></div>' +
      '<div><h3 class="caps">Help</h3><ul>' + li('FAQs', '/faqs') + li('Shipping', '/shipping') + li('Returns', '/returns') + li('Privacy', '/privacy') + li('Terms', '/terms') + li('Contact', '/contact') + '</ul></div>' +
      '</div><div class="footer__base">' +
      '<p>This website is a preview. Prices are demonstration values, product details are awaiting approval, and checkout takes no payment.</p>' +
      '<p>Nothing here is medical advice. Speak to a qualified healthcare professional about your own health.</p>' +
      '<p>\u00A9 2026 Chaulas Wale Hakim Ji. A ' + esc(D.brand.parent) + ' brand.</p></div></div></footer>';
  }

  function pageHead(title, lede, crumbs) {
    return '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/" data-link>Home</a>' +
      (crumbs || []).map(function (c) { return '<span aria-hidden="true">/</span><a href="#' + c[1] + '" data-link>' + esc(c[0]) + '</a>'; }).join('') +
      '<span aria-hidden="true">/</span><span aria-current="page">' + esc(title) + '</span></nav>' +
      '<h1 class="caps h-lg">' + esc(title) + '</h1>' + (lede ? '<p class="lede">' + esc(lede) + '</p>' : '') + '</div></div>';
  }
  function secHead(title, text) {
    return '<div class="sec-head"><h2 class="caps h-lg">' + esc(title) + '</h2>' + (text ? '<p class="lede">' + esc(text) + '</p>' : '') + '</div>';
  }
  function pending(text, cls) { return '<p class="pending' + (cls ? ' ' + cls : '') + '">' + icon('info') + '<span>' + esc(text) + '</span></p>'; }
  function acc(title, body, open) {
    return '<details class="acc"' + (open ? ' open' : '') + '><summary>' + esc(title) + icon('plus') + '</summary><div class="acc__body">' + body + '</div></details>';
  }
  function qtyControl(ctx, id, value) {
    return '<div class="qty" role="group" aria-label="Quantity">' +
      '<button data-act="qty" data-ctx="' + ctx + '" data-id="' + id + '" data-d="-1" aria-label="Decrease quantity"' + (value <= 1 ? ' disabled' : '') + '>' + icon('minus') + '</button>' +
      '<output aria-live="polite">' + value + '</output>' +
      '<button data-act="qty" data-ctx="' + ctx + '" data-id="' + id + '" data-d="1" aria-label="Increase quantity"' + (value >= MAX_QTY ? ' disabled' : '') + '>' + icon('plus') + '</button></div>';
  }

  function card(p) {
    return '<article class="card">' +
      '<a class="card__tile' + (p.small ? ' card__tile--small' : '') + '" href="#/products/' + p.id + '" data-link aria-label="' + esc(p.name) + '">' +
      '<span class="card__tag">' + p.form + '</span><img src="' + media(cutout(p)) + '" alt="' + esc(p.name) + ' ' + p.form.toLowerCase() + '" loading="lazy"></a>' +
      '<div class="card__body"><h3 class="card__name"><a href="#/products/' + p.id + '" data-link>' + esc(p.name) + '</a></h3>' +
      '<p class="card__price">' + money(p.price) + ' <small>Demo price</small></p>' +
      '<button class="btn btn--block" data-act="add" data-id="' + p.id + '">Add to cart</button></div></article>';
  }
  function promoCard() {
    return '<article class="card card--promo"><a class="card__tile" href="#/gift-sets" data-link aria-label="Gift sets">' +
      '<img src="' + media('ref-gift-paper-original.jpg') + '" alt="Parchment gift box" loading="lazy"></a>' +
      '<div class="card__body"><h3 class="card__name"><a href="#/gift-sets" data-link>Gift sets</a></h3>' +
      '<p class="card__meta">Three gift-box designs</p><p class="card__price"><small>Contents and prices to be confirmed</small></p>' +
      '<a class="btn btn--ghost btn--block" href="#/gift-sets" data-link>Explore gift sets</a></div></article>';
  }
  function giftCard(g) {
    return '<article class="gift"><div class="gift__img"><img src="' + media(g.image) + '" alt="' + esc(g.name) + '" loading="lazy"></div>' +
      '<h3>' + esc(g.name) + '</h3><p>' + esc(g.text) + '</p></article>';
  }
  function readTime(a) {
    var words = (a.intro + ' ' + a.sections.map(function (s) { return s[1]; }).join(' ')).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) + ' min read';
  }
  function postMeta(a) {
    return '<p class="post__meta"><span class="post__cat">' + esc(a.category) + '</span><span>' + readTime(a) + '</span></p>';
  }
  function postCard(a) {
    return '<article class="post"><a class="post__img" href="#/journal/' + a.slug + '" data-link tabindex="-1" aria-hidden="true"><img src="' + media(a.image) + '" alt="" loading="lazy"></a>' +
      postMeta(a) + '<h3><a href="#/journal/' + a.slug + '" data-link>' + esc(a.title) + '</a></h3>' +
      '<p>' + esc(a.intro) + '</p><p><a class="link" href="#/journal/' + a.slug + '" data-link>Read article</a></p></article>';
  }

  /* ---------- 3D viewer markup ---------- */
  function viewerMarkup(p) {
    var cfg = model(p.id);
    var part = cfg && cfg.type === 'jar' ? 'lid' : cfg && cfg.type === 'dropper' ? 'dropper' : 'cap';
    return '<div class="v3d" data-3d="' + p.id + '" data-part="' + part + '"><div class="v3d__stage">' +
      '<img class="v3d__poster" src="' + media(cutout(p)) + '" alt="' + esc(p.name) + '">' +
      '<canvas class="v3d__canvas" tabindex="0" role="img" aria-label="3D model of ' + esc(p.name) + '. Drag, or use the left and right arrow keys, to turn it."></canvas>' +
      '<span class="v3d__status" data-3d-status>Loading 3D</span></div>' +
      '<div class="v3d__tools"><button class="chip" data-act="3d-open" aria-pressed="false">Open ' + part + '</button>' +
      '<button class="chip" data-act="3d-turn">Turn around</button><button class="chip" data-act="3d-reset">Reset</button></div></div>';
  }
  function showcase3D() {
    var p = product(home3D);
    return '<div class="show3d__stage">' + viewerMarkup(p) + '</div>' +
      '<div class="show3d__text"><h2 class="caps h-lg">A closer look, in 3D</h2>' +
      '<p class="lede">Drag to turn it around. Open it to look inside.</p>' +
      '<div class="pills" role="group" aria-label="Choose a product to view in 3D">' + D.products.map(function (x) {
        return '<button class="pill" data-act="3d-pick" data-id="' + x.id + '" aria-pressed="' + (x.id === p.id) + '">' + esc(x.name) + '</button>';
      }).join('') + '</div>' +
      '<p class="show3d__name">' + esc(p.name) + '<span>' + money(p.price) + '</span></p>' +
      '<div class="slide__cta"><button class="btn" data-act="add" data-id="' + p.id + '">Add to cart</button>' +
      '<a class="btn btn--ghost" href="#/products/' + p.id + '" data-link>View product</a></div>' +
      '<p class="note">A 3D mockup made from the product image. The back and exact proportions are illustrative.</p></div>';
  }

  /* ---------- pages ---------- */
  function home() {
    var hero = '<section class="hero" aria-roledescription="carousel" aria-label="Highlights">' +
      '<h1 class="sr-only">Chaulas Wale Hakim Ji: Ayurvedic formulations since 1939</h1><div class="hero__stack">' +
      D.slides.map(function (s, i) {
        return '<div class="slide' + (i === 0 ? ' is-active' : '') + '"' + (i === 0 ? '' : ' aria-hidden="true"') + '>' +
          '<div class="slide__text">' +
          '<p class="slide__title caps h-xl">' + esc(s.title) + '</p><p class="slide__sub">' + esc(s.sub) + '</p>' +
          '<div class="slide__cta"><a class="btn btn--light" href="#' + s.primary.to + '" data-link>' + esc(s.primary.label) + '</a>' +
          (s.secondary ? '<a class="btn btn--line-light" href="#' + s.secondary.to + '" data-link>' + esc(s.secondary.label) + '</a>' : '') + '</div></div>' +
          '<div class="slide__media"><img src="' + media(s.image) + '" alt="' + esc(s.alt) + '"' + (s.pos ? ' style="object-position:' + s.pos + '"' : '') + (i === 0 ? ' fetchpriority="high"' : '') + '></div></div>';
      }).join('') + '</div><div class="hero__nav"><div class="hero__dots" role="group" aria-label="Choose a slide">' +
      D.slides.map(function (s, i) {
        return '<button class="dot" data-act="slide" data-index="' + i + '" aria-label="Slide ' + (i + 1) + ': ' + esc(s.title) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>';
      }).join('') + '</div></div></section>';

    var usp = '<section class="usp"><div class="wrap usp__grid">' + D.usps.map(function (u) {
      return '<div class="usp__item">' + icon(u.icon) + '<div><strong>' + esc(u.title) + '</strong><span>' + esc(u.text) + '</span></div></div>';
    }).join('') + '</div></section>';

    var collection = '<section class="section"><div class="wrap">' + secHead('Meet the collection', 'Five formulations from the house of Chaulas Wale Hakim Ji.') +
      '<div class="products">' + D.products.map(card).join('') + promoCard() + '</div>' +
      '<div class="sec-foot"><a class="btn btn--ghost" href="#/shop" data-link>View all products</a></div></div></section>';

    var threeD = '<section class="section" style="padding-top:0"><div class="wrap show3d" id="show3d">' + showcase3D() + '</div></section>';

    var heritage = '<section class="split"><div class="split__media"><img src="' + media('ref-ras-e-faulad-original.jpg') + '" alt="Ras e Faulad dropper bottle and carton on a wooden table" loading="lazy" style="object-position:56% 50%"></div>' +
      '<div class="split__text"><p class="tagline">Our story</p><h2 class="caps h-lg">1939 heritage. 2026 experience.</h2>' +
      '<p>Chaulas Wale Hakim Ji is a family Ayurvedic business with heritage dating to 1939, and a ' + esc(D.brand.parent) + ' brand.</p>' +
      '<a class="btn" href="#/our-story" data-link>See our journey</a></div></section>';

    var way = '<section class="section"><div class="wrap">' + secHead('The Hakim Ji way') + '<div class="principles">' + D.principles.map(function (x) {
      return '<div class="principle">' + icon(x.icon) + '<h3 class="caps">' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div>';
    }).join('') + '</div></div></section>';

    var scenes = '<section class="section section--mist"><div class="wrap">' + secHead('Seen in the apothecary', 'Three of the collection, in their setting.') +
      '<div class="scenes">' + D.products.filter(function (p) { return p.scene; }).map(function (p) {
        return '<article class="scene"><img src="' + media(p.scene) + '" alt="' + esc(p.name) + ' in its apothecary setting" loading="lazy"' + (p.pos ? ' style="object-position:' + p.pos + '"' : '') + '>' +
          '<div class="scene__chip"><div><strong><a href="#/products/' + p.id + '" data-link>' + esc(p.name) + '</a></strong><span>' + money(p.price) + '</span></div>' +
          '<button class="btn btn--sm" data-act="add" data-id="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to cart">Add</button></div></article>';
      }).join('') + '</div></div></section>';

    var gifts = '<section class="section"><div class="wrap">' + secHead('The gift of Ayurvedic tradition', 'Three gift-box designs. Contents, prices and availability will be confirmed before sale.') +
      '<div class="gifts">' + D.gifts.map(giftCard).join('') + '</div>' +
      '<div class="sec-foot"><a class="btn btn--ghost" href="#/gift-sets" data-link>Explore gift sets</a></div></div></section>';

    var blog = '<section class="section section--mist"><div class="wrap">' + secHead('From the blog', D.blog.lede) +
      '<div class="posts">' + D.articles.map(postCard).join('') + '</div>' +
      '<div class="sec-foot"><a class="btn btn--ghost" href="#/journal" data-link>Read the blog</a></div></div></section>';

    var faq = '<section class="section"><div class="wrap">' + secHead('Questions, answered') + '<div class="faq">' +
      D.faqs.slice(0, 4).map(function (f, i) { return acc(f[0], '<p>' + esc(f[1]) + '</p>', i === 0); }).join('') +
      '</div><div class="sec-foot"><a class="link" href="#/faqs" data-link>See all questions</a></div></div></section>';

    return hero + usp + collection + threeD + heritage + way + scenes + gifts + blog + faq;
  }

  function shop() {
    var term = (route.query.get('q') || '').trim().toLowerCase();
    var list = D.products.filter(function (p) {
      return (shopFilter === 'all' || p.form === shopFilter) && (!term || p.name.toLowerCase().indexOf(term) >= 0);
    });
    if (shopSort === 'low') list = list.slice().sort(function (a, b) { return a.price - b.price; });
    if (shopSort === 'high') list = list.slice().sort(function (a, b) { return b.price - a.price; });
    if (shopSort === 'name') list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var pills = [['all', 'All'], ['Bottle', 'Bottles'], ['Jar', 'Jars']].map(function (x) {
      return '<button class="pill" data-act="filter" data-v="' + x[0] + '" aria-pressed="' + (shopFilter === x[0]) + '">' + x[1] + '</button>';
    }).join('');
    var options = [['featured', 'Featured'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['name', 'Name: A to Z']].map(function (x) {
      return '<option value="' + x[0] + '"' + (shopSort === x[0] ? ' selected' : '') + '>' + x[1] + '</option>';
    }).join('');
    var grid = list.length
      ? '<div class="products">' + list.map(card).join('') + (shopFilter === 'all' && !term && shopSort === 'featured' ? promoCard() : '') + '</div>'
      : '<div class="empty">' + icon('search') + '<h2 class="caps h-md">No products found</h2><p class="note">Try another name or a different format.</p>' +
        '<a class="btn" href="#/shop" data-link data-reset-shop>Show all products</a></div>';
    return pageHead('Shop all', 'Five formulations from the house of Chaulas Wale Hakim Ji.') +
      '<section class="section"><div class="wrap"><div class="toolbar"><div class="pills" role="group" aria-label="Filter by format">' + pills + '</div>' +
      '<label class="sort">Sort by <select class="select" data-change="sort">' + options + '</select></label></div>' +
      (term ? '<p class="note" style="margin-bottom:18px">Results for \u201C' + esc(term) + '\u201D. <a class="link" href="#/shop" data-link>Clear search</a></p>' : '') +
      grid + '</div></section>';
  }

  var CAP_3D = 'A 3D mockup made from the product image. The back and exact proportions are illustrative.';
  function stageMarkup(p) {
    if (galleryIndex === '3d') return viewerMarkup(p);
    var g = p.gallery[galleryIndex];
    return '<button class="gallery__stage" data-act="zoom" data-fit="' + g.fit + '" aria-label="Enlarge image">' +
      '<img id="stage-img" src="' + media(g.src) + '" alt="' + esc(p.name) + ': ' + esc(g.label.toLowerCase()) + '"' + (g.pos ? ' style="object-position:' + g.pos + '"' : '') + '>' +
      '<span class="gallery__zoom">' + icon('zoom') + '</span></button>';
  }
  function stageCaption(p) { return galleryIndex === '3d' ? CAP_3D : p.gallery[galleryIndex].cap; }

  function productPage(p) {
    if (galleryIndex === '3d' ? !model(p.id) : galleryIndex >= p.gallery.length) galleryIndex = 0;
    var name = esc(p.name);
    var thumbs = p.gallery.map(function (x, i) {
      var t = '<button class="thumb" data-act="thumb" data-index="' + i + '" data-fit="' + (x.fit === 'cover' ? 'cover' : 'contain') + '" aria-label="' + esc(x.label) + '"' +
        (i === galleryIndex ? ' aria-current="true"' : '') + '><img src="' + media(x.src) + '" alt=""' + (x.pos ? ' style="object-position:' + x.pos + '"' : '') + '></button>';
      if (i === 0 && model(p.id)) {
        t += '<button class="thumb thumb--3d" data-act="thumb" data-index="3d" aria-label="3D view"' + (galleryIndex === '3d' ? ' aria-current="true"' : '') + '>' + icon('cube') + '<span>3D</span></button>';
      }
      return t;
    }).join('');
    var details =
      acc('Description', '<p>Approved product description to be supplied for ' + name + '.</p>', true) +
      acc('Ingredients', '<p>Awaiting the approved formula. No ingredient or benefit has been inferred from the name, the packaging or the herbs in the photographs.</p>') +
      acc('How to use', '<p>Approved directions have not been supplied yet.</p>') +
      acc('Cautions and storage', '<p>Cautions, suitability and storage guidance have not been supplied yet.</p><p>Discuss Ayurvedic products with a qualified healthcare professional, especially when taking medicines or managing a health condition.</p>') +
      acc('Licences and documents', '<p>FSSAI licence: details to be supplied.<br>AYUSH manufacturing licence: details to be supplied.</p><p><a class="link" href="#/licences" data-link>View licence records</a></p>');
    var others = D.products.filter(function (x) { return x.id !== p.id; });

    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb" style="margin-top:20px;margin-bottom:0"><a href="#/" data-link>Home</a><span aria-hidden="true">/</span>' +
      '<a href="#/shop" data-link>Shop</a><span aria-hidden="true">/</span><span aria-current="page">' + name + '</span></nav>' +
      '<div class="pdp"><div class="gallery">' +
      '<div class="thumbs" role="group" aria-label="' + name + ' views">' + thumbs + '</div>' +
      '<div class="gallery__main" id="gallery-main">' + stageMarkup(p) + '</div>' +
      '<p class="gallery__cap" id="stage-cap">' + esc(stageCaption(p)) + '</p></div>' +
      '<div class="buy"><p class="buy__vendor">Chaulas Wale Hakim Ji</p><h1 class="buy__title">' + name + '</h1>' +
      '<p class="buy__price">' + money(p.price) + ' <small>Demo price. Pack size to be confirmed.</small></p>' +
      '<p class="buy__intro">' + esc(p.intro) + '</p>' +
      '<div class="offer">' + icon('label') + '<span>10% off with code <code>' + D.offer.code + '</code> (demo offer)</span></div>' +
      '<div class="buy__row">' + qtyControl('pdp', p.id, qty) + '</div>' +
      '<div class="buy__actions" id="buy-actions"><button class="btn btn--ghost" data-act="add-pdp" data-id="' + p.id + '">Add to cart</button>' +
      '<button class="btn" data-act="buy-now" data-id="' + p.id + '">Buy now</button></div>' +
      '<p class="note">Demo checkout. No payment is taken and no order is placed.</p>' +
      '<div class="assure"><div>' + icon('leaf') + '<span>Heritage since 1939</span></div><div>' + icon('shield') + '<span>A Swastha Ayurveda brand</span></div><div>' + icon('gift') + '<span>Three gift-box designs</span></div></div>' +
      '<div>' + details + '</div></div></div></div>' +
      '<section class="section section--mist"><div class="wrap">' + secHead('Customer reviews') +
      '<div class="reviews">' + icon('chat') + '<h3 class="caps h-md">No reviews yet</h3><p>Genuine customer feedback for ' + name + ' will appear here once it has been supplied. We do not show invented ratings or testimonials.</p></div></div></section>' +
      '<section class="section"><div class="wrap">' + secHead('You may also like') + '<div class="products products--4">' + others.map(card).join('') + '</div></div></section>';
  }

  function buyBar() {
    if (route.path.indexOf('/products/') !== 0) return '';
    var p = product(route.path.split('/')[2]);
    if (!p) return '';
    return '<div class="buybar" id="buybar" aria-hidden="true"><div class="wrap buybar__in">' +
      '<div class="buybar__img"><img src="' + media(cutout(p)) + '" alt=""></div>' +
      '<div class="buybar__name"><strong>' + esc(p.name) + '</strong><span>' + money(p.price) + '</span></div>' +
      '<div class="buybar__actions"><button class="btn btn--ghost btn--sm" data-act="add-pdp" data-id="' + p.id + '">Add to cart</button>' +
      '<button class="btn btn--sm" data-act="buy-now" data-id="' + p.id + '">Buy now</button></div></div></div>';
  }

  function giftsPage() {
    return pageHead('Gift sets', 'Three gift-box designs from the house of Chaulas Wale Hakim Ji.') +
      '<section class="section"><div class="wrap"><div class="gifts">' + D.gifts.map(giftCard).join('') + '</div>' +
      '<div style="max-width:820px;margin:32px auto 0;display:grid;gap:16px;justify-items:start">' +
      pending('Gift-set contents, prices and availability have not been confirmed yet, so gift sets cannot be added to the bag.') +
      '<a class="btn" href="#/contact?topic=gifting" data-link>Ask about gifting</a></div></div></section>';
  }

  function storyPage() {
    var hasSample = D.timeline.some(function (t) { return t.sample; });
    return pageHead('Our story', 'A name. A beginning. A continuing story.') +
      '<section class="split"><div class="split__media"><img src="' + media('ref-ras-e-jalali-original.jpg') + '" alt="Ras e Jalali bottle on a wooden apothecary table"></div>' +
      '<div class="split__text"><h2 class="caps h-lg">It starts with 1939</h2>' +
      '<p>That is the date at the heart of our identity: the beginning of the heritage we are bringing into this new digital home.</p>' +
      '<p>Chaulas Wale Hakim Ji is a family Ayurvedic business and a ' + esc(D.brand.parent) + ' brand.</p></div></section>' +
      '<section class="section"><div class="wrap">' + secHead('Our journey', 'From ' + esc(D.timeline[0].year) + ' to today.') +
      (hasSample ? pending('Entries marked Sample are placeholders. They will be replaced with the family\u2019s real dates and events.', 'tl-note') : '') +
      '<ol class="tl">' + D.timeline.map(function (t) {
        return '<li class="tl__item"><p class="tl__year">' + esc(t.year) + '</p><div class="tl__card">' +
          (t.sample ? '<span class="tl__sample">Sample</span>' : '') + '<h3>' + esc(t.title) + '</h3><p>' + esc(t.text) + '</p></div></li>';
      }).join('') + '</ol></div></section>' +
      '<section class="section section--mist"><div class="wrap"><div class="sec-head" style="margin-bottom:0"><h2 class="caps h-lg">What we carry forward</h2>' +
      '<p class="lede">Traditional Ayurvedic knowledge and family heritage form the direction of Chaulas Wale Hakim Ji. Our aim is to make that identity easier to discover and understand.</p>' +
      '<a class="btn" href="#/shop" data-link style="margin-top:10px">Shop the collection</a></div></div></section>';
  }

  function ayurvedaPage() {
    return pageHead('Ayurveda', 'A space to understand the tradition, ask better questions, and separate context from claims.') +
      '<section class="section"><div class="wrap"><div class="prose" style="margin-inline:auto">' +
      '<h2 class="caps">What is Ayurveda?</h2><p>Ayurveda is a traditional system of medicine originating in India.</p>' +
      '<p>That background tells us where the tradition comes from. It does not establish the safety or effectiveness of every product described as Ayurvedic.</p>' +
      '<p>On this website, product-specific ingredients, directions and claims will only be added from approved, verified information.</p>' +
      '<h2 class="caps">Context is not clinical evidence</h2>' +
      '<p><strong>Traditional context</strong> is the historical background of a practice or formulation. It needs a reliable source and must not be presented as proof of a product\u2019s effects.</p>' +
      '<p><strong>Substantiated product information</strong> is the approved detail and supporting evidence for a specific formulation. These fields remain pending until verified material is supplied.</p>' +
      '<h2 class="caps">A note on personal care</h2>' +
      '<p>This website is not a substitute for individual medical advice. Discuss Ayurvedic products with a qualified healthcare professional, especially when taking medicines or managing a health condition. Do not delay medical care.</p>' +
      '<p><a class="link" href="https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth" target="_blank" rel="noopener noreferrer">General reference: NCCIH, Ayurvedic Medicine: In Depth</a></p>' +
      '</div></div></section>';
  }

  function blogPage() {
    var first = D.articles[0];
    var rest = D.articles.slice(1);
    return pageHead('Blog', D.blog.lede) +
      '<section class="section"><div class="wrap">' +
      '<article class="feature"><a class="post__img" href="#/journal/' + first.slug + '" data-link tabindex="-1" aria-hidden="true"><img src="' + media(first.image) + '" alt=""></a>' +
      '<div class="feature__text">' + postMeta(first) + '<h2><a href="#/journal/' + first.slug + '" data-link>' + esc(first.title) + '</a></h2>' +
      '<p>' + esc(first.intro) + '</p><a class="btn" href="#/journal/' + first.slug + '" data-link>Read article</a></div></article>' +
      '<div class="posts posts--2">' + rest.map(postCard).join('') + '</div>' +
      '<p class="note" style="margin-top:28px">These three articles are drafts for review. New posts will appear here as they are written.</p></div></section>';
  }
  function articlePage(a) {
    var others = D.articles.filter(function (x) { return x.slug !== a.slug; });
    return pageHead(a.title, a.intro, [['Blog', '/journal']]) +
      '<section class="section"><div class="wrap"><div class="prose" style="margin-inline:auto">' +
      '<div class="article__lead"><img src="' + media(a.image) + '" alt=""></div>' + postMeta(a) +
      a.sections.map(function (s) { return '<h2 class="caps">' + esc(s[0]) + '</h2><p>' + esc(s[1]) + '</p>'; }).join('') +
      '<p style="margin-top:12px"><a class="link" href="#/journal" data-link>Back to the blog</a></p></div></div></section>' +
      '<section class="section section--mist"><div class="wrap">' + secHead('More from the blog') + '<div class="posts posts--2">' + others.map(postCard).join('') + '</div></div></section>';
  }

  function licencesPage() {
    return pageHead('Licences and certifications', 'Each record is shown only once the original document has been supplied and checked.') +
      '<section class="section"><div class="wrap"><div class="records" style="max-width:820px;margin-inline:auto">' +
      D.licences.map(function (l) {
        return '<div class="panel record"><h2 class="caps h-md" style="margin-bottom:14px">' + esc(l.title) + '</h2><dl style="margin:0">' +
          '<dt>Licence number</dt><dd>' + esc(l.status) + '</dd><dt>Holder and issuer</dt><dd>' + esc(l.status) + '</dd><dt>Products covered</dt><dd>' + esc(l.status) + '</dd></dl></div>';
      }).join('') + '</div><div style="max-width:820px;margin:24px auto 0">' +
      pending('No licence numbers or documents have been supplied yet. A blank record is not a claim that a licence exists or is pending.') + '</div></div></section>';
  }

  function contactPage() {
    var topic = route.query.get('topic') || '';
    function opt(v, label) { return '<option' + (topic === v ? ' selected' : '') + '>' + label + '</option>'; }
    return pageHead('Contact', 'About a formulation, a gift, or the house itself.') +
      '<section class="section"><div class="wrap contact-grid"><div class="prose"><h2 class="caps">How to reach us</h2>' +
      '<p><strong>Email</strong><br>Verified email address to be added.</p><p><strong>Phone</strong><br>Verified phone number to be added.</p>' +
      '<p><strong>Address</strong><br>Verified address and opening hours to be added.</p>' +
      '<p class="note">For personal health questions, please consult a qualified healthcare professional.</p></div>' +
      '<form class="panel" data-form="contact"><div class="form-grid">' +
      '<div><label class="label" for="c-name">Your name</label><input class="input" id="c-name" name="name" required maxlength="80" autocomplete="name"></div>' +
      '<div><label class="label" for="c-email">Email address</label><input class="input" id="c-email" name="email" type="email" required maxlength="254" autocomplete="email"></div>' +
      '<div class="full"><label class="label" for="c-topic">Topic</label><select class="select" id="c-topic" name="topic">' +
      opt('product', 'Product question') + opt('gifting', 'Gifting') + opt('documents', 'Licences and documents') + opt('other', 'Something else') + '</select></div>' +
      '<div class="full"><label class="label" for="c-msg">Your message</label><textarea class="textarea" id="c-msg" name="message" required minlength="10" maxlength="2000" placeholder="Please do not include sensitive medical information."></textarea></div></div>' +
      '<p style="margin-top:16px"><button class="btn" type="submit">Send message</button></p><p class="form-msg" role="status"></p>' +
      '<p class="note">Preview form: messages are not delivered yet.</p></form></div></section>';
  }

  function faqsPage() {
    return pageHead('FAQs', 'A little more clarity.') + '<section class="section"><div class="wrap"><div class="faq">' +
      D.faqs.map(function (f, i) { return acc(f[0], '<p>' + esc(f[1]) + '</p>', i === 0); }).join('') +
      '</div><div class="sec-foot"><a class="btn btn--ghost" href="#/contact" data-link>Ask a different question</a></div></div></section>';
  }

  function policyPage(key) {
    var c = D.policies[key];
    return pageHead(c.title, c.lede) + '<section class="section"><div class="wrap"><div class="prose" style="margin-inline:auto">' +
      c.sections.map(function (s) { return '<h2 class="caps">' + esc(s[0]) + '</h2><p>' + esc(s[1]) + '</p>'; }).join('') + '</div></div></section>';
  }

  function couponBlock() {
    if (coupon) {
      return '<div class="sum"><div class="sum__save"><span>Code ' + coupon + ' applied</span><button class="line__remove" data-act="coupon-remove">Remove</button></div></div>';
    }
    return '<form class="coupon" data-form="coupon"><label class="sr-only" for="coupon-input">Discount code</label>' +
      '<input class="input" id="coupon-input" name="code" placeholder="Discount code" autocomplete="off" maxlength="20">' +
      '<button class="btn btn--ghost btn--sm" type="submit">Apply</button></form>';
  }
  function summaryBlock() {
    var t = totals();
    return '<div class="sum"><div><span>Subtotal</span><span>' + money(t.subtotal) + '</span></div>' +
      (t.discount ? '<div class="sum__save"><span>Discount (' + D.offer.percent + '%)</span><span>\u2212' + money(t.discount) + '</span></div>' : '') +
      '<div><span>Delivery</span><span>Not calculated</span></div>' +
      '<div class="sum__total"><span>Demo total</span><span>' + money(t.total) + '</span></div></div>';
  }
  function cartLines() {
    return cart.map(function (l) {
      var p = product(l.id);
      return '<div class="line"><a class="line__img" href="#/products/' + p.id + '" data-link tabindex="-1" aria-hidden="true"><img src="' + media(cutout(p)) + '" alt=""></a>' +
        '<div><a class="line__name" href="#/products/' + p.id + '" data-link>' + esc(p.name) + '</a><div class="line__meta">' + money(p.price) + ' each</div>' +
        '<div class="line__tools">' + qtyControl('cart', p.id, l.qty) + '<button class="line__remove" data-act="remove" data-id="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">Remove</button></div></div>' +
        '<div class="line__total">' + money(p.price * l.qty) + '</div></div>';
    }).join('');
  }
  function orderSummary() {
    return '<h2 class="caps h-md" style="margin-bottom:6px">Order summary</h2>' + cartLines() + '<div style="display:grid;gap:14px;margin-top:16px">' + couponBlock() + summaryBlock() + '</div>';
  }

  function checkoutPage() {
    if (checkoutDone) {
      return pageHead('Checkout') + '<section class="section"><div class="wrap"><div class="empty">' + icon('check') +
        '<h2 class="caps h-lg">Demo checkout complete</h2><p class="lede">No order was placed. No money was charged. No confirmation email was sent.</p>' +
        '<p class="note">Your bag has been cleared on this device. The details you typed were not stored or sent.</p>' +
        '<a class="btn" href="#/shop" data-link>Back to the shop</a></div></div></section>';
    }
    if (!cart.length) {
      return pageHead('Checkout') + '<section class="section"><div class="wrap"><div class="empty">' + icon('bag') +
        '<h2 class="caps h-lg">Your bag is empty</h2><p class="note">Add a formulation to try the checkout.</p><a class="btn" href="#/shop" data-link>Shop the collection</a></div></div></section>';
    }
    function field(id, label, attrs, cls) {
      return '<div' + (cls ? ' class="' + cls + '"' : '') + '><label class="label" for="' + id + '">' + label + '</label><input class="input" id="' + id + '" ' + attrs + ' required></div>';
    }
    return pageHead('Checkout') + '<section class="section"><div class="wrap">' +
      '<div class="banner-note">' + icon('info') + '<span><strong>Demonstration only.</strong> Use made-up details. Nothing is sent to a server and no payment is taken.</span></div>' +
      '<div class="checkout"><form class="panel" data-form="checkout"><h2 class="caps h-md" style="margin-bottom:18px">Delivery details</h2><div class="form-grid">' +
      field('co-name', 'Full name', 'name="name" autocomplete="off" minlength="2" maxlength="80"') +
      field('co-email', 'Email address', 'name="email" type="email" autocomplete="off" maxlength="254"') +
      field('co-phone', 'Mobile number', 'name="phone" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" title="Enter 10 digits" autocomplete="off"') +
      field('co-pin', 'PIN code', 'name="pin" inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6" title="Enter a six-digit PIN code" autocomplete="off"') +
      field('co-address', 'Address', 'name="address" autocomplete="off" minlength="5" maxlength="180"', 'full') +
      field('co-city', 'City', 'name="city" autocomplete="off" maxlength="80"') +
      '<div><label class="label" for="co-state">State or union territory</label><select class="select" id="co-state" name="state" required><option value="">Select one</option>' +
      D.states.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div></div>' +
      '<label class="check"><input type="checkbox" required><span>I understand this is a demo and no order will be placed.</span></label>' +
      '<p style="margin-top:18px"><button class="btn btn--block" type="submit">Place demo order</button></p></form>' +
      '<aside class="panel panel--mist" id="order-summary" aria-label="Order summary">' + orderSummary() + '</aside></div></div></section>';
  }

  function notFound() {
    return pageHead('Page not found') + '<section class="section"><div class="wrap"><div class="empty">' + icon('search') +
      '<p class="lede">This page does not exist. The shop is just over here.</p><a class="btn" href="#/shop" data-link>Shop the collection</a></div></div></section>';
  }

  /* ---------- overlays ---------- */
  function cartDrawer() {
    var body = cart.length
      ? '<div class="drawer__body">' + cartLines() + '</div><div class="drawer__foot">' + couponBlock() + summaryBlock() +
        '<a class="btn btn--block" href="#/checkout" data-link>Checkout</a><p class="note">Demo checkout. No payment is taken.</p></div>'
      : '<div class="drawer__body"><div class="empty">' + icon('bag') + '<h3 class="caps h-md">Your bag is empty</h3><p class="note">Add a formulation to see it here.</p>' +
        '<a class="btn" href="#/shop" data-link>Shop the collection</a></div></div>';
    return '<div class="scrim" data-act="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Your bag">' +
      '<div class="drawer__head"><h2 class="caps h-md">Your bag (' + cartCount() + ')</h2><button class="tool" data-act="close" aria-label="Close bag">' + icon('close') + '</button></div>' + body + '</aside>';
  }
  function menuDrawer() {
    var links = NAV.concat([['Ayurveda', '/ayurveda'], ['Licences', '/licences'], ['FAQs', '/faqs']]);
    return '<div class="scrim" data-act="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="Menu">' +
      '<div class="drawer__head"><h2 class="caps h-md">Menu</h2><button class="tool" data-act="close" aria-label="Close menu">' + icon('close') + '</button></div>' +
      '<nav class="drawer__body mnav" aria-label="Mobile">' + links.map(function (n) { return '<a href="#' + n[1] + '" data-link>' + n[0] + icon('right') + '</a>'; }).join('') + '</nav></aside>';
  }
  function searchResults(term) {
    var t = term.trim().toLowerCase();
    var list = D.products.filter(function (p) { return !t || p.name.toLowerCase().indexOf(t) >= 0; });
    if (!list.length) return '<p class="note" style="padding:12px 8px">No products match \u201C' + esc(term) + '\u201D. Try \u201CJalali\u201D or \u201COil\u201D.</p>';
    return list.map(function (p) {
      return '<a class="result" href="#/products/' + p.id + '" data-link><div class="result__img"><img src="' + media(cutout(p)) + '" alt=""></div>' +
        '<div><strong>' + esc(p.name) + '</strong><br><span>' + p.form + ', ' + money(p.price) + '</span></div></a>';
    }).join('');
  }
  function searchPanel() {
    return '<div class="scrim" data-act="close"></div><div class="search" role="dialog" aria-modal="true" aria-label="Search"><div class="wrap">' +
      '<form class="search__row" data-form="search"><label class="sr-only" for="search-input">Search products</label>' +
      '<input class="input" id="search-input" type="search" placeholder="Search products" autocomplete="off" maxlength="60">' +
      '<button type="button" class="tool" data-act="close" aria-label="Close search">' + icon('close') + '</button></form>' +
      '<div class="search__results" id="search-results" aria-live="polite">' + searchResults('') + '</div></div></div>';
  }
  function lightbox() {
    var p = product(route.path.split('/')[2]);
    if (!p) return '';
    var g = p.gallery[lightboxIndex];
    return '<div class="lightbox" role="dialog" aria-modal="true" aria-label="' + esc(p.name) + ' images">' +
      '<div class="lightbox__top"><p><strong>' + esc(g.label) + '</strong> <span class="note">' + (lightboxIndex + 1) + ' of ' + p.gallery.length + '</span></p>' +
      '<button class="tool" data-act="close" aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="lightbox__stage"><img src="' + media(g.src) + '" alt="' + esc(p.name) + ': ' + esc(g.label.toLowerCase()) + '"></div>' +
      '<div class="lightbox__nav"><button class="tool" data-act="lb" data-d="-1" aria-label="Previous image">' + icon('left') + '</button>' +
      '<span class="note" style="text-align:center;max-width:46ch">' + esc(g.cap) + '</span>' +
      '<button class="tool" data-act="lb" data-d="1" aria-label="Next image">' + icon('right') + '</button></div></div>';
  }
  function drawOverlay() {
    overlays.innerHTML = overlay === 'cart' ? cartDrawer() : overlay === 'menu' ? menuDrawer() : overlay === 'search' ? searchPanel() : overlay === 'lightbox' ? lightbox() : '';
  }
  function openOverlay(type) {
    if (!overlay) opener = document.activeElement;
    overlay = type;
    drawOverlay();
    document.body.classList.add('is-locked');
    var first = overlays.querySelector('input, [data-act="close"]:not(.scrim)');
    if (first) first.focus();
  }
  function closeOverlay(restoreFocus) {
    if (!overlay) return;
    overlay = '';
    overlays.innerHTML = '';
    document.body.classList.remove('is-locked');
    if (restoreFocus !== false && opener && opener.isConnected) opener.focus();
    opener = null;
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ---------- 3D viewer control ----------
     One viewer per [data-3d] element. It starts when scrolled into view, sways gently until touched,
     and falls back to the product image if WebGL 2 is unavailable. */
  function Viewer(root) {
    var self = this;
    this.root = root;
    this.cfg = model(root.getAttribute('data-3d'));
    this.canvas = root.querySelector('canvas');
    this.status = root.querySelector('[data-3d-status]');
    this.turn = 0;
    this.sway = !reduceMotion.matches;
    this.swayAngle = 0;
    this.open = 0;
    this.openTarget = 0;
    this.spin = null;
    this.drag = null;
    this.visible = false;
    this.started = false;
    this.ready = false;
    this.dead = false;
    this.raf = 0;
    this.t0 = 0;
    this.frame = function (now) { self.raf = 0; self.draw(now); };

    if (!this.cfg || typeof SpatialRenderer === 'undefined' || !('IntersectionObserver' in window)) { this.fail(); return; }

    this.onDown = function (e) {
      if (!self.ready) return;
      self.hold();
      self.drag = { x: e.clientX, turn: self.turn };
      try { self.canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      self.canvas.classList.add('is-dragging');
    };
    this.onMove = function (e) {
      if (!self.drag) return;
      self.turn = self.drag.turn + (e.clientX - self.drag.x) * 0.012;
      self.request();
    };
    this.onUp = function () { self.drag = null; self.canvas.classList.remove('is-dragging'); };
    this.onKey = function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      self.hold();
      self.turn += e.key === 'ArrowLeft' ? -0.3 : 0.3;
      self.request();
    };
    this.onLost = function (e) { e.preventDefault(); self.fail(); };
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('keydown', this.onKey);
    this.canvas.addEventListener('webglcontextlost', this.onLost);

    this.io = new IntersectionObserver(function (entries) {
      self.visible = entries[entries.length - 1].isIntersecting;
      if (self.visible) { self.start(); self.request(); }
    }, { threshold: 0.1 });
    this.io.observe(root);
  }
  /* Stop the idle sway without a visible jump: keep the angle it had reached. */
  Viewer.prototype.hold = function () {
    if (this.sway) { this.turn += this.swayAngle; this.swayAngle = 0; this.sway = false; }
    this.spin = null;
  };
  Viewer.prototype.start = function () {
    if (this.started || this.dead) return;
    this.started = true;
    var self = this;
    try { this.renderer = new SpatialRenderer(this.canvas, this.cfg); } catch (e) { this.fail(); return; }
    this.renderer.load(media(this.cfg.texture)).then(function () {
      if (self.dead) return;
      self.ready = true;
      self.t0 = performance.now();
      self.root.classList.add('is-ready');
      if (self.status) self.status.textContent = 'Drag to turn';
      self.request();
    }).catch(function () { self.fail(); });
  };
  Viewer.prototype.request = function () {
    if (!this.raf && this.ready && this.visible && !this.dead) this.raf = requestAnimationFrame(this.frame);
  };
  Viewer.prototype.draw = function (now) {
    if (this.dead || !this.ready) return;
    var moving = false;
    /* Seconds since the last frame, so the motion takes the same time on fast and slow devices. */
    var dt = this.idle || !this.last ? 0.016 : Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.spin) {
      var k = Math.min(1, (now - this.spin.t) / 1500);
      var ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.turn = this.spin.from + Math.PI * 2 * ease;
      if (k >= 1) this.spin = null; else moving = true;
    }
    var gap = this.openTarget - this.open;
    if (Math.abs(gap) > 0.002) { this.open += gap * (1 - Math.exp(-dt * 7)); moving = true; } else this.open = this.openTarget;
    if (this.sway) { this.swayAngle = Math.sin((now - this.t0) / 1000 * 0.6) * 0.5; moving = true; }
    this.renderer.draw(this.turn + this.swayAngle, this.open);
    this.draws = (this.draws || 0) + 1;
    this.idle = !(moving || this.drag);
    if (!this.idle && !document.hidden) this.request();
  };
  Viewer.prototype.toggleOpen = function (btn) {
    if (!this.ready) return;
    this.openTarget = this.openTarget ? 0 : 1;
    var part = this.root.getAttribute('data-part');
    btn.setAttribute('aria-pressed', String(!!this.openTarget));
    btn.textContent = (this.openTarget ? 'Close ' : 'Open ') + part;
    this.request();
  };
  Viewer.prototype.turnAround = function () {
    if (!this.ready) return;
    this.hold();
    this.spin = { from: this.turn, t: performance.now() };
    this.request();
  };
  Viewer.prototype.reset = function () {
    if (!this.ready) return;
    this.spin = null;
    this.turn = 0;
    this.swayAngle = 0;
    this.openTarget = 0;
    this.sway = !reduceMotion.matches;
    this.t0 = performance.now();
    var btn = this.root.querySelector('[data-act="3d-open"]');
    if (btn) { btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Open ' + this.root.getAttribute('data-part'); }
    this.request();
  };
  Viewer.prototype.fail = function () {
    this.release();
    this.root.classList.remove('is-ready');
    this.root.classList.add('is-fallback');
    if (this.status) this.status.textContent = '3D is not available on this device';
  };
  Viewer.prototype.release = function () {
    this.dead = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.io) this.io.disconnect();
    if (this.canvas && this.onDown) {
      this.canvas.removeEventListener('pointerdown', this.onDown);
      this.canvas.removeEventListener('pointermove', this.onMove);
      this.canvas.removeEventListener('pointerup', this.onUp);
      this.canvas.removeEventListener('pointercancel', this.onUp);
      this.canvas.removeEventListener('keydown', this.onKey);
      this.canvas.removeEventListener('webglcontextlost', this.onLost);
    }
    if (this.renderer) { try { this.renderer.dispose(); } catch (e) { /* already gone */ } this.renderer = null; }
  };
  function mountViewers() {
    $$('[data-3d]').forEach(function (root) {
      if (root.__viewer) return;
      root.__viewer = new Viewer(root);
      viewers.push(root.__viewer);
    });
  }
  function disposeViewers(scope) {
    viewers = viewers.filter(function (v) {
      if (scope && !scope.contains(v.root)) return true;
      v.release();
      return false;
    });
  }
  function viewerOf(el) { var root = el.closest('[data-3d]'); return root && root.__viewer; }

  /* ---------- routing and rendering ---------- */
  function parse(raw) {
    var qi = raw.indexOf('?');
    var path = (qi >= 0 ? raw.slice(0, qi) : raw).replace(/\/+$/, '') || '/';
    return { path: path, query: new URLSearchParams(qi >= 0 ? raw.slice(qi + 1) : '') };
  }
  function parseHash() { return parse(location.hash.indexOf('#/') === 0 ? location.hash.slice(1) : '/'); }
  function sameRoute(a, b) { return a.path === b.path && a.query.toString() === b.query.toString(); }
  function setRoute(next) {
    if (next.path !== route.path) { qty = 1; galleryIndex = 0; }
    if (next.path !== '/checkout' && next.path !== '/cart') checkoutDone = false;
    route = next;
  }
  function go(to) {
    closeOverlay(false);
    setRoute(parse(to));
    try { if (location.hash !== '#' + to) location.hash = '#' + to; } catch (e) { /* hash unavailable: in-memory navigation still works */ }
    render();
    var main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }
  function onHash() {
    var next = parseHash();
    if (sameRoute(next, route)) return;
    closeOverlay(false);
    setRoute(next);
    render();
  }

  function view() {
    var p = route.path;
    if (p === '/') return home();
    if (p === '/shop') return shop();
    if (p.indexOf('/products/') === 0) { var item = product(p.split('/')[2]); return item ? productPage(item) : notFound(); }
    if (p === '/gift-sets') return giftsPage();
    if (p === '/our-story') return storyPage();
    if (p === '/ayurveda') return ayurvedaPage();
    if (p === '/journal' || p === '/blog') return blogPage();
    if (p.indexOf('/journal/') === 0) { var a = D.articles.filter(function (x) { return x.slug === p.split('/')[2]; })[0]; return a ? articlePage(a) : notFound(); }
    if (p === '/licences' || p === '/licenses') return licencesPage();
    if (p === '/contact') return contactPage();
    if (p === '/faqs') return faqsPage();
    if (p === '/checkout' || p === '/cart') return checkoutPage();
    if (D.policies[p.slice(1)]) return policyPage(p.slice(1));
    return notFound();
  }
  function pageTitle() {
    var p = route.path;
    var names = { '/': 'Ayurvedic formulations since 1939', '/shop': 'Shop all', '/gift-sets': 'Gift sets', '/our-story': 'Our story', '/ayurveda': 'Ayurveda', '/journal': 'Blog', '/blog': 'Blog', '/licences': 'Licences and certifications', '/contact': 'Contact', '/faqs': 'FAQs', '/checkout': 'Checkout', '/cart': 'Checkout' };
    var t = names[p];
    if (!t && p.indexOf('/products/') === 0) { var item = product(p.split('/')[2]); t = item && item.name; }
    if (!t && p.indexOf('/journal/') === 0) { var a = D.articles.filter(function (x) { return x.slug === p.split('/')[2]; })[0]; t = a && a.title; }
    if (!t && D.policies[p.slice(1)]) t = D.policies[p.slice(1)].title;
    return (t || 'Page not found') + ' | Chaulas Wale Hakim Ji';
  }

  function render(keepScroll) {
    stopSlider();
    disposeViewers();
    if (buyObserver) { buyObserver.disconnect(); buyObserver = null; }
    document.body.classList.remove('has-buybar');
    app.innerHTML = announcement() + header() + '<main id="main" tabindex="-1">' + view() + '</main>' + footer() + buyBar();
    document.title = pageTitle();
    if (!keepScroll) window.scrollTo(0, 0);
    startSlider();
    watchBuy();
    mountViewers();
  }

  function syncCart() {
    var count = cartCount();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = count; el.hidden = !count; });
    var btn = $('[data-act="open-cart"]');
    if (btn) btn.setAttribute('aria-label', 'Open bag, ' + count + ' items');
    if (overlay === 'cart') drawOverlay();
    var summary = document.getElementById('order-summary');
    if (summary) { if (cart.length) summary.innerHTML = orderSummary(); else render(true); }
  }

  /* ---------- hero slider ---------- */
  function showSlide(i) {
    var slides = $$('.slide');
    if (!slides.length) return;
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach(function (el, n) {
      el.classList.toggle('is-active', n === slideIndex);
      if (n === slideIndex) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
    });
    $$('.dot').forEach(function (d, n) {
      if (n === slideIndex) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }
  function startSlider() {
    stopSlider();
    slideIndex = 0;
    if (!$('.hero') || reduceMotion.matches) return;
    slideTimer = setInterval(function () { if (!document.hidden && !overlay) showSlide(slideIndex + 1); }, 6500);
  }
  function stopSlider() { if (slideTimer) clearInterval(slideTimer); slideTimer = 0; }

  /* ---------- sticky buy bar ---------- */
  function watchBuy() {
    var bar = document.getElementById('buybar');
    var target = document.getElementById('buy-actions');
    if (!bar || !target) return;
    function set(on) {
      bar.classList.toggle('is-shown', on);
      bar.setAttribute('aria-hidden', String(!on));
      bar.inert = !on;
      document.body.classList.toggle('has-buybar', on);
    }
    if (!('IntersectionObserver' in window)) { set(true); return; }
    buyObserver = new IntersectionObserver(function (entries) { set(!entries[entries.length - 1].isIntersecting); }, { threshold: 0 });
    buyObserver.observe(target);
  }

  /* ---------- gallery ---------- */
  function selectImage(i) {
    var p = product(route.path.split('/')[2]);
    if (!p) return;
    if (i === '3d' ? !model(p.id) : !p.gallery[i]) return;
    galleryIndex = i;
    var main = document.getElementById('gallery-main');
    if (main) { disposeViewers(main); main.innerHTML = stageMarkup(p); mountViewers(); }
    var cap = document.getElementById('stage-cap');
    if (cap) cap.textContent = stageCaption(p);
    $$('.thumb').forEach(function (t) {
      if (t.getAttribute('data-index') === String(i)) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
  }

  /* ---------- events ---------- */
  function act(el) {
    var name = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');
    var viewer;
    if (name === 'add') {
      if (addToCart(id, 1)) openOverlay('cart');
    } else if (name === 'add-pdp') {
      if (addToCart(id, qty)) openOverlay('cart');
    } else if (name === 'buy-now') {
      var inBag = cart.filter(function (l) { return l.id === id; })[0];
      if (inBag || addToCart(id, qty)) go('/checkout');
    } else if (name === 'qty') {
      var d = Number(el.getAttribute('data-d'));
      if (el.getAttribute('data-ctx') === 'pdp') {
        qty = Math.max(1, Math.min(MAX_QTY, qty + d));
        $$('.qty [data-ctx="pdp"][data-d="1"]').forEach(function (b) { b.parentNode.outerHTML = qtyControl('pdp', id, qty); });
        var again = $('.qty [data-ctx="pdp"][data-d="' + d + '"]:not([disabled])') || $('.qty [data-ctx="pdp"]:not([disabled])');
        if (again) again.focus();
      } else {
        var line = cart.filter(function (l) { return l.id === id; })[0];
        if (line) { line.qty = Math.max(1, Math.min(MAX_QTY, line.qty + d)); saveCart(); syncCart(); }
        var back = $('[data-ctx="cart"][data-id="' + id + '"][data-d="' + d + '"]:not([disabled])') || $('[data-ctx="cart"][data-id="' + id + '"]:not([disabled])');
        if (back) back.focus();
      }
    } else if (name === 'remove') {
      var gone = product(id);
      cart = cart.filter(function (l) { return l.id !== id; });
      saveCart();
      syncCart();
      toast(gone.name + ' removed from your bag.');
    } else if (name === 'coupon-remove') {
      coupon = '';
      store.set(OFFER_KEY, '');
      syncCart();
    } else if (name === 'open-cart') { openOverlay('cart');
    } else if (name === 'open-menu') { openOverlay('menu');
    } else if (name === 'open-search') { openOverlay('search');
    } else if (name === 'close') { closeOverlay();
    } else if (name === 'slide') { stopSlider(); showSlide(Number(el.getAttribute('data-index')));
    } else if (name === 'thumb') {
      var raw = el.getAttribute('data-index');
      selectImage(raw === '3d' ? '3d' : Number(raw));
    } else if (name === 'zoom') {
      if (typeof galleryIndex === 'number') { lightboxIndex = galleryIndex; openOverlay('lightbox'); }
    } else if (name === 'lb') {
      var p = product(route.path.split('/')[2]);
      var step = Number(el.getAttribute('data-d'));
      lightboxIndex = (lightboxIndex + step + p.gallery.length) % p.gallery.length;
      drawOverlay();
      var same = $('[data-act="lb"][data-d="' + step + '"]');
      if (same) same.focus();
    } else if (name === 'filter') {
      shopFilter = el.getAttribute('data-v');
      render(true);
      var pressed = $('.pill[aria-pressed="true"]');
      if (pressed) pressed.focus();
    } else if (name === '3d-open') { viewer = viewerOf(el); if (viewer) viewer.toggleOpen(el);
    } else if (name === '3d-turn') { viewer = viewerOf(el); if (viewer) viewer.turnAround();
    } else if (name === '3d-reset') { viewer = viewerOf(el); if (viewer) viewer.reset();
    } else if (name === '3d-pick') {
      var box = document.getElementById('show3d');
      if (!box || !product(id)) return;
      home3D = id;
      disposeViewers(box);
      box.innerHTML = showcase3D();
      mountViewers();
      var picked = $('[data-act="3d-pick"][data-id="' + id + '"]');
      if (picked) picked.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-link]');
    if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      if (link.hasAttribute('data-reset-shop')) { shopFilter = 'all'; shopSort = 'featured'; }
      go(link.getAttribute('href').slice(1));
      return;
    }
    var el = e.target.closest('[data-act]');
    if (el && !el.disabled) act(el);
  });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    var kind = form.getAttribute('data-form');
    if (!kind) return;
    e.preventDefault();
    var note = form.querySelector('.form-msg');
    if (kind === 'coupon') {
      var code = String(new FormData(form).get('code') || '').trim().toUpperCase();
      if (code === D.offer.code) { coupon = code; store.set(OFFER_KEY, coupon); syncCart(); }
      else toast(code ? 'That code is not valid. Try ' + D.offer.code + '.' : 'Enter a discount code.');
    } else if (kind === 'search') {
      var q = document.getElementById('search-input').value.trim();
      shopFilter = 'all';
      go('/shop' + (q ? '?q=' + encodeURIComponent(q) : ''));
    } else if (kind === 'newsletter') {
      if (note) note.textContent = 'Preview only: you have not been subscribed and your email was not sent.';
      form.reset();
    } else if (kind === 'contact') {
      if (note) note.textContent = 'Preview only: your message was not sent or stored.';
      form.reset();
    } else if (kind === 'checkout') {
      cart = [];
      coupon = '';
      saveCart();
      store.set(OFFER_KEY, '');
      checkoutDone = true;
      render();
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'search-input') {
      var box = document.getElementById('search-results');
      if (box) box.innerHTML = searchResults(e.target.value);
    }
  });
  document.addEventListener('change', function (e) {
    if (e.target.getAttribute('data-change') === 'sort') {
      shopSort = e.target.value;
      render(true);
      var select = $('[data-change="sort"]');
      if (select) select.focus();
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) viewers.forEach(function (v) { v.request(); });
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay) return;
    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
    if (overlay === 'lightbox' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      var btn = $('[data-act="lb"][data-d="' + (e.key === 'ArrowLeft' ? '-1' : '1') + '"]');
      if (btn) act(btn);
      return;
    }
    if (e.key === 'Tab') {
      var items = $$('a[href], button:not([disabled]), input, select, textarea', overlays).filter(function (x) { return x.getClientRects().length; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function boot() {
    route = parseHash();
    render();
    window.addEventListener('hashchange', onHash);
    window.CWHJ_READY = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* ============================================
   amangosart — Store Script
   ============================================ */

// ─── DATA ───
const FRUITS = [
  { id: 'tangerine', name: 'Tangerine', img: 'tangerine.jpg' },
  { id: 'grapefruit', name: 'Grapefruit', img: 'grapefruit.jpg' },
  { id: 'lemon', name: 'Lemon', img: 'lemon.jpg' },
  { id: 'orange', name: 'Orange', img: 'orange.jpg' },
  { id: 'lime', name: 'Lime', img: 'lime.jpg' },
  { id: 'kiwi', name: 'Kiwi', img: 'kiwi.jpg' },
];

const HERO_IMAGES = ['tangerine.jpg', 'orange.jpg', 'lemon.jpg', 'kiwi.jpg', 'hero-extra-1.jpg'];
const PRICE = 26;
const BUNDLES = [
  { qty: 1,  total: 26, label: 'Single',  save: 0 },
  { qty: 2,  total: 50, label: 'Bundle',  save: 2 },
  { qty: 4,  total: 96, label: 'Bundle',  save: 8 },
  { qty: 6,  total: 138,label: 'Bundle',  save: 18 },
];

// ─── STATE ───
let cart = {};
let bundleTarget = 0;
const IMG = 'images/';

// ─── DOM REFS ───
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ─── HERO GALLERY ───
(function initHero() {
  const g = $('#heroGallery');
  g.innerHTML = HERO_IMAGES.map((f, i) =>
    `<img src="${IMG}${f}" alt="Ceramic trinket dish" loading="${i < 3 ? 'eager' : 'lazy'}" />`
  ).join('');
})();

// ─── RENDER PRODUCTS ───
(function renderProducts() {
  const grid = $('#productGrid');
  grid.innerHTML = FRUITS.map(f => `
    <div class="product-card" data-id="${f.id}">
      <div class="product-img-wrap">
        <img src="${IMG}${f.img}" alt="${f.name} ceramic dish" loading="lazy" />
      </div>
      <div class="product-info">
        <span class="product-name">${f.name}</span>
        <span class="product-price">$${PRICE}</span>
      </div>
      <button class="add-btn" data-id="${f.id}">Add to cart</button>
    </div>
  `).join('');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (btn) toggleFruit(btn.dataset.id);
    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('.add-btn')) {
      // Click on card image — quick view
      const img = card.querySelector('img');
      if (img) openLightbox(img.src, card.dataset.id);
    }
  });
})();

// ─── RENDER PRICING ───
(function renderPricing() {
  const grid = $('.pricing-grid');
  grid.innerHTML = BUNDLES.map((b, i) => `
    <div class="price-card ${b.save > 0 ? 'featured' : ''}" data-qty="${b.qty}">
      ${b.save > 0 ? '<span class="price-tag">Best value</span>' : ''}
      <div class="price-qty">${b.qty}</div>
      <div class="price-unit">dish${b.qty > 1 ? 'es' : ''}</div>
      <div class="price-amount">$${b.total}</div>
      ${b.save > 0 ? `<div class="price-save">Save $${b.save}</div>` : ''}
      <button class="price-btn" data-qty="${b.qty}">
        ${b.qty === 1 ? 'Select' : 'Select ' + b.qty}
      </button>
    </div>
  `).join('');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.price-btn');
    if (btn) selectBundle(parseInt(btn.dataset.qty));
  });
})();

// ─── BUNDLE SELECTION ───
function selectBundle(qty) {
  // Close any previous bundle mode
  exitBundleMode();

  bundleTarget = qty;
  const section = $('#shop');
  const header = section.querySelector('.section-header h2');
  const desc = section.querySelector('.section-desc');

  // Add bundle mode indicator
  const bar = document.createElement('div');
  bar.className = 'bundle-bar';
  bar.id = 'bundleBar';
  bar.innerHTML = `
    <div class="bundle-bar-info">
      <span class="bundle-bar-label">Bundle of <strong>${qty}</strong></span>
      <span class="bundle-bar-count" id="bundleCount">0 of ${qty} selected</span>
    </div>
    <div class="bundle-bar-track">
      <div class="bundle-bar-fill" id="bundleFill"></div>
    </div>
    <button class="bundle-bar-close" id="bundleClose" aria-label="Cancel">Cancel</button>
  `;
  section.insertBefore(bar, section.children[0]);

  // Activate all product cards for bundle picking
  $$('.product-card').forEach(c => c.classList.add('bundle-mode'));
  $$('.price-card').forEach(c => c.classList.add('inactive'));
  $$('.price-btn').forEach(b => b.disabled = true);

  // Highlight the selected bundle card
  document.querySelector(`.price-card[data-qty="${qty}"]`)?.classList.add('active-bundle');

  // Update header
  header.innerHTML = `Pick <strong>${qty} fruit${qty > 1 ? 's' : ''}</strong> for your bundle`;
  desc.textContent = `Click the fruits you want. Auto-priced at $${BUNDLES.find(b => b.qty === qty).total}.`;

  // Scroll to shop
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  $('#bundleClose').addEventListener('click', exitBundleMode);

  // Clear cart if in bundle mode
  cart = {};
  bundleTarget = qty;
  updateUI();
}

function exitBundleMode() {
  bundleTarget = 0;
  const bar = $('#bundleBar');
  if (bar) bar.remove();
  $$('.product-card').forEach(c => c.classList.remove('bundle-mode', 'selected'));
  $$('.price-card').forEach(c => c.classList.remove('inactive', 'active-bundle'));
  $$('.price-btn').forEach(b => b.disabled = false);
  const header = $('#shop .section-header h2');
  if (header) header.innerHTML = 'Choose your fruit';
  const desc = $('#shop .section-desc');
  if (desc) desc.textContent = 'Every dish is water resistant — not waterproof. Hand-wash recommended. Colors and patterns may vary slightly.';
}

// ─── FRUIT TOGGLE ───
function toggleFruit(id) {
  const fruit = FRUITS.find(f => f.id === id);
  if (!fruit) return;

  if (bundleTarget > 0) {
    // Bundle mode: toggle selection
    if (cart[id]) {
      delete cart[id];
    } else {
      const selected = Object.keys(cart).length;
      if (selected >= bundleTarget) return; // Can't add more than bundle
      cart[id] = { ...fruit };
    }
    updateUI();
    // Check if bundle complete
    if (Object.keys(cart).length === bundleTarget) {
      setTimeout(completeBundle, 400);
    }
    return;
  }

  // Normal mode: toggle single item
  if (cart[id]) {
    delete cart[id];
  } else {
    cart[id] = { ...fruit };
  }
  updateUI();
}

function completeBundle() {
  const qty = bundleTarget;
  const bundle = BUNDLES.find(b => b.qty === qty);
  if (!bundle) return;

  // Show brief success animation
  const bar = $('#bundleBar');
  if (bar) {
    bar.classList.add('complete');
    bar.querySelector('.bundle-bar-label').innerHTML = 'Bundle ready!';
  }

  // Open cart after brief delay
  setTimeout(() => {
    exitBundleMode();
    openCart();
    // Flash the total
    const totalEl = $('#cartTotal');
    if (totalEl) {
      totalEl.style.transition = 'transform .3s';
      totalEl.style.transform = 'scale(1.15)';
      setTimeout(() => { totalEl.style.transform = 'scale(1)'; }, 300);
    }
  }, 600);
}

// ─── CART ───
function getCartItems() {
  return Object.values(cart);
}

function getCartTotal() {
  const qty = getCartItems().length;
  if (qty === 0) return { qty: 0, total: 0, save: 0, isBundle: false };
  if (qty === 1) return { qty: 1, total: 26, save: 0, isBundle: false };
  
  // Check for exact bundle match
  const exactMatch = BUNDLES.find(b => b.qty === qty);
  if (exactMatch) {
    return { qty, total: exactMatch.total, save: exactMatch.save, isBundle: true };
  }
  
  // In-between quantity: show regular price + next tier hint
  const regularPrice = qty * PRICE;
  const nextTier = BUNDLES.find(b => b.qty > qty);
  return { qty, total: regularPrice, save: 0, isBundle: false, nextTier };
}

function removeItem(id) {
  delete cart[id];
  updateUI();
}

function updateUI() {
  const items = getCartItems();
  const info = getCartTotal();

  $('#cartCount').textContent = items.length;

  // Product card states
  $$('.add-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (bundleTarget > 0) {
      btn.textContent = cart[id] ? 'Selected' : 'Select';
      btn.classList.toggle('in-cart', !!cart[id]);
    } else {
      btn.textContent = cart[id] ? 'Remove' : 'Add to cart';
      btn.classList.toggle('in-cart', !!cart[id]);
    }
  });

  // Bundle mode highlight on product cards
  $$('.product-card').forEach(c => {
    c.classList.toggle('selected', !!cart[c.dataset.id]);
  });

  // Bundle bar progress
  const count = $('#bundleCount');
  const fill = $('#bundleFill');
  if (count && fill && bundleTarget > 0) {
    const selected = items.length;
    count.textContent = `${selected} of ${bundleTarget} selected`;
    fill.style.width = `${(selected / bundleTarget) * 100}%`;
  }

  // Cart body
  const body = $('#cartBody');
  if (!items.length) {
    body.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    $('#cartTotal').textContent = '$0';
    $('#checkoutBtn').textContent = 'Send order inquiry';
    $('#checkoutBtn').disabled = true;
    return;
  }

  body.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${IMG}${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-desc">1 dish</div>
      </div>
      <div class="cart-item-price">$${PRICE}</div>
      <button class="cart-remove" data-id="${item.id}" aria-label="Remove">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');

  // Cart total with savings breakdown
  let totalHtml = `$${info.total}`;
  if (info.isBundle && info.save > 0) {
    totalHtml += `
      <div class="cart-save">
        <span class="cart-save-badge">Bundle savings</span>
        <span>${info.qty} for $${info.total}</span>
        <span class="cart-save-amount">Save $${info.save}</span>
      </div>`;
  } else if (info.nextTier) {
    const need = info.nextTier.qty - info.qty;
    totalHtml += `
      <div class="cart-save">
        <span class="cart-save-hint">Add ${need} more for $${info.nextTier.total} (save $${info.nextTier.save})</span>
      </div>`;
  }

  $('#cartTotal').innerHTML = totalHtml;
  $('#checkoutBtn').textContent = 'Send order inquiry';
  $('#checkoutBtn').disabled = false;

  body.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.id));
  });
}

// ─── CART UI ───
$('#cartTrigger').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

function openCart() {
  $('#cart').classList.add('open');
  $('#cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cart').classList.remove('open');
  $('#cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── LIGHTBOX ───
function openLightbox(src, id) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox-bg"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img src="${src}" alt="Product photo" />
      <div class="lightbox-info">
        <span class="lightbox-name">${FRUITS.find(f => f.id === id)?.name || ''}</span>
        <span class="lightbox-price">$${PRICE}</span>
        <button class="btn btn-primary lightbox-add" data-id="${id}">
          ${cart[id] ? 'Remove from cart' : 'Add to cart'}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  // Fade in
  requestAnimationFrame(() => overlay.classList.add('open'));

  overlay.querySelector('.lightbox-bg').addEventListener('click', () => closeLightbox(overlay));
  overlay.querySelector('.lightbox-close').addEventListener('click', () => closeLightbox(overlay));
  overlay.querySelector('.lightbox-add').addEventListener('click', () => {
    toggleFruit(id);
    const btn = overlay.querySelector('.lightbox-add');
    btn.textContent = cart[id] ? 'Remove from cart' : 'Add to cart';
  });
  document.addEventListener('keydown', closeOnEsc = (e) => {
    if (e.key === 'Escape') closeLightbox(overlay);
  });
}

function closeLightbox(overlay) {
  overlay.classList.remove('open');
  setTimeout(() => overlay.remove(), 300);
}

// ─── CHECKOUT ───
$('#checkoutBtn').addEventListener('click', () => {
  closeCart();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  const items = getCartItems();
  const info = getCartTotal();
  if (!items.length) return;

  const list = items.map(i => `- ${i.name}`).join('\n');
  const msg = `I'd like to order:\n${list}\n\nQuantity: ${info.qty} dish${info.qty > 1 ? 'es' : ''}\n`;
  const msgWithTotal = info.isBundle
    ? `${msg}Bundle: ${info.qty} for $${info.total} (save $${info.save})`
    : `${msg}Total: $${info.total}`;

  $('#formMessage').value = msgWithTotal + '\n\n';
});

// ─── FORM ───
$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#formName').value.trim();
  const email = $('#formEmail').value.trim();
  const msg = $('#formMessage').value.trim();
  if (!name || !email) return;

  const subject = encodeURIComponent('amangosart order inquiry');
  const body = encodeURIComponent(
    `Hi! I'd like to place an order:\n\nName: ${name}\nEmail: ${email}\n\n${msg}\n\n---\nItems: ${getCartItems().map(i => i.name).join(', ')}`
  );
  window.location.href = `mailto:simplifaisoul@gmail.com?subject=${subject}&body=${body}`;

  const btn = $('#orderForm .btn');
  const orig = btn.textContent;
  btn.textContent = 'Sent';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
});

// ─── MOBILE MENU ───
$('#menuBtn').addEventListener('click', () => {
  $('#mobileNav').classList.toggle('open');
  $('#menuBtn').classList.toggle('active');
});
$('#mobileNav').querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    $('#mobileNav').classList.remove('open');
    $('#menuBtn').classList.remove('active');
  });
});

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ─── NAV SCROLL EFFECT ───
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ─── INIT ───
updateUI();

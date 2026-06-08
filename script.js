/* ============================================
   Fruit Ceramics — Store
   ============================================ */

// ─── DATA ───
const FRUITS = [
  { id: 'tangerine', name: 'Tangerine', img: 'img_ed49f0fd79a9.jpg' },
  { id: 'grapefruit', name: 'Grapefruit', img: 'img_2d438f398697.jpg' },
  { id: 'lemon', name: 'Lemon', img: 'img_ae21c01b0db4.jpg' },
  { id: 'orange', name: 'Orange', img: 'img_92c0344e546a.jpg' },
  { id: 'lime', name: 'Lime', img: 'img_1fe4ec6224d1.jpg' },
  { id: 'kiwi', name: 'Kiwi', img: 'img_d7be2aeb274d.jpg' },
];

const HERO_IMAGES = ['img_ed49f0fd79a9.jpg', 'img_92c0344e546a.jpg', 'img_ae21c01b0db4.jpg', 'img_d7be2aeb274d.jpg', 'img_b09aa1c8a4e6.jpg'];

const PRICE = 26;
const BUNDLE = { 1: 0, 2: 2, 4: 8, 6: 18 };

// ─── STATE ───
let cart = [];
const IMG = 'images/';

// ─── DOM REFS ───
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ─── HERO GALLERY ───
(function initHero() {
  const g = $('#heroGallery');
  g.innerHTML = HERO_IMAGES.map((f, i) =>
    `<img src="${IMG}${f}" alt="Ceramic trinket dish" style="${i > 0 ? 'animation-delay:'+(i*0.15)+'s' : ''}" loading="${i < 3 ? 'eager' : 'lazy'}" />`
  ).join('');
})();

// ─── RENDER PRODUCTS ───
(function renderProducts() {
  const grid = $('#productGrid');
  grid.innerHTML = FRUITS.map(f => `
    <div class="product-card" data-id="${f.id}">
      <img src="${IMG}${f.img}" alt="${f.name} ceramic dish" loading="lazy" />
      <div class="product-info">
        <span class="product-name">${f.name}</span>
        <span class="product-price">$${PRICE}</span>
      </div>
      <button class="add-btn" data-id="${f.id}">Add to cart</button>
    </div>
  `).join('');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (btn) toggleCart(btn.dataset.id);
  });
})();

// ─── CART ───
function toggleCart(id) {
  const fruit = FRUITS.find(f => f.id === id);
  if (!fruit) return;
  const exist = cart.find(c => c.id === id);
  if (exist) {
    // Remove if already in cart
    cart = cart.filter(c => c.id !== id);
  } else {
    cart.push({ ...fruit, qty: 1 });
  }
  updateCart();
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
}

function updateCart() {
  const count = cart.length;
  const total = cart.reduce((s, i) => s + PRICE, 0);

  $('#cartCount').textContent = count;

  // Update add-btn states
  const inCart = cart.map(i => i.id);
  $$('.add-btn').forEach(btn => {
    btn.textContent = inCart.includes(btn.dataset.id) ? '✓ Added' : 'Add to cart';
    btn.classList.toggle('in-cart', inCart.includes(btn.dataset.id));
  });

  // Cart body
  const body = $('#cartBody');
  if (!cart.length) {
    body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    $('#cartTotal').textContent = '$0';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${IMG}${item.img}" alt="${item.name}" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">1 dish</div>
      </div>
      <div class="cart-item-price">$${PRICE}</div>
      <button class="cart-remove" data-id="${item.id}" aria-label="Remove">✕</button>
    </div>
  `).join('');

  // Compute bundle savings
  const qty = cart.length;
  let displayTotal = qty * PRICE;
  let saveText = '';
  if (qty >= 6) { displayTotal = 138; saveText = ' (save $18)'; }
  else if (qty >= 4) { displayTotal = 96; saveText = ' (save $8)'; }
  else if (qty >= 2) { displayTotal = 50; saveText = ' (save $2)'; }

  $('#cartTotal').innerHTML = `$${displayTotal}${saveText ? `<span style="font-size:.75rem;font-weight:400;color:var(--accent);display:block">${saveText}</span>` : ''}`;

  body.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.id));
  });
}

// ─── CART UI ───
$('#cartTrigger').addEventListener('click', () => { $('#cart').classList.add('open'); $('#cartOverlay').classList.add('open'); });
$('#cartClose').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
function closeCart() { $('#cart').classList.remove('open'); $('#cartOverlay').classList.remove('open'); }

// ─── CHECKOUT ───
$('#checkoutBtn').addEventListener('click', () => {
  closeCart();
  $('#contact').scrollIntoView({ behavior: 'smooth' });
  if (cart.length) {
    const qty = cart.length;
    let total, save;
    if (qty >= 6) { total = 138; save = 18; }
    else if (qty >= 4) { total = 96; save = 8; }
    else if (qty >= 2) { total = 50; save = 2; }
    else { total = 26; save = 0; }

    const list = cart.map(i => `${i.name}`).join(', ');
    $('#formMessage').value =
      `I'd like to order: ${list}\n` +
      `Quantity: ${qty} dish${qty > 1 ? 'es' : ''}\n` +
      `Total: $${total}${save ? ` (save $${save})` : ''}\n\n`;
  }
});

// ─── FORM ───
$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#formName').value.trim();
  const email = $('#formEmail').value.trim();
  const msg = $('#formMessage').value.trim();
  if (!name || !email) return;

  const subject = encodeURIComponent('Fruit Ceramics order inquiry');
  const body = encodeURIComponent(
    `Hi! I'd like to place an order:\n\nName: ${name}\nEmail: ${email}\n\n${msg}\n\n` +
    `---\nCart: ${cart.map(i => i.name).join(', ')}`
  );
  window.location.href = `mailto:simplifaisoul@gmail.com?subject=${subject}&body=${body}`;

  const btn = $('#orderForm .btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Sent';
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

// ─── HERO IMAGE ROTATION ───
(function rotateHero() {
  const gallery = document.getElementById('heroGallery');
  if (!gallery) return;
  const imgs = gallery.querySelectorAll('img');
  if (imgs.length < 2) return;
  let idx = 0;
  const srcs = Array.from(imgs).map(i => i.src);

  // Reset: show first batch
  function update(showIdx) {
    const visible = [];
    // First image is the large one, then 4 small grid images
    visible.push(showIdx % srcs.length);
    // Pick next 3 for the grid
    for (let i = 1; i <= 4; i++) {
      visible.push((showIdx + i) % srcs.length);
    }
    imgs.forEach((img, i) => {
      if (i < visible.length) {
        const newSrc = srcs[visible[i]];
        if (img.src !== newSrc) {
          img.style.opacity = '0';
          setTimeout(() => {
            img.src = newSrc;
            img.style.opacity = '1';
          }, 300);
        }
      }
    });
  }

  // Start rotation every 5 seconds
  setInterval(() => {
    idx = (idx + 1) % srcs.length;
    update(idx);
  }, 5000);
})();

// ─── INIT ───
updateCart();

/* ============================================
   Fruit Ceramics — Store Script
   ============================================ */

// ─── DATA ───
const FRUITS = [
  { id: 'tangerine', name: 'Tangerine', emoji: '🍊', price: 26 },
  { id: 'grapefruit', name: 'Grapefruit', emoji: '🍉', price: 26 },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', price: 26 },
  { id: 'orange', name: 'Orange', emoji: '🍊', price: 26 },
  { id: 'lime', name: 'Lime', emoji: '🍋‍🟩', price: 26 },
  { id: 'kiwi', name: 'Kiwi', emoji: '🥝', price: 26 },
];

const BUNDLES = {
  1: { label: '1 dish', total: 26, save: 0 },
  2: { label: '2 dishes (Bundle)', total: 50, save: 2 },
  4: { label: '4 dishes (Bundle)', total: 96, save: 8 },
  6: { label: '6 dishes (Bundle)', total: 138, save: 18 },
};

// ─── STATE ───
let cart = [];

// ─── DOM REFS ───
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const grid = $('#fruitsGrid');
const cartSidebar = $('#cartSidebar');
const cartOverlay = $('#cartOverlay');
const cartItemsEl = $('#cartItems');
const cartCount = $('#cartCount');
const cartTotal = $('#cartTotal');
const cartBtn = $('#cartBtn');
const cartClose = $('#cartClose');
const checkoutBtn = $('#checkoutBtn');
const hamburger = $('#hamburger');
const navLinks = document.querySelector('.nav-links');
const orderForm = $('#orderForm');

// ─── RENDER PRODUCTS ───
function renderFruits() {
  grid.innerHTML = FRUITS.map(f => `
    <div class="fruit-card" data-id="${f.id}">
      <span class="in-cart-badge">✓ In Cart</span>
      <span class="fruit-emoji">${f.emoji}</span>
      <h4>${f.name}</h4>
      <span class="fruit-price">$${f.price}</span>
      <p class="fruit-desc">Hand-sculpted ceramic trinket dish</p>
      <button class="add-btn" data-id="${f.id}">Add to Cart</button>
    </div>
  `).join('');

  // Event delegation
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.add-btn');
    if (btn) addToCart(btn.dataset.id);
  });
}

// ─── CART LOGIC ───
function addToCart(id) {
  const fruit = FRUITS.find(f => f.id === id);
  if (!fruit) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...fruit, qty: 1 });
  }
  updateCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your order is empty. Browse the collection and add items.</p>';
    cartTotal.textContent = '$0';
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => {
    const itemTotal = item.qty * item.price;
    return `
      <div class="cart-item">
        <span class="item-emoji">${item.emoji}</span>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-qty">Qty: ${item.qty}</div>
        </div>
        <div class="item-price">$${itemTotal}</div>
        <button class="remove-btn" data-id="${item.id}" aria-label="Remove">✕</button>
      </div>
    `;
  }).join('');

  cartTotal.textContent = `$${totalPrice}`;

  // Highlight items in cart on grid
  const inCart = cart.map(i => i.id);
  $$('.fruit-card').forEach(card => {
    const id = card.dataset.id;
    card.classList.toggle('in-cart', inCart.includes(id));
  });

  // Remove handlers
  cartItemsEl.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

// ─── CART SIDEBAR ───
function openCart() { cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); }

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

// ─── CHECKOUT → FORM ───
checkoutBtn.addEventListener('click', () => {
  closeCart();
  // Scroll to contact form and pre-fill order details
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  if (cart.length > 0) {
    const orderSummary = cart.map(i => `${i.emoji} ${i.name} × ${i.qty}`).join(', ');
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const msg = document.getElementById('formMessage');
    msg.value = `I'd like to order: ${orderSummary}\nTotal: $${total}\n\n` + msg.value;
  }
});

// ─── ORDER FORM ───
orderForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const fruit = document.getElementById('formFruit').value;
  const qty = document.getElementById('formQuantity').value;
  const message = document.getElementById('formMessage').value.trim();

  const subject = encodeURIComponent('Fruit Ceramics Order Inquiry');
  const body = encodeURIComponent(
    `Hi! I'd like to place an order:\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Fruit: ${fruit || 'N/A'}\n` +
    `Quantity: ${qty || 'N/A'}\n\n` +
    `Message:\n${message}\n\n` +
    (cart.length > 0 ? `\n---\nCart Summary:\n${cart.map(i => `${i.emoji} ${i.name} × ${i.qty} = $${i.qty * i.price}`).join('\n')}\nTotal: $${cart.reduce((s,i) => s + i.qty * i.price, 0)}` : '')
  );

  // Open in default mail app
  window.location.href = `mailto:simplifaisoul@gmail.com?subject=${subject}&body=${body}`;

  // Feedback
  const btn = orderForm.querySelector('.btn-primary');
  btn.textContent = '✅ Sent!';
  setTimeout(() => { btn.textContent = 'Send Inquiry ✉️'; }, 3000);

  // Reset form (keep message for reference)
  document.getElementById('formName').value = '';
  document.getElementById('formEmail').value = '';
});

// ─── MOBILE HAMBURGER ───
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── INIT ───
renderFruits();
updateCart();

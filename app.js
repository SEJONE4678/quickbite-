// ================================================
// QUICKBITE — FOOD DELIVERY APP
// Main Application Logic
// ================================================

// ─── API Config ─────────────────────────────────
const API_URL = 'http://localhost:5000/api';
let isApiConnected = false;

// ─── State ──────────────────────────────────────
const state = {
  categories: typeof CATEGORIES !== 'undefined' ? CATEGORIES : [],
  restaurants: typeof RESTAURANTS !== 'undefined' ? RESTAURANTS : [],
  menus: typeof MENUS !== 'undefined' ? MENUS : {},
  cart: [],
  currentRestaurant: null,
  activeCategory: 'all',
  searchQuery: '',
  selectedPayment: 'card',
  couponApplied: false,
  trackingInterval: null,
  trackingStep: 0,
  orderPlaced: false,
  currentOrderId: null,
  user: JSON.parse(localStorage.getItem('quickbite_user') || 'null')
};

// ─── Helpers ────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(p) { return `₹${p.toFixed(0)}`; }

function generateOrderId() {
  return 'QB' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
}

// ─── View Router ────────────────────────────────
function showView(id) {
  $$('.view').forEach(v => v.classList.remove('active'));
  const v = document.getElementById('view-' + id);
  if (v) { v.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
}

// ─── Toast Notifications ───────────────────────
let toastTimer = {};

function showToast(msg, icon = '🎉', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const id = Date.now();
  toast.id = 'toast-' + id;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="removeToast('toast-${id}')">✕</button>
  `;
  container.appendChild(toast);
  toastTimer[id] = setTimeout(() => removeToast('toast-' + id), duration);
}

function removeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}

// ─── Authentication Handlers ────────────────────
function openAuthModal() {
  document.getElementById('auth-modal-overlay').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-modal-overlay').classList.remove('open');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.style.display = 'flex';
    regForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'flex';
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

function fillDemoLogin() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (emailInput) emailInput.value = 'alex.morgan@quickbite.demo';
  if (passInput) passInput.value = 'Password123!';
  showToast('Demo login credentials filled! ⚡', '🔑');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      state.user = data.user;
      localStorage.setItem('quickbite_user', JSON.stringify(data.user));
      updateUserUI();
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}! 👋`, '🎉');
    } else {
      showToast(data.error || 'Login failed', '❌');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Failed to connect to authentication server', '⚠️');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      state.user = data.user;
      localStorage.setItem('quickbite_user', JSON.stringify(data.user));
      updateUserUI();
      closeAuthModal();
      showToast(`Account created! Welcome, ${data.user.name} 🎉`, '✨');
    } else {
      showToast(data.error || 'Registration failed', '❌');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Failed to connect to authentication server', '⚠️');
  }
}

function updateUserUI() {
  const btn = document.getElementById('nav-signin-btn');
  if (!btn) return;

  if (state.user) {
    btn.innerHTML = `👤 ${state.user.name} <span style="font-size:0.7rem;margin-left:4px;" onclick="event.stopPropagation(); logoutUser();" title="Logout">✕</span>`;
    btn.onclick = () => showToast(`Logged in as ${state.user.email}`, '👤');

    // Auto-fill checkout details
    const nameInput = document.getElementById('del-name');
    const phoneInput = document.getElementById('del-phone');
    if (nameInput && !nameInput.value) nameInput.value = state.user.name;
    if (phoneInput && state.user.phone && !phoneInput.value) phoneInput.value = state.user.phone;
  } else {
    btn.innerHTML = `👤 Sign In`;
    btn.onclick = openAuthModal;
  }
}

function logoutUser() {
  state.user = null;
  localStorage.removeItem('quickbite_user');
  updateUserUI();
  showToast('Logged out successfully', '👋');
}

// ─── Tamil Nadu Location Selector ───────────────
const TAMIL_NADU_LOCATIONS = [
  {
    district: "Chennai",
    areas: ["T. Nagar", "Adyar", "Velachery", "Anna Nagar", "Mylapore", "Nungambakkam", "Besant Nagar", "Guindy", "OMR (Kandanchavadi)", "Porur"]
  },
  {
    district: "Coimbatore",
    areas: ["RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Saravanampatti", "Ramanathapuram", "Singanallur"]
  },
  {
    district: "Madurai",
    areas: ["KK Nagar", "Anna Nagar", "Simmakkal", "TVS Nagar", "SS Colony", "Mattuthavani"]
  },
  {
    district: "Tiruchirappalli (Trichy)",
    areas: ["Thillai Nagar", "Cantonment", "Srirangam", "KK Nagar", "Tiruchanoor"]
  },
  {
    district: "Salem",
    areas: ["Fairlands", "Hasthampatti", "Suramangalam", "Five Roads", "Alagapuram"]
  },
  {
    district: "Tirunelveli",
    areas: ["Palayamkottai", "Tirunelveli Junction", "Vannarpettai", "Melapalayam"]
  },
  {
    district: "Erode",
    areas: ["Perundurai Road", "Brough Road", "Collectorate Area", "Surampatti"]
  },
  {
    district: "Vellore",
    areas: ["Katpadi", "Santhapet", "Gandhinagar", "Vellore Fort Area"]
  },
  {
    district: "Thanjavur",
    areas: ["Medical College Road", "New Bus Stand", "Old Bus Stand Area", "Granary Street"]
  },
  {
    district: "Kanchipuram",
    areas: ["Ennaikaran", "Gandhi Road", "Little Kanchipuram", "Kanchipuram Railway Station Area"]
  }
];

let selectedLocation = JSON.parse(localStorage.getItem('quickbite_location') || '{"district":"Chennai","area":"T. Nagar"}');

function openLocationModal() {
  document.getElementById('location-modal-overlay').classList.add('open');
  renderLocationModal();
}

function closeLocationModal() {
  document.getElementById('location-modal-overlay').classList.remove('open');
}

function renderLocationModal(activeDistrict = selectedLocation.district) {
  const districtSelect = document.getElementById('district-select');
  const areasGrid = document.getElementById('areas-grid');
  if (!districtSelect || !areasGrid) return;

  districtSelect.innerHTML = TAMIL_NADU_LOCATIONS.map(d => `
    <option value="${d.district}" ${d.district === activeDistrict ? 'selected' : ''}>
      ${d.district}
    </option>
  `).join('');

  const districtData = TAMIL_NADU_LOCATIONS.find(d => d.district === activeDistrict) || TAMIL_NADU_LOCATIONS[0];
  areasGrid.innerHTML = districtData.areas.map(area => {
    const isSel = selectedLocation.district === activeDistrict && selectedLocation.area === area;
    return `
      <button class="area-btn ${isSel ? 'selected' : ''}" onclick="selectLocation('${districtData.district}', '${area}')">
        📍 ${area}
      </button>
    `;
  }).join('');
}

function onDistrictChange(districtName) {
  renderLocationModal(districtName);
}

function selectLocation(district, area) {
  selectedLocation = { district, area };
  localStorage.setItem('quickbite_location', JSON.stringify(selectedLocation));

  // Update Navbar text
  const navText = document.getElementById('nav-location-text');
  if (navText) navText.textContent = `${area}, ${district}`;

  // Update Checkout City
  const cityInput = document.getElementById('del-city');
  if (cityInput) cityInput.value = district;

  closeLocationModal();
  showToast(`Location updated to ${area}, ${district}! 📍`, '🛵');
}

function initLocationUI() {
  const navText = document.getElementById('nav-location-text');
  if (navText && selectedLocation) {
    navText.textContent = `${selectedLocation.area}, ${selectedLocation.district}`;
  }
}

// ─── Particle System ────────────────────────────
function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  const emojis = ['🍕','🍔','🍛','🍣','🌮','🍰','🍝','🥗','🧃','🍜'];
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.cssText = `
      font-size: ${Math.random() * 20 + 14}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

// ─── Data Fetching ──────────────────────────────
async function fetchDatabaseData() {
  try {
    const [catRes, restRes] = await Promise.all([
      fetch(`${API_URL}/categories`),
      fetch(`${API_URL}/restaurants`)
    ]);

    if (catRes.ok && restRes.ok) {
      state.categories = await catRes.json();
      state.restaurants = await restRes.json();
      
      // Build menu cache from restaurants
      state.menus = {};
      state.restaurants.forEach(r => {
        if (r.menu) state.menus[r.id] = r.menu;
      });

      isApiConnected = true;
      showToast('Connected to MongoDB live database! 🍃', '⚡');
    }
  } catch (err) {
    console.warn('Backend API server not reachable. Using fallback local data.', err);
    isApiConnected = false;
  }
}

// ─── Category Filter ────────────────────────────
function renderCategories() {
  const wrap = document.getElementById('categories-wrap');
  if (!wrap) return;
  const categoriesList = state.categories.length > 0 ? state.categories : CATEGORIES;
  wrap.innerHTML = categoriesList.map(c => `
    <button class="category-pill ${state.activeCategory === c.id ? 'active' : ''}"
            onclick="filterCategory('${c.id}')" id="cat-${c.id}">
      <span class="emoji">${c.emoji}</span>${c.label}
    </button>
  `).join('');
}

function filterCategory(catId) {
  state.activeCategory = catId;
  state.searchQuery = '';
  const si = document.getElementById('main-search');
  if (si) si.value = '';
  renderCategories();
  renderRestaurants();
}

// ─── Search ─────────────────────────────────────
function handleSearch(query) {
  state.searchQuery = query.toLowerCase().trim();
  state.activeCategory = 'all';
  renderCategories();
  renderRestaurants();
}

// ─── Restaurant Cards ────────────────────────────
function renderRestaurants() {
  const grid = document.getElementById('restaurants-grid');
  if (!grid) return;

  const restaurantsList = state.restaurants.length > 0 ? state.restaurants : RESTAURANTS;
  let filtered = restaurantsList.filter(r => {
    const matchCat = state.activeCategory === 'all' || r.category === state.activeCategory;
    const matchSearch = state.searchQuery === '' ||
      r.name.toLowerCase().includes(state.searchQuery) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(state.searchQuery))) ||
      r.category.includes(state.searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>No restaurants found for "<strong>${state.searchQuery || state.activeCategory}</strong>"</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(r => renderRestaurantCard(r)).join('');
}

function renderRestaurantCard(r) {
  const badgeHtml = r.discount
    ? `<span class="badge ${r.deliveryFee === 0 ? 'badge-free' : 'badge-discount'}">${r.discount}</span>`
    : '';
  const featuredHtml = r.featured ? `<span class="badge badge-featured">⭐ Featured</span>` : '';
  const closedHtml = !r.isOpen ? `<span class="badge badge-closed">Closed</span>` : '';

  return `
    <div class="restaurant-card ${!r.isOpen ? 'closed' : ''}" onclick="openRestaurant('${r.id}')" id="rcard-${r.id}">
      <div class="restaurant-img-wrap">
        <img class="restaurant-img" src="${r.image}" alt="${r.name}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'">
        <div class="restaurant-img-overlay"></div>
        <div class="restaurant-badges">
          ${badgeHtml}${featuredHtml}${closedHtml}
        </div>
      </div>
      <div class="restaurant-info">
        <div class="restaurant-name">${r.name}</div>
        <div class="restaurant-tags">
          ${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="restaurant-meta">
          <span class="rating">
            <span class="star">⭐</span>${r.rating}
            <span class="reviews">(${(r.reviews / 1000).toFixed(r.reviews >= 1000 ? 1 : 0)}${r.reviews >= 1000 ? 'k' : ''})</span>
          </span>
          <span class="eta">🕐 ${r.eta}</span>
          <span class="min-order">Min ₹${r.minOrder}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Restaurant Detail ───────────────────────────
function openRestaurant(id) {
  const restaurantsList = state.restaurants.length > 0 ? state.restaurants : RESTAURANTS;
  const r = restaurantsList.find(x => x.id === id);
  if (!r) return;
  state.currentRestaurant = r;

  // If cart has items from different restaurant, ask
  if (state.cart.length > 0 && state.cart[0].restaurantId !== id) {
    if (!confirm(`Your cart has items from another restaurant. Clear cart and switch to ${r.name}?`)) return;
    state.cart = [];
    updateCartUI();
  }

  renderRestaurantDetail(r);
  showView('restaurant');
}

function renderRestaurantDetail(r) {
  const view = document.getElementById('view-restaurant');
  const menusMap = Object.keys(state.menus).length > 0 ? state.menus : MENUS;
  const menu = menusMap[r.id] || r.menu || [];

  const menuNavItems = menu.map((cat, i) =>
    `<a class="menu-nav-item ${i === 0 ? 'active' : ''}" onclick="scrollToCategory('menu-cat-${i}')" id="nav-cat-${i}">${cat.category}</a>`
  ).join('');

  const menuCategories = menu.map((cat, i) => `
    <div class="menu-category" id="menu-cat-${i}">
      <div class="menu-category-title">${cat.category}</div>
      <div class="menu-items-list">
        ${cat.items.map(item => renderMenuItem(item, r.id)).join('')}
      </div>
    </div>
  `).join('');

  const feeText = r.deliveryFee === 0 ? '<span style="color:var(--accent2)">FREE Delivery</span>' : `₹${r.deliveryFee} Delivery`;

  view.innerHTML = `
    <div class="restaurant-hero">
      <img class="restaurant-hero-img" src="${r.image}" alt="${r.name}"
           onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'">
      <div class="restaurant-hero-overlay"></div>
      <button class="restaurant-hero-back" onclick="showView('home')" title="Back">←</button>
    </div>

    <div class="container">
      <div class="restaurant-detail-info">
        <div class="restaurant-detail-header">
          <div>
            <div class="restaurant-detail-name">${r.name}</div>
            <div class="restaurant-detail-meta">
              <span class="meta-chip rating-chip">⭐ ${r.rating} · ${r.reviews ? r.reviews.toLocaleString() : '1,000+'} reviews</span>
              <span class="meta-chip eta-chip">🕐 ${r.eta}</span>
              <span class="meta-chip fee-chip">🛵 ${feeText}</span>
              <span class="meta-chip">🛒 Min order ₹${r.minOrder}</span>
            </div>
          </div>
        </div>

        <div class="menu-layout">
          <div class="menu-sidebar">
            <h4>Menu</h4>
            ${menuNavItems}
          </div>
          <div class="menu-content">
            ${menuCategories}
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup intersection observer for menu nav highlighting
  setupMenuObserver();
}

function renderMenuItem(item, restaurantId) {
  const inCart = state.cart.find(c => c.id === item.id);
  const qty = inCart ? inCart.qty : 0;

  const addControl = qty > 0
    ? `<div class="qty-control" id="qty-${item.id}">
        <button class="qty-btn" onclick="updateItemQty('${item.id}', -1, '${restaurantId}')">−</button>
        <span class="qty-num">${qty}</span>
        <button class="qty-btn" onclick="updateItemQty('${item.id}', 1, '${restaurantId}')">+</button>
       </div>`
    : `<button class="add-btn" id="qty-${item.id}" onclick="addToCart('${item.id}', '${restaurantId}')">
        + ADD
       </button>`;

  return `
    <div class="menu-item" id="item-${item.id}">
      <img class="menu-item-img" src="${item.image}" alt="${item.name}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'">
      <div class="menu-item-info">
        <div class="menu-item-header">
          <span class="veg-badge ${item.veg ? 'veg' : 'non-veg'}"></span>
          <span class="menu-item-name">${item.name}</span>
          ${item.popular ? '<span class="popular-tag">🔥 Bestseller</span>' : ''}
        </div>
        <div class="menu-item-desc">${item.desc}</div>
        <div class="menu-item-footer">
          <span class="menu-item-price">${formatPrice(item.price)}</span>
          <span class="menu-item-rating"><span class="star">★</span> ${item.rating}</span>
          ${addControl}
        </div>
      </div>
    </div>
  `;
}

function scrollToCategory(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupMenuObserver() {
  if (typeof IntersectionObserver === 'undefined') return;
  const cats = $$('.menu-category');
  const navItems = $$('.menu-nav-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = cats.indexOf(entry.target);
        navItems.forEach(n => n.classList.remove('active'));
        if (navItems[idx]) navItems[idx].classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  cats.forEach(c => obs.observe(c));
}

// ─── Cart Logic ──────────────────────────────────
function findMenuItemById(itemId) {
  const menusMap = Object.keys(state.menus).length > 0 ? state.menus : MENUS;
  for (const rid in menusMap) {
    for (const cat of menusMap[rid]) {
      const item = cat.items.find(i => i.id === itemId);
      if (item) return { item, restaurantId: rid };
    }
  }
  return null;
}

function addToCart(itemId, restaurantId) {
  const found = findMenuItemById(itemId);
  if (!found) return;
  const { item } = found;

  const existing = state.cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...item, qty: 1, restaurantId });
  }
  updateCartUI();
  updateMenuItemControl(itemId, restaurantId);
  showToast(`${item.name} added to cart`, '🛒');
}

function updateItemQty(itemId, delta, restaurantId) {
  const idx = state.cart.findIndex(c => c.id === itemId);
  if (idx === -1) {
    if (delta > 0) addToCart(itemId, restaurantId);
    return;
  }
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) {
    state.cart.splice(idx, 1);
  }
  updateCartUI();
  updateMenuItemControl(itemId, restaurantId);
}

function removeCartItem(itemId) {
  state.cart = state.cart.filter(c => c.id !== itemId);
  updateCartUI();
  // Refresh menu item control if on restaurant view
  if (state.currentRestaurant) {
    updateMenuItemControl(itemId, state.currentRestaurant.id);
  }
  showToast('Item removed from cart', '🗑️');
}

function updateMenuItemControl(itemId, restaurantId) {
  const el = document.getElementById(`qty-${itemId}`);
  if (!el) return;
  const inCart = state.cart.find(c => c.id === itemId);
  if (inCart) {
    el.outerHTML = `
      <div class="qty-control" id="qty-${itemId}">
        <button class="qty-btn" onclick="updateItemQty('${itemId}', -1, '${restaurantId}')">−</button>
        <span class="qty-num">${inCart.qty}</span>
        <button class="qty-btn" onclick="updateItemQty('${itemId}', 1, '${restaurantId}')">+</button>
      </div>
    `;
  } else {
    el.outerHTML = `<button class="add-btn" id="qty-${itemId}" onclick="addToCart('${itemId}', '${restaurantId}')">+ ADD</button>`;
  }
}

function updateCartUI() {
  const count = state.cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    // Re-trigger pop animation
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  }

  renderCartItems();
  renderCartSummary();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('cart-empty');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'flex';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"
           onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty} = ${formatPrice(item.price * item.qty)}</div>
      </div>
      <div class="qty-control" style="margin-right:4px">
        <button class="qty-btn" onclick="updateItemQty('${item.id}', -1, '${item.restaurantId}')">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateItemQty('${item.id}', 1, '${item.restaurantId}')">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" title="Remove">✕</button>
    </div>
  `).join('');

  // Restaurant name
  const rnEl = document.getElementById('cart-restaurant-name');
  if (rnEl && state.cart.length > 0) {
    const r = RESTAURANTS.find(x => x.id === state.cart[0].restaurantId);
    rnEl.innerHTML = r ? `🍽️ Order from <span>${r.name}</span>` : '';
    rnEl.style.display = 'block';
  }
}

function cartTotals() {
  const subtotal = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const r = state.currentRestaurant || RESTAURANTS.find(x => x.id === (state.cart[0]?.restaurantId));
  const deliveryFee = r ? r.deliveryFee : 30;
  const taxes = Math.round(subtotal * 0.05);
  const discount = state.couponApplied ? Math.min(100, Math.round(subtotal * 0.1)) : 0;
  const total = subtotal + deliveryFee + taxes - discount;
  return { subtotal, deliveryFee, taxes, discount, total };
}

function renderCartSummary() {
  const { subtotal, deliveryFee, taxes, discount, total } = cartTotals();
  const el = document.getElementById('cart-summary');
  if (!el) return;

  el.innerHTML = `
    <div class="cart-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="cart-row"><span>Delivery fee</span><span>${deliveryFee === 0 ? '<span style="color:var(--accent2)">FREE</span>' : formatPrice(deliveryFee)}</span></div>
    <div class="cart-row"><span>Taxes & fees (5%)</span><span>${formatPrice(taxes)}</span></div>
    ${discount > 0 ? `<div class="cart-row" style="color:var(--accent2)"><span>Coupon discount</span><span>−${formatPrice(discount)}</span></div>` : ''}
    <div class="cart-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) checkoutBtn.disabled = state.cart.length === 0;
}

// ─── Cart Drawer ─────────────────────────────────
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
  renderCartSummary();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Checkout View ────────────────────────────────
function goToCheckout() {
  if (state.cart.length === 0) { showToast('Your cart is empty!', '⚠️'); return; }
  closeCart();
  renderCheckout();
  showView('checkout');
}

function renderCheckout() {
  const { subtotal, deliveryFee, taxes, discount, total } = cartTotals();

  const summaryItems = state.cart.map(item => `
    <div class="summary-item">
      <span class="summary-item-name">${item.name}</span>
      <span class="summary-item-qty">×${item.qty}</span>
      <span class="summary-item-price">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  document.getElementById('order-summary-items').innerHTML = summaryItems;
  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('summary-delivery').textContent = deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee);
  document.getElementById('summary-taxes').textContent = formatPrice(taxes);
  document.getElementById('summary-discount-row').style.display = discount > 0 ? 'flex' : 'none';
  document.getElementById('summary-discount').textContent = `−${formatPrice(discount)}`;
  document.getElementById('summary-total').textContent = formatPrice(total);
}

function selectPayment(method) {
  state.selectedPayment = method;
  $$('.payment-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`pay-${method}`).classList.add('selected');

  // Show/hide sub-forms
  const cardForm = document.getElementById('card-form');
  const upiForm = document.getElementById('upi-form');
  if (cardForm) cardForm.classList.toggle('active', method === 'card');
  if (upiForm) upiForm.classList.toggle('active', method === 'upi');
}

function fillDemoCheckout() {
  const nameInput = document.getElementById('del-name');
  const phoneInput = document.getElementById('del-phone');
  const addrInput = document.getElementById('del-address');
  const cityInput = document.getElementById('del-city');
  const pinInput = document.getElementById('del-pincode');
  const notesInput = document.getElementById('del-notes');

  const cardNum = document.getElementById('card-num');
  const cardExp = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');
  const cardName = document.getElementById('card-name');
  const upiId = document.getElementById('upi-id');

  if (nameInput) nameInput.value = state.user ? state.user.name : 'Priya Sharma';
  if (phoneInput) phoneInput.value = state.user?.phone || '+91 98765 43210';
  if (addrInput) addrInput.value = 'Plot 14, 2nd Avenue, T. Nagar';
  if (cityInput) cityInput.value = selectedLocation?.district || 'Chennai';
  if (pinInput) pinInput.value = '600017';
  if (notesInput) notesInput.value = 'Ring doorbell twice, leave with security if unavailable';

  if (cardNum) cardNum.value = '4532 8921 7654 3210';
  if (cardExp) cardExp.value = '12/28';
  if (cardCvv) cardCvv.value = '888';
  if (cardName) cardName.value = 'Priya Sharma';
  if (upiId) upiId.value = 'priya@okaxis';

  showToast('Demo checkout details filled! ⚡', '✨');
}

function applyCoupon() {
  const val = document.getElementById('coupon-input').value.trim().toUpperCase();
  if (val === 'QUICKBITE' || val === 'FIRST10') {
    state.couponApplied = true;
    renderCheckout();
    showToast('Coupon applied! 10% discount', '🎁');
  } else if (val === '') {
    showToast('Please enter a coupon code', '⚠️');
  } else {
    showToast('Invalid coupon code', '❌');
  }
}

async function placeOrder() {
  // Validate form
  const name = document.getElementById('del-name')?.value?.trim();
  const phone = document.getElementById('del-phone')?.value?.trim();
  const address = document.getElementById('del-address')?.value?.trim();
  const city = document.getElementById('del-city')?.value?.trim() || 'Noida';
  const pincode = document.getElementById('del-pincode')?.value?.trim() || '';
  const notes = document.getElementById('del-notes')?.value?.trim() || '';

  if (!name || !phone || !address) {
    showToast('Please fill in all delivery details', '⚠️');
    return;
  }

  if (state.selectedPayment === 'card') {
    const cardNum = document.getElementById('card-num')?.value?.trim();
    if (!cardNum || cardNum.length < 16) {
      showToast('Please enter valid card details', '⚠️');
      return;
    }
  }

  if (state.selectedPayment === 'upi') {
    const upiId = document.getElementById('upi-id')?.value?.trim();
    if (!upiId || !upiId.includes('@')) {
      showToast('Please enter valid UPI ID', '⚠️');
      return;
    }
  }

  const orderId = generateOrderId();
  const totals = cartTotals();

  const payload = {
    orderId,
    customerName: name,
    phone,
    address,
    city,
    pincode,
    notes,
    paymentMethod: state.selectedPayment,
    items: state.cart.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      restaurantId: i.restaurantId
    })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    taxes: totals.taxes,
    discount: totals.discount,
    total: totals.total,
    status: 'Placed'
  };

  // Persist to MongoDB via Backend API
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Order successfully saved to MongoDB:', data);
      showToast('Order saved to MongoDB database! 🍃', '✅');
    }
  } catch (err) {
    console.warn('Unable to send order to API backend server.', err);
  }

  state.currentOrderId = orderId;
  document.getElementById('modal-order-id').textContent = orderId;
  document.getElementById('modal-overlay').classList.add('open');
  state.orderPlaced = true;
}

function startTracking() {
  document.getElementById('modal-overlay').classList.remove('open');
  state.cart = [];
  updateCartUI();
  state.couponApplied = false;
  state.trackingStep = 0;
  renderTracking();
  showView('tracking');
  simulateTracking();
}

// ─── Order Tracking ──────────────────────────────
const TRACKING_STEPS = [
  { label: 'Order Placed', desc: 'We received your order', time: 'Just now', icon: '📋' },
  { label: 'Order Confirmed', desc: 'Restaurant accepted your order', time: '2 min ago', icon: '✅' },
  { label: 'Preparing Your Food', desc: 'Chef is working on your order', time: '5 min ago', icon: '👨‍🍳' },
  { label: 'Out for Delivery', desc: 'Arjun is on his way to you', time: 'In progress', icon: '🛵' },
  { label: 'Delivered!', desc: 'Enjoy your meal! Rate your experience.', time: '', icon: '🎉' },
];

function renderTracking() {
  const view = document.getElementById('view-tracking');
  const restaurantsList = state.restaurants.length > 0 ? state.restaurants : RESTAURANTS;
  const r = restaurantsList.find(x => x.id === (state.cart[0]?.restaurantId)) || state.currentRestaurant || restaurantsList[0];
  const { total } = cartTotals();

  view.innerHTML = `
    <div class="container">
      <div style="padding: 28px 0 10px;">
        <h2 class="section-title">📦 Track Your Order</h2>
        <p style="color:var(--text-muted);font-size:.9rem;">Your food is on its way!</p>
      </div>

      <div class="tracking-grid">
        <div>
          <!-- Map -->
          <div class="tracking-map">
            <div class="map-placeholder">
              <div class="map-grid"></div>
              <div class="map-roads">
                <div class="map-road h h1"></div>
                <div class="map-road h h2"></div>
                <div class="map-road v v1"></div>
                <div class="map-road v v2"></div>
              </div>
              <div class="map-pin restaurant-pin">
                <span class="pin-icon">🍽️</span>
                <span class="pin-label">Restaurant</span>
              </div>
              <div class="map-pin rider-pin" id="rider-pin">
                <span class="pin-icon">🛵</span>
                <span class="pin-label">Arjun</span>
              </div>
              <div class="map-pin home-pin">
                <span class="pin-icon">🏠</span>
                <span class="pin-label">Your location</span>
              </div>
              <svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M25,30 Q40,30 40,60 Q40,80 75,75" fill="none"
                      stroke="rgba(255,107,53,0.6)" stroke-width="0.8"
                      stroke-dasharray="3 2" stroke-linecap="round"/>
              </svg>
            </div>

            <div class="map-overlay-info">
              <div class="rider-info">
                <div class="rider-avatar">🧑</div>
                <div>
                  <div class="rider-name">Arjun Sharma</div>
                  <div class="rider-rating">⭐ 4.9 · 2,340 deliveries</div>
                </div>
              </div>
              <div class="rider-actions">
                <button class="rider-btn" title="Call" onclick="showToast('Calling Arjun...','📞')">📞</button>
                <button class="rider-btn" title="Message" onclick="showToast('Chat with Arjun','💬')">💬</button>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="tracking-timeline">
            <div class="timeline-title">Order Status</div>
            <div class="timeline" id="tracking-timeline">
              ${renderTimelineHTML(0)}
            </div>
          </div>
        </div>

        <div>
          <!-- ETA Card -->
          <div class="tracking-eta-card" id="eta-card">
            <div class="eta-label">Estimated Arrival</div>
            <div class="eta-time" id="eta-time">28</div>
            <div class="eta-unit">minutes</div>
          </div>

          <!-- Order Summary -->
          <div class="tracking-order-summary">
            <div style="font-family:'Outfit',sans-serif;font-weight:700;margin-bottom:14px;">Your Order</div>
            ${state.cart.map(item => `
              <div style="display:flex;justify-content:space-between;font-size:.875rem;padding:6px 0;border-bottom:1px solid var(--border)">
                <span style="color:var(--text-secondary)">${item.name} ×${item.qty}</span>
                <span style="font-weight:600">${formatPrice(item.price * item.qty)}</span>
              </div>
            `).join('')}
            <div style="display:flex;justify-content:space-between;margin-top:12px;font-weight:800;font-size:1rem;">
              <span>Total Paid</span>
              <span style="color:var(--primary)">${formatPrice(total || 0)}</span>
            </div>
          </div>

          <!-- Back to home -->
          <button onclick="backToHome()" style="width:100%;margin-top:16px;padding:14px;
            background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-lg);
            color:var(--text-secondary);font-weight:600;font-size:.9rem;transition:var(--transition);cursor:pointer;"
            onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-secondary)'">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderTimelineHTML(activeStep) {
  return TRACKING_STEPS.map((step, i) => {
    let cls = '';
    if (i < activeStep) cls = 'done';
    else if (i === activeStep) cls = 'active';
    return `
      <div class="timeline-item ${cls}" id="ts-${i}">
        <div class="timeline-dot">${i < activeStep ? '✓' : step.icon}</div>
        <div class="timeline-content">
          <div class="timeline-label">${step.label}</div>
          <div class="timeline-desc">${step.desc}</div>
          ${i <= activeStep ? `<div class="timeline-time">${step.time}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function simulateTracking() {
  if (state.trackingInterval) clearInterval(state.trackingInterval);
  state.trackingStep = 1; // Start at "Confirmed"

  const intervals = [3000, 6000, 10000, 18000]; // ms between steps
  let stepIdx = 1;

  function advanceStep() {
    if (stepIdx >= TRACKING_STEPS.length) return;
    state.trackingStep = stepIdx;

    const timeline = document.getElementById('tracking-timeline');
    if (timeline) timeline.innerHTML = renderTimelineHTML(state.trackingStep);

    // Update ETA
    const etaEl = document.getElementById('eta-time');
    const etas = ['28', '25', '18', '8', '✓'];
    if (etaEl) etaEl.textContent = etas[stepIdx] || '✓';

    const etaCard = document.getElementById('eta-card');
    if (stepIdx === 4 && etaCard) {
      etaCard.style.background = 'linear-gradient(135deg, #6BCB77, #4DA854)';
    }

    showToast(TRACKING_STEPS[stepIdx].label, TRACKING_STEPS[stepIdx].icon);
    stepIdx++;

    if (stepIdx < TRACKING_STEPS.length) {
      const delay = intervals[stepIdx - 1] || 8000;
      state.trackingInterval = setTimeout(advanceStep, delay);
    }
  }

  state.trackingInterval = setTimeout(advanceStep, intervals[0]);
}

function backToHome() {
  if (state.trackingInterval) clearTimeout(state.trackingInterval);
  state.currentRestaurant = null;
  showView('home');
}

// ─── Orders History ─────────────────────────────
async function openOrdersView() {
  showView('orders');
  await renderOrdersList();
}

async function renderOrdersList() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = `
    <div class="no-results">
      <div class="no-results-icon">⌛</div>
      <p>Fetching your order history from MongoDB...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📋</div>
          <p>No past orders found in MongoDB database.</p>
          <button onclick="showView('home')" class="nav-btn nav-btn-primary" style="margin-top:16px;display:inline-flex;">
            Explore Restaurants & Place Order
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-history-card">
        <div class="order-card-header">
          <div>
            <span class="order-card-id">${order.orderId}</span>
            <span class="order-card-date"> · ${new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <span class="order-status-badge">✅ ${order.status || 'Confirmed'}</span>
        </div>

        <div class="order-card-body">
          <div class="order-card-items-list">
            <div style="font-weight:700;font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">ITEMS ORDERED</div>
            ${order.items.map(item => `
              <div class="order-card-item">
                <span>${item.name} × ${item.qty}</span>
                <span>₹${item.price * item.qty}</span>
              </div>
            `).join('')}
          </div>

          <div class="order-card-meta">
            <div><strong>Customer:</strong> ${order.customerName}</div>
            <div><strong>Delivery Address:</strong> ${order.address}, ${order.city}</div>
            <div><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</div>
            <div style="margin-top:4px;padding-top:6px;border-top:1px solid var(--border);font-weight:800;font-size:0.95rem;color:var(--primary);">
              Total Paid: ₹${order.total}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching order history:', err);
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">⚠️</div>
        <p>Could not connect to database API to retrieve orders.</p>
      </div>
    `;
  }
}

// ─── Scroll Behavior ─────────────────────────────
function initScroll() {
  const scrollBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    if (scrollBtn) scrollBtn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
}

// ─── Card Input Formatting ─────────────────────
function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
  input.value = val;
}

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initParticles();
  renderCategories();
  renderRestaurants();
  initScroll();
  updateCartUI();
  updateUserUI();
  initLocationUI();

  // Fetch live data from MongoDB backend API
  await fetchDatabaseData();
  renderCategories();
  renderRestaurants();

  // Hero search
  const heroSearch = document.getElementById('hero-search-input');
  const heroSearchBtn = document.getElementById('hero-search-btn');
  if (heroSearch) {
    heroSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        handleSearch(heroSearch.value);
        document.getElementById('restaurants-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
      handleSearch(heroSearch?.value || '');
      document.getElementById('restaurants-section').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Navbar search
  const mainSearch = document.getElementById('main-search');
  if (mainSearch) {
    mainSearch.addEventListener('input', e => handleSearch(e.target.value));
  }

  // Overlay closes
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
  document.getElementById('auth-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'auth-modal-overlay') closeAuthModal();
  });
  document.getElementById('location-modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'location-modal-overlay') closeLocationModal();
  });

  // Coupon
  document.getElementById('coupon-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyCoupon();
  });
});

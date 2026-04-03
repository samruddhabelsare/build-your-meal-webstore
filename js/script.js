/* ============================================
   SCRIPT.JS — Build Your Meal Restaurant WebStore
   ============================================ */

'use strict';

/* ============================================================
   GLOBAL STATE
   ============================================================ */
const STATE = {
  menuData: [],          // All items loaded from menu.json
  cart: [],              // Cart array stored in localStorage
  builderSelection: {    // Current meal builder state
    base: null,          // Selected base item object
    toppings: [],        // Array of selected topping objects
    drink: null          // Selected drink object
  }
};

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/**
 * Format a number as a USD price string
 * @param {number} amount
 * @returns {string} e.g. "$12.99"
 */
function formatPrice(amount) {
  return '$' + Number(amount).toFixed(2);
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|''} type
 */
function showToast(message, type = '') {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);

  // Trigger show
  requestAnimationFrame(() => toast.classList.add('show'));

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Get current page filename
 * @returns {string}
 */
function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

/* ============================================================
   CART MANAGEMENT (localStorage)
   ============================================================ */

/**
 * Load cart from localStorage into STATE.cart
 */
function loadCart() {
  const saved = localStorage.getItem('mealCart');
  STATE.cart = saved ? JSON.parse(saved) : [];
}

/**
 * Save STATE.cart to localStorage
 */
function saveCart() {
  localStorage.setItem('mealCart', JSON.stringify(STATE.cart));
}

/**
 * Add a meal to the cart
 * @param {object} meal - { base, toppings, drink, totalPrice }
 */
function addToCart(meal) {
  loadCart();
  // Generate unique ID for each cart item
  meal.cartId = Date.now().toString();
  STATE.cart.push(meal);
  saveCart();
  updateCartBadge();
  showToast('Meal added to cart!', 'success');
}

/**
 * Remove a cart item by cartId
 * @param {string} cartId
 */
function removeFromCart(cartId) {
  loadCart();
  STATE.cart = STATE.cart.filter(item => item.cartId !== cartId);
  saveCart();
  updateCartBadge();
}

/**
 * Get total number of cart items
 * @returns {number}
 */
function getCartCount() {
  loadCart();
  return STATE.cart.length;
}

/**
 * Update the cart badge in the navbar
 */
function updateCartBadge() {
  const badge = document.querySelector('.cart-count');
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ============================================================
   DATA FETCHING
   ============================================================ */

/**
 * Fetch menu data from menu.json
 * @returns {Promise<Array>}
 */
async function fetchMenuData() {
  try {
    const response = await fetch('data/menu.json');
    if (!response.ok) throw new Error('Failed to load menu data');
    const data = await response.json();
    STATE.menuData = data.items;
    return data.items;
  } catch (error) {
    console.error('Error fetching menu:', error);
    showToast('Failed to load menu data.', 'error');
    return [];
  }
}

/* ============================================================
   NAVBAR SETUP
   ============================================================ */

/**
 * Initialize navbar: active link, cart badge, hamburger menu
 */
function initNavbar() {
  updateCartBadge();

  // Set active nav link based on current page
  const currentPage = getCurrentPage();
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger toggle for mobile
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });
  }
}

/* ============================================================
   HOME PAGE (index.html)
   ============================================================ */

/**
 * Render featured items on the home page
 * Picks 3 random items (1 Pizza, 1 Burger, 1 Drink)
 * @param {Array} items
 */
function renderFeaturedItems(items) {
  const container = document.getElementById('featuredItems');
  if (!container) return;

  // Pick one from each category
  const pizza  = items.filter(i => i.category === 'Pizza')[0];
  const burger = items.filter(i => i.category === 'Burger')[0];
  const drink  = items.filter(i => i.category === 'Drink')[0];
  const featured = [pizza, burger, drink].filter(Boolean);

  container.innerHTML = '';
  featured.forEach(item => {
    container.appendChild(createMenuCard(item));
  });
}

/* ============================================================
   MENU PAGE (menu.html)
   ============================================================ */

/** Current active filters */
const menuFilters = {
  category: 'All',
  type: 'All',
  search: ''
};

/**
 * Render the full menu grid, respecting active filters
 * @param {Array} items
 */
function renderMenuGrid(items) {
  const container = document.getElementById('menuGrid');
  if (!container) return;

  // Apply filters
  let filtered = items.filter(item => {
    const categoryMatch = menuFilters.category === 'All' || item.category === menuFilters.category;
    const typeMatch = menuFilters.type === 'All' || item.type === menuFilters.type;
    const searchMatch = menuFilters.search === '' ||
      item.name.toLowerCase().includes(menuFilters.search.toLowerCase()) ||
      item.description.toLowerCase().includes(menuFilters.search.toLowerCase());
    return categoryMatch && typeMatch && searchMatch;
  });

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h3>NO RESULTS 🍕</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
    return;
  }

  filtered.forEach(item => container.appendChild(createMenuCard(item)));
}

/**
 * Create a menu item card DOM element
 * @param {object} item
 * @returns {HTMLElement}
 */
function createMenuCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-image" src="${item.image}" alt="${item.name}" loading="lazy" />
    <div class="card-body">
      <div class="card-meta">
        <span class="card-category ${item.category.toLowerCase()}">${item.category}</span>
        <span class="type-badge ${item.type === 'Veg' ? 'veg' : 'non-veg'}">${item.type}</span>
      </div>
      <h3 class="card-name">${item.name}</h3>
      <p class="card-desc">${item.description}</p>
      <div class="card-footer">
        <span class="card-price">${formatPrice(item.basePrice)}</span>
        <a href="builder.html?item=${item.id}" class="btn btn-primary btn-sm">BUILD →</a>
      </div>
    </div>
  `;
  return card;
}

/**
 * Initialize the menu page filters, search, and data rendering
 * @param {Array} items
 */
function initMenuPage(items) {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  // Initial render
  renderMenuGrid(items);

  // Category filter buttons
  document.querySelectorAll('.filter-btn[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-category]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuFilters.category = btn.dataset.category;
      renderMenuGrid(items);
    });
  });

  // Type filter buttons
  document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-type]').forEach(b => {
        b.classList.remove('active', 'veg-active');
      });
      if (menuFilters.type === btn.dataset.type) {
        // Toggle off if same clicked again
        menuFilters.type = 'All';
      } else {
        menuFilters.type = btn.dataset.type;
        btn.classList.add(btn.dataset.type === 'Veg' ? 'veg-active' : 'active');
      }
      renderMenuGrid(items);
    });
  });

  // Live search
  const searchInput = document.getElementById('menuSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      menuFilters.search = searchInput.value.trim();
      renderMenuGrid(items);
    });
  }
}

/* ============================================================
   MEAL BUILDER PAGE (builder.html)
   ============================================================ */

/**
 * Initialize the meal builder page
 * Reads optional ?item=id from URL to pre-select a base
 * @param {Array} items
 */
function initBuilderPage(items) {
  const baseGrid = document.getElementById('baseItemsGrid');
  if (!baseGrid) return;

  const pizzasAndBurgers = items.filter(i => i.category !== 'Drink');
  const drinks = items.filter(i => i.category === 'Drink');

  // Render base items (pizza + burger)
  renderBaseItems(pizzasAndBurgers, baseGrid);

  // Render drink selector
  const drinkGrid = document.getElementById('drinksGrid');
  if (drinkGrid) renderDrinks(drinks, drinkGrid);

  // Pre-select item from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedId = urlParams.get('item');
  if (preselectedId) {
    const targetItem = items.find(i => i.id === preselectedId);
    if (targetItem && targetItem.category !== 'Drink') {
      selectBaseItem(targetItem, items);
    }
  }

  // "Add to Cart" button
  const addBtn = document.getElementById('builderAddToCart');
  if (addBtn) {
    addBtn.addEventListener('click', handleBuilderAddToCart);
  }
}

/**
 * Render base item cards for the builder
 * @param {Array} items
 * @param {HTMLElement} container
 */
function renderBaseItems(items, container) {
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'base-item-card';
    card.dataset.id = item.id;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-meta" style="margin-bottom:0.5rem">
        <span class="card-category ${item.category.toLowerCase()}">${item.category}</span>
        <span class="type-badge ${item.type === 'Veg' ? 'veg' : 'non-veg'}">${item.type}</span>
      </div>
      <h4>${item.name}</h4>
      <span class="price">${formatPrice(item.basePrice)}</span>
    `;
    card.addEventListener('click', () => {
      // We need the full items array to load toppings
      selectBaseItem(item, STATE.menuData);
    });
    container.appendChild(card);
  });
}

/**
 * Handle base item selection in the builder
 * @param {object} item
 * @param {Array} allItems
 */
function selectBaseItem(item, allItems) {
  // Update visual selection
  document.querySelectorAll('.base-item-card').forEach(c => c.classList.remove('selected'));
  const targetCard = document.querySelector(`.base-item-card[data-id="${item.id}"]`);
  if (targetCard) targetCard.classList.add('selected');

  // Update state
  STATE.builderSelection.base = item;
  STATE.builderSelection.toppings = [];

  // Render toppings for this item
  const toppingsSection = document.getElementById('toppingsSection');
  const toppingsGrid = document.getElementById('toppingsGrid');
  if (toppingsSection && toppingsGrid) {
    toppingsSection.classList.remove('hidden');
    renderToppings(item.toppings, toppingsGrid);
  }

  // Show drink section
  const drinkSection = document.getElementById('drinkSection');
  if (drinkSection) drinkSection.classList.remove('hidden');

  updateBuilderSummary();
}

/**
 * Render topping checkboxes for selected base item
 * @param {Array} toppings
 * @param {HTMLElement} container
 */
function renderToppings(toppings, container) {
  container.innerHTML = '';
  if (!toppings || toppings.length === 0) {
    container.innerHTML = '<p style="color:#888;font-family:var(--font-mono);font-size:0.85rem;">No toppings available for this item.</p>';
    return;
  }

  toppings.forEach(topping => {
    const item = document.createElement('label');
    item.className = 'topping-item';
    item.innerHTML = `
      <input type="checkbox" value="${topping.id}" data-name="${topping.name}" data-price="${topping.price}" />
      <div class="topping-check"></div>
      <span class="topping-name">${topping.name}</span>
      <span class="topping-price">+${formatPrice(topping.price)}</span>
    `;
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        item.classList.add('selected');
        item.querySelector('.topping-check').textContent = '✓';
        // Add to toppings if not already there
        if (!STATE.builderSelection.toppings.find(t => t.id === topping.id)) {
          STATE.builderSelection.toppings.push(topping);
        }
      } else {
        item.classList.remove('selected');
        item.querySelector('.topping-check').textContent = '';
        STATE.builderSelection.toppings = STATE.builderSelection.toppings.filter(t => t.id !== topping.id);
      }
      updateBuilderSummary();
    });
    container.appendChild(item);
  });
}

/**
 * Render drink selection cards
 * @param {Array} drinks
 * @param {HTMLElement} container
 */
function renderDrinks(drinks, container) {
  container.innerHTML = '';

  // "No drink" option
  const noDrink = document.createElement('div');
  noDrink.className = 'drink-card selected';
  noDrink.id = 'noDrinkCard';
  noDrink.innerHTML = `
    <div style="height:80px;border:3px solid #0a0a0a;display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:0.5rem;">🚫</div>
    <h4>NO DRINK</h4>
    <span class="price">$0.00</span>
  `;
  noDrink.addEventListener('click', () => {
    document.querySelectorAll('.drink-card').forEach(c => c.classList.remove('selected'));
    noDrink.classList.add('selected');
    STATE.builderSelection.drink = null;
    updateBuilderSummary();
  });
  container.appendChild(noDrink);

  drinks.forEach(drink => {
    const card = document.createElement('div');
    card.className = 'drink-card';
    card.dataset.id = drink.id;
    card.innerHTML = `
      <img src="${drink.image}" alt="${drink.name}" />
      <h4>${drink.name}</h4>
      <span class="price">${formatPrice(drink.basePrice)}</span>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.drink-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      STATE.builderSelection.drink = drink;
      updateBuilderSummary();
    });
    container.appendChild(card);
  });
}

/**
 * Update the builder order summary sidebar
 */
function updateBuilderSummary() {
  const summaryLines = document.getElementById('summaryLines');
  const summaryTotal = document.getElementById('summaryTotal');
  const addBtn = document.getElementById('builderAddToCart');

  if (!summaryLines || !summaryTotal) return;

  const { base, toppings, drink } = STATE.builderSelection;

  summaryLines.innerHTML = '';
  let total = 0;

  if (!base) {
    summaryLines.innerHTML = '<p class="summary-empty">Select a base item to get started →</p>';
    summaryTotal.textContent = '$0.00';
    if (addBtn) addBtn.disabled = true;
    return;
  }

  // Base item line
  const baseLine = createSummaryLine(base.name, base.basePrice);
  summaryLines.appendChild(baseLine);
  total += base.basePrice;

  // Topping lines
  toppings.forEach(topping => {
    const line = createSummaryLine(`+ ${topping.name}`, topping.price);
    summaryLines.appendChild(line);
    total += topping.price;
  });

  // Drink line
  if (drink) {
    const drinkLine = createSummaryLine(`🥤 ${drink.name}`, drink.basePrice);
    summaryLines.appendChild(drinkLine);
    total += drink.basePrice;
  }

  summaryTotal.textContent = formatPrice(total);
  if (addBtn) addBtn.disabled = false;
}

/**
 * Create a single summary line element
 * @param {string} label
 * @param {number} price
 * @returns {HTMLElement}
 */
function createSummaryLine(label, price) {
  const div = document.createElement('div');
  div.className = 'summary-item';
  div.innerHTML = `
    <span class="summary-item-name">${label}</span>
    <span class="summary-item-price">${formatPrice(price)}</span>
  `;
  return div;
}

/**
 * Handle "Add to Cart" button click in the builder
 */
function handleBuilderAddToCart() {
  const { base, toppings, drink } = STATE.builderSelection;
  if (!base) {
    showToast('Please select a base item first!', 'error');
    return;
  }

  // Calculate total
  let total = base.basePrice;
  toppings.forEach(t => total += t.price);
  if (drink) total += drink.basePrice;

  // Build meal object
  const meal = {
    base: { id: base.id, name: base.name, price: base.basePrice, image: base.image, category: base.category },
    toppings: toppings.map(t => ({ id: t.id, name: t.name, price: t.price })),
    drink: drink ? { id: drink.id, name: drink.name, price: drink.basePrice, image: drink.image } : null,
    totalPrice: parseFloat(total.toFixed(2))
  };

  addToCart(meal);

  // Reset builder
  STATE.builderSelection = { base: null, toppings: [], drink: null };
  document.querySelectorAll('.base-item-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.drink-card').forEach(c => c.classList.remove('selected'));
  const noDrink = document.getElementById('noDrinkCard');
  if (noDrink) noDrink.classList.add('selected');

  const toppingsSection = document.getElementById('toppingsSection');
  const drinkSection = document.getElementById('drinkSection');
  if (toppingsSection) toppingsSection.classList.add('hidden');
  if (drinkSection) drinkSection.classList.add('hidden');

  updateBuilderSummary();
}

/* ============================================================
   CART PAGE (cart.html)
   ============================================================ */

/**
 * Initialize the cart page
 */
function initCartPage() {
  const cartWrapper = document.getElementById('cartWrapper');
  if (!cartWrapper) return;

  loadCart();
  renderCart();
}

/**
 * Render all cart items and totals
 */
function renderCart() {
  const cartWrapper = document.getElementById('cartWrapper');
  const cartItems = document.getElementById('cartItemsList');
  const emptyState = document.getElementById('cartEmpty');
  const cartSummary = document.getElementById('cartSummaryPanel');
  const cartCountDisplay = document.getElementById('cartCountDisplay');

  if (!cartItems) return;

  loadCart();
  const cart = STATE.cart;

  if (cart.length === 0) {
    if (cartWrapper) cartWrapper.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    if (cartSummary) cartSummary.classList.add('hidden');
    return;
  }

  if (cartWrapper) cartWrapper.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');
  if (cartSummary) cartSummary.classList.remove('hidden');

  if (cartCountDisplay) {
    cartCountDisplay.textContent = `${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'}`;
  }

  cartItems.innerHTML = '';
  let subtotal = 0;

  cart.forEach(meal => {
    cartItems.appendChild(createCartItemEl(meal));
    subtotal += meal.totalPrice;
  });

  // Update totals
  const tax = subtotal * 0.08;
  const delivery = subtotal > 0 ? 3.99 : 0;
  const grandTotal = subtotal + tax + delivery;

  updateCartTotals(subtotal, tax, delivery, grandTotal);
}

/**
 * Create a cart item HTML element
 * @param {object} meal
 * @returns {HTMLElement}
 */
function createCartItemEl(meal) {
  const div = document.createElement('div');
  div.className = 'cart-item';
  div.dataset.cartId = meal.cartId;

  // Build toppings tags HTML
  const toppingTags = meal.toppings.length > 0
    ? meal.toppings.map(t => `<span class="topping-tag">${t.name} (+${formatPrice(t.price)})</span>`).join('')
    : '<span style="color:#999;font-size:0.75rem;font-family:var(--font-mono)">No toppings</span>';

  // Drink info
  const drinkHTML = meal.drink
    ? `<div class="cart-item-drink">🥤 ${meal.drink.name} (${formatPrice(meal.drink.price)})</div>`
    : '';

  div.innerHTML = `
    <img class="cart-item-image" src="${meal.base.image}" alt="${meal.base.name}" />
    <div class="cart-item-details">
      <h3 class="cart-item-name">${meal.base.name}</h3>
      <p class="cart-item-base-price">Base: ${formatPrice(meal.base.price)} (${meal.base.category})</p>
      <div class="cart-item-toppings">${toppingTags}</div>
      ${drinkHTML}
    </div>
    <div class="cart-item-right">
      <span class="cart-item-total">${formatPrice(meal.totalPrice)}</span>
      <button class="btn-remove" data-cart-id="${meal.cartId}">REMOVE ✕</button>
    </div>
  `;

  // Remove button handler
  div.querySelector('.btn-remove').addEventListener('click', () => {
    removeFromCart(meal.cartId);
    renderCart();
    updateCartBadge();
    showToast('Item removed from cart.', '');
  });

  return div;
}

/**
 * Update price breakdown in cart summary
 * @param {number} subtotal
 * @param {number} tax
 * @param {number} delivery
 * @param {number} grandTotal
 */
function updateCartTotals(subtotal, tax, delivery, grandTotal) {
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl('cartSubtotal', formatPrice(subtotal));
  setEl('cartTax', formatPrice(tax));
  setEl('cartDelivery', formatPrice(delivery));
  setEl('cartGrandTotal', formatPrice(grandTotal));
}

/**
 * Clear all cart items
 */
function clearCart() {
  STATE.cart = [];
  saveCart();
  updateCartBadge();
  renderCart();
  showToast('Cart cleared!', '');
}

/* ============================================================
   CONTACT PAGE (contact.html)
   ============================================================ */

/**
 * Initialize the contact form with validation
 */
function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', handleContactSubmit);

  // Real-time validation on blur
  const fields = form.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      // Clear error on input
      const group = field.closest('.form-group');
      if (group && group.classList.contains('error')) {
        if (validateField(field, false)) {
          group.classList.remove('error');
        }
      }
    });
  });
}

/**
 * Validate a single form field
 * @param {HTMLElement} field
 * @param {boolean} showError - Whether to visually show error
 * @returns {boolean} isValid
 */
function validateField(field, showError = true) {
  const group = field.closest('.form-group');
  const value = field.value.trim();
  let isValid = true;
  let errorMsg = '';

  if (field.name === 'name') {
    if (value.length < 2) {
      isValid = false;
      errorMsg = 'Name must be at least 2 characters.';
    }
  } else if (field.name === 'phone') {
    const phoneRegex = /^[0-9\+\-\s\(\)]{7,15}$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMsg = 'Enter a valid phone number (7–15 digits).';
    }
  } else if (field.name === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMsg = 'Enter a valid email address.';
    }
  } else if (field.name === 'address') {
    if (value.length < 10) {
      isValid = false;
      errorMsg = 'Please enter your full delivery address (min 10 chars).';
    }
  } else if (field.name === 'message') {
    if (value.length < 5) {
      isValid = false;
      errorMsg = 'Message must be at least 5 characters.';
    }
  }

  if (showError && group) {
    const errEl = group.querySelector('.error-msg');
    if (!isValid) {
      group.classList.add('error');
      if (errEl) errEl.textContent = errorMsg;
    } else {
      group.classList.remove('error');
    }
  }

  return isValid;
}

/**
 * Handle contact form submission
 * @param {Event} e
 */
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const fields = form.querySelectorAll('input, textarea');
  let allValid = true;

  // Validate all fields
  fields.forEach(field => {
    if (!validateField(field, true)) allValid = false;
  });

  if (!allValid) {
    showToast('Please fix the errors before submitting.', 'error');
    return;
  }

  // Show success message
  const successMsg = document.getElementById('formSuccess');
  if (successMsg) successMsg.classList.add('visible');
  form.reset();
  showToast('Your order inquiry has been sent! 🎉', 'success');
}

/* ============================================================
   MAIN INIT — Called on page load
   ============================================================ */

/**
 * Main initialization function
 * Determines which page we're on and initializes accordingly
 */
async function init() {
  // Always initialize navbar
  initNavbar();

  const page = getCurrentPage();

  // Pages that need menu data
  const dataPages = ['index.html', '', 'menu.html', 'builder.html'];
  const needsData = dataPages.includes(page);

  if (needsData) {
    const items = await fetchMenuData();
    if (items.length === 0) return;

    if (page === 'index.html' || page === '') {
      renderFeaturedItems(items);
    } else if (page === 'menu.html') {
      initMenuPage(items);
    } else if (page === 'builder.html') {
      initBuilderPage(items);
    }
  } else if (page === 'cart.html') {
    initCartPage();
  } else if (page === 'contact.html') {
    initContactPage();
  }
}

// Kick off initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

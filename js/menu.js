import { fetchMenuItems } from './supabase.js';
import { CONFIG } from './config.js';

let menuData = [];
let activeCategory = 'All';
let cart = []; // Array of { item, quantity }

export async function initMenu() {
  menuData = await fetchMenuItems();
  renderCategories();
  renderMenu();
  setupCartModal();
}

function renderCategories() {
  const categoriesContainer = document.getElementById('menu-categories');
  if (!categoriesContainer) return;

  const categories = ['All', 'Sandwiches', 'Combos', 'Extras'];

  categoriesContainer.innerHTML = categories.map(cat => `
    <button 
      data-category="${cat}"
      class="category-btn px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${activeCategory === cat ? 'bg-brand-brown text-white shadow-warm' : 'bg-white text-brand-darkbrown hover:bg-brand-creamDark'}"
    >
      ${cat}
    </button>
  `).join('');

  categoriesContainer.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCategory = e.currentTarget.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function renderMenu() {
  const container = document.getElementById('menu-items-grid');
  if (!container) return;

  const filtered = activeCategory === 'All' 
    ? menuData 
    : menuData.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center bg-white rounded-3xl border border-brand-creamDark">
        <p class="text-brand-darkbrown font-serif text-xl font-bold">No menu items found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => createMenuItemCard(item)).join('');
  setupItemEvents();
}

function createMenuItemCard(item) {
  const isBestValue = item.is_best_value;
  const isOutOfStock = !item.in_stock;

  return `
    <div class="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-creamDark shadow-warm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-warm-lg ${isBestValue ? 'ring-2 ring-brand-gold glow-badge' : ''}">
      
      <!-- Best Value Badge -->
      ${isBestValue ? `
        <div class="absolute top-4 left-4 z-10 px-3 py-1 bg-brand-gold text-brand-darkbrown text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md">
          🔥 BEST VALUE
        </div>
      ` : ''}

      <!-- Out of Stock Badge -->
      ${isOutOfStock ? `
        <div class="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm z-20 flex items-center justify-center">
          <span class="px-4 py-2 bg-red-600 text-white font-bold rounded-full uppercase tracking-wider text-sm shadow-lg">
            Sold Out
          </span>
        </div>
      ` : ''}

      <!-- Image Banner -->
      <div class="relative h-56 w-full overflow-hidden bg-brand-cream">
        <img 
          src="${item.image_url || 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'}" 
          alt="${item.name}" 
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
        
        <!-- Price Pill -->
        <div class="absolute bottom-4 right-4 px-4 py-1.5 rounded-full bg-brand-darkbrown text-brand-gold font-serif font-bold text-lg shadow-md">
          ₦${Number(item.price).toLocaleString()}
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="text-xl font-serif font-bold text-brand-darkbrown group-hover:text-brand-brown transition-colors">
              ${item.name}
            </h3>
          </div>

          ${item.set_info ? `
            <span class="inline-block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">
              ${item.set_info}
            </span>
          ` : ''}

          <p class="text-sm text-stone-600 line-clamp-3 mb-4 leading-relaxed">
            ${item.description || ''}
          </p>

          ${item.includes_sides ? `
            <div class="p-3 bg-brand-cream rounded-2xl border border-brand-gold/30 text-xs text-brand-darkbrown font-semibold flex items-center gap-2 mb-4">
              <span class="text-base">🍱</span>
              <span>${item.includes_sides}</span>
            </div>
          ` : ''}
        </div>

        <!-- Action Button -->
        <button 
          data-add-id="${item.id}"
          ${isOutOfStock ? 'disabled' : ''}
          class="w-full py-3 px-4 rounded-2xl bg-brand-brown hover:bg-brand-darkbrown text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add to Order
        </button>
      </div>

    </div>
  `;
}

function setupItemEvents() {
  document.querySelectorAll('[data-add-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.addId;
      const item = menuData.find(i => i.id === id);
      if (item) {
        addToCart(item);
      }
    });
  });
}

function addToCart(item) {
  const existing = cart.find(c => c.item.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item, quantity: 1 });
  }
  updateCartUI();
  openCartDrawer();
}

function updateCartUI() {
  const countBadge = document.getElementById('cart-count');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartTotalAmount = document.getElementById('cart-total-amount');

  const totalQuantity = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  if (countBadge) {
    countBadge.innerText = totalQuantity;
    countBadge.style.display = totalQuantity > 0 ? 'inline-flex' : 'none';
  }

  if (cartTotalAmount) {
    cartTotalAmount.innerText = `₦${totalPrice.toLocaleString()}`;
  }

  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="p-8 text-center text-stone-500">
          <p class="font-medium">Your cart is empty.</p>
          <p class="text-xs mt-1">Select items from the menu to start your order.</p>
        </div>
      `;
      return;
    }

    cartItemsList.innerHTML = cart.map((c, idx) => `
      <div class="flex items-center justify-between p-3 bg-brand-cream rounded-2xl border border-brand-creamDark">
        <div class="flex-1 pr-3">
          <h4 class="font-serif font-bold text-sm text-brand-darkbrown">${c.item.name}</h4>
          <p class="text-xs text-brand-gold font-bold">₦${Number(c.item.price).toLocaleString()} each</p>
        </div>

        <div class="flex items-center gap-2">
          <button data-cart-minus="${idx}" class="w-7 h-7 rounded-full bg-white border border-brand-creamDark flex items-center justify-center text-brand-darkbrown font-bold hover:bg-brand-brown hover:text-white transition-colors">-</button>
          <span class="w-6 text-center font-bold text-sm">${c.quantity}</span>
          <button data-cart-plus="${idx}" class="w-7 h-7 rounded-full bg-white border border-brand-creamDark flex items-center justify-center text-brand-darkbrown font-bold hover:bg-brand-brown hover:text-white transition-colors">+</button>
        </div>
      </div>
    `).join('');

    cartItemsList.querySelectorAll('[data-cart-minus]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.cartMinus, 10);
        if (cart[idx].quantity > 1) {
          cart[idx].quantity -= 1;
        } else {
          cart.splice(idx, 1);
        }
        updateCartUI();
      });
    });

    cartItemsList.querySelectorAll('[data-cart-plus]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.cartPlus, 10);
        cart[idx].quantity += 1;
        updateCartUI();
      });
    });
  }
}

function setupCartModal() {
  const cartTrigger = document.getElementById('open-cart-btn');
  const cartClose = document.getElementById('close-cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const whatsappSubmit = document.getElementById('whatsapp-checkout-btn');

  cartTrigger?.addEventListener('click', () => openCartDrawer());
  cartClose?.addEventListener('click', () => closeCartDrawer());

  whatsappSubmit?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Please add at least one item to your order before checking out on WhatsApp.');
      return;
    }

    const noteInput = document.getElementById('customer-delivery-note')?.value || '';
    sendOrderToWhatsApp(noteInput);
  });
}

function openCartDrawer() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    cartModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    cartModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
}

function sendOrderToWhatsApp(deliveryNote) {
  const itemsText = cart.map(c => `• ${c.item.name} (${c.quantity}x) - ₦${(c.item.price * c.quantity).toLocaleString()}`).join('%0A');
  const totalPrice = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  let message = `*NEW ORDER - BEYOND BITES*%0A%0A`;
  message += `*Items Ordered:*%0A${itemsText}%0A%0A`;
  message += `*Total Amount:* ₦${totalPrice.toLocaleString()}%0A`;

  if (deliveryNote && deliveryNote.trim()) {
    message += `%0A*Delivery Note/Address:* ${encodeURIComponent(deliveryNote.trim())}%0A`;
  }

  message += `%0A*Delivery Location:* Port Harcourt%0A`;
  message += `_Sent via Beyond Bites Web App_`;

  const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

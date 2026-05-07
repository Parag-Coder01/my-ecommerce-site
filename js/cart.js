document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const taxEl = document.getElementById('summary-tax');
  const totalEl = document.getElementById('summary-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function renderCart() {
    const cart = App.getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="glass-card empty-cart">
          <i class="fas fa-shopping-basket"></i>
          <h2>Your cart is empty</h2>
          <p style="color: var(--text-secondary); margin: 15px 0 25px;">Looks like you haven't added anything yet.</p>
          <a href="index.html#catalog" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.style.opacity = '0.5';
      updateSummary(0);
      return;
    }

    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';

    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += item.price * item.quantity;

      const itemEl = document.createElement('div');
      itemEl.className = 'glass-card cart-item animate-fade-in';
      itemEl.style.animationDelay = `${index * 0.1}s`;

      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.name}</h3>
          <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
          <div class="cart-controls">
            <div class="qty-control">
              <button class="qty-btn qty-dec" data-id="${item.id}">-</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn qty-inc" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}" title="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div style="font-weight: 700; font-size: 1.2rem;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </div>
      `;

      container.appendChild(itemEl);
    });

    updateSummary(subtotal);
    attachEventListeners();
  }

  function updateSummary(subtotal) {
    const shipping = subtotal > 0 ? (subtotal > 500 ? 0 : 100) : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 && subtotal > 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    totalEl.textContent = `₹${total.toFixed(2)}`;
  }

  function attachEventListeners() {
    const cart = App.getCart();

    document.querySelectorAll('.qty-inc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity++;
          App.saveCart(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll('.qty-dec').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const item = cart.find(i => i.id === id);
        if (item && item.quantity > 1) {
          item.quantity--;
          App.saveCart(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const newCart = cart.filter(i => i.id !== id);
        App.saveCart(newCart);
        renderCart();
      });
    });
  }

  renderCart();
});

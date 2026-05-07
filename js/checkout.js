document.addEventListener('DOMContentLoaded', () => {
  const checkoutView = document.getElementById('checkout-view');
  const trackerView = document.getElementById('tracker-view');
  const form = document.getElementById('checkout-form');
  const itemsContainer = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');

  const ccNumber = document.getElementById('cc-number');
  const ccExp = document.getElementById('cc-exp');

  // Handle Payment Method Toggle
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const cardContainer = document.getElementById('card-details-container');
  
  if (cardContainer) {
    const cardInputs = cardContainer.querySelectorAll('input');
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'cod') {
          cardContainer.style.display = 'none';
          cardInputs.forEach(input => input.removeAttribute('required'));
        } else {
          cardContainer.style.display = 'grid';
          cardInputs.forEach(input => input.setAttribute('required', 'true'));
        }
      });
    });
  }

  // Load cart data
  const cart = App.getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.marginBottom = '10px';
    div.style.color = 'var(--text-secondary)';
    div.innerHTML = `
      <span>${item.name} (x${item.quantity})</span>
      <span>₹${(item.price * item.quantity).toFixed(2)}</span>
    `;
    itemsContainer.appendChild(div);
  });

  const shipping = subtotal > 500 ? 0 : 100;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  totalEl.textContent = `₹${total.toFixed(2)}`;

  // CC Input Masking (Simple)
  ccNumber.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
  });

  ccExp.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})/, '$1/$2').replace(/\/$/, '');
  });

  // Handle Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Create Order Object
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const order = {
      id: Math.floor(Math.random() * 1000000),
      date: new Date().toLocaleDateString(),
      items: cart,
      total: total,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card',
      status: 'Processing'
    };

    // Save to user profile if logged in
    const user = App.getUser();
    if (user) {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.email === user.email);
      if (userIndex > -1) {
        users[userIndex].orders = users[userIndex].orders || [];
        users[userIndex].orders.push(order);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }
    }

    // Clear Cart
    App.saveCart([]);

    // Show Tracker
    checkoutView.style.display = 'none';
    trackerView.style.display = 'flex';
    document.getElementById('order-id').textContent = order.id;

    startTracker();
  });

  function startTracker() {
    const steps = [
      { id: 'step-1', progress: 0, text: "We've received your order.", delay: 0 },
      { id: 'step-2', progress: 33, text: "Your order is being prepared and packed.", delay: 4000 },
      { id: 'step-3', progress: 66, text: "Your order is out for delivery.", delay: 8000 },
      { id: 'step-4', progress: 100, text: "Your order has been delivered! Enjoy.", delay: 12000 }
    ];

    const progressBar = document.getElementById('tracker-progress');
    const statusText = document.getElementById('tracker-status-text');

    steps.forEach((step, index) => {
      setTimeout(() => {
        // Mark previous steps as completed
        for (let i = 0; i < index; i++) {
          document.getElementById(steps[i].id).classList.remove('active');
          document.getElementById(steps[i].id).classList.add('completed');
        }

        // Set current step as active
        const currentEl = document.getElementById(step.id);
        currentEl.classList.add('active');
        
        progressBar.style.width = `${step.progress}%`;
        statusText.textContent = step.text;

      }, step.delay);
    });
  }
});

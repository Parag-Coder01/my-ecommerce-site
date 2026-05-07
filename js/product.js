document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  const product = window.products.find(p => p.id === productId);
  if (!product) { window.location.href = 'index.html'; return; }

  // Track recently viewed
  let rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  rv = rv.filter(id => id !== product.id);
  rv.unshift(product.id);
  localStorage.setItem('recentlyViewed', JSON.stringify(rv.slice(0, 10)));

  document.title = `${product.name} | Safari Premium`;
  document.getElementById('breadcrumb-cat').textContent = product.category;
  document.getElementById('breadcrumb-name').textContent = product.name;

  // Gallery
  let currentImgIdx = 0;
  const mainImg = document.getElementById('main-image');
  mainImg.src = product.images[0];
  mainImg.alt = product.name;

  const thumbsContainer = document.getElementById('thumbs-container');
  product.images.forEach((img, i) => {
    const thumb = document.createElement('div');
    thumb.className = `thumb ${i === 0 ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${img}" alt="${product.name} ${i + 1}">`;
    thumb.addEventListener('click', () => switchImage(i));
    thumbsContainer.appendChild(thumb);
  });

  function switchImage(idx) {
    currentImgIdx = idx;
    mainImg.style.opacity = 0;
    setTimeout(() => { mainImg.src = product.images[idx]; mainImg.style.opacity = 1; }, 150);
    document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  }

  document.getElementById('img-prev').addEventListener('click', () => {
    switchImage((currentImgIdx - 1 + product.images.length) % product.images.length);
  });
  document.getElementById('img-next').addEventListener('click', () => {
    switchImage((currentImgIdx + 1) % product.images.length);
  });

  // Zoom Modal
  document.getElementById('gallery-main').addEventListener('click', (e) => {
    if (e.target.closest('.gallery-nav') || e.target.closest('.wishlist-btn')) return;
    const modal = document.getElementById('zoom-modal');
    document.getElementById('zoom-image').src = product.images[currentImgIdx];
    modal.classList.add('active');
  });
  document.getElementById('zoom-close').addEventListener('click', () => {
    document.getElementById('zoom-modal').classList.remove('active');
  });
  document.getElementById('zoom-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });

  // Wishlist
  let wishlisted = JSON.parse(localStorage.getItem('wishlist') || '[]').includes(product.id);
  const wishBtn = document.getElementById('wishlist-btn');
  function updateWishBtn() {
    wishBtn.innerHTML = wishlisted ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    wishBtn.classList.toggle('active', wishlisted);
  }
  updateWishBtn();
  wishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    wishlisted = !wishlisted;
    let wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlisted) { if (!wl.includes(product.id)) wl.push(product.id); }
    else wl = wl.filter(id => id !== product.id);
    localStorage.setItem('wishlist', JSON.stringify(wl));
    updateWishBtn();
    App.showToast(wishlisted ? 'Added to Wishlist ❤️' : 'Removed from Wishlist');
  });

  // Badge
  const badge = document.getElementById('product-badge');
  badge.textContent = product.category;
  badge.className = `product-badge badge-${product.category}`;

  // Info
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = product.price.toLocaleString('en-IN');
  document.getElementById('product-desc').textContent = product.description;

  const mrp = Math.round(product.price * 1.3);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);
  document.getElementById('product-mrp').textContent = `₹${mrp.toLocaleString('en-IN')}`;
  document.getElementById('product-discount').textContent = `${discount}% off`;

  // Stars
  const starsEl = document.getElementById('product-stars');
  starsEl.innerHTML = generateStars(product.rating);
  document.getElementById('product-rating').textContent = product.rating;
  document.getElementById('product-reviews').textContent = `${product.reviews.toLocaleString()} Reviews`;

  function generateStars(rating) {
    let h = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) h += '<i class="fas fa-star"></i>';
      else if (i - 0.5 <= rating) h += '<i class="fas fa-star-half-alt"></i>';
      else h += '<i class="far fa-star"></i>';
    }
    return h;
  }

  // Size & Color Variants
  const sizes = product.specs?.Sizes || product.specs?.Size || null;
  const colors = product.specs?.Color || null;
  if (sizes && (sizes.includes(',') || sizes.includes('-'))) {
    document.getElementById('size-section').style.display = 'block';
    const sizeOpts = document.getElementById('size-options');
    const sizeList = sizes.includes('-') ? sizes.split('-').map(s => s.trim()) : sizes.split(',').map(s => s.trim());
    sizeList.forEach((s, i) => {
      const chip = document.createElement('button');
      chip.className = `variant-chip ${i === 0 ? 'active' : ''}`;
      chip.textContent = s;
      chip.addEventListener('click', () => {
        sizeOpts.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
      sizeOpts.appendChild(chip);
    });
  }

  // Quantity
  let qty = 1;
  const qtyDisp = document.getElementById('qty-display');
  document.getElementById('qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; qtyDisp.textContent = qty; } });
  document.getElementById('qty-plus').addEventListener('click', () => { if (qty < 10) { qty++; qtyDisp.textContent = qty; } });

  // Pincode check
  document.getElementById('pincode-check').addEventListener('click', () => {
    const pin = document.getElementById('pincode-input').value;
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      const days = Math.floor(Math.random() * 4) + 2;
      const d = new Date(); d.setDate(d.getDate() + days);
      const dateStr = d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
      const result = document.getElementById('delivery-result');
      document.getElementById('delivery-text').textContent = `Delivery by ${dateStr} — FREE delivery available`;
      result.style.display = 'block';
    } else {
      App.showToast('Please enter a valid 6-digit pincode');
    }
  });

  // Share copy
  document.getElementById('share-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => App.showToast('Link copied!'));
  });

  // Specs Table
  const tbody = document.querySelector('#specs-table tbody');
  if (product.specs) {
    Object.entries(product.specs).forEach(([key, val]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${key}</td><td>${val}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Review Summary with rating bars
  const reviewSummary = document.getElementById('review-summary');
  const totalReviews = product.reviews;
  const ratDist = [
    Math.round(totalReviews * 0.55),
    Math.round(totalReviews * 0.25),
    Math.round(totalReviews * 0.12),
    Math.round(totalReviews * 0.05),
    Math.round(totalReviews * 0.03)
  ];
  reviewSummary.innerHTML = `
    <div class="review-big-num">
      <div class="num">${product.rating}</div>
      <div class="stars-row">${generateStars(product.rating)}</div>
      <div class="total">${totalReviews.toLocaleString()} ratings</div>
    </div>
    <div class="rating-bars">
      ${[5,4,3,2,1].map((star, i) => `
        <div class="rating-bar-row">
          <span class="label">${star}★</span>
          <div class="bar"><div class="bar-fill" style="width:${(ratDist[i]/totalReviews*100).toFixed(0)}%"></div></div>
          <span class="count">${ratDist[i].toLocaleString()}</span>
        </div>
      `).join('')}
    </div>`;

  // Mock Reviews
  const reviewNames = ['Aarav S.','Priya M.','Rahul K.','Sneha T.','Vikram J.','Ananya P.','Arjun R.','Diya L.'];
  const reviewTexts = [
    'Absolutely love this product! Quality is top-notch and delivery was super fast. Totally worth the price.',
    'Great value for money. Exceeded my expectations. The packaging was also premium.',
    'Very good product. Would recommend to anyone looking for quality at this price range.',
    'Decent product overall. Works as described. Packaging could be slightly better.',
    'Outstanding quality! This is my second purchase and I\'m still impressed. Five stars!',
    'Perfect gift! My friend loved it. Will definitely buy again for sure.',
    'Solid build quality and feels premium in hand. Customer support was also helpful.',
    'Good product, fast delivery. Minor scratches on arrival but nothing major.'
  ];
  const avatarColors = ['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6','#ef4444','#0ea5e9','#14b8a6'];
  const reviewsContainer = document.getElementById('reviews-container');
  const userReviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]');

  function renderReviews() {
    reviewsContainer.innerHTML = '';
    const allReviews = [...userReviews];
    // Add mock reviews
    for (let i = 0; i < 6; i++) {
      const rStars = Math.floor(Math.random() * 2) + 4;
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      allReviews.push({
        name: reviewNames[i], text: reviewTexts[i], stars: rStars, daysAgo,
        color: avatarColors[i], verified: Math.random() > 0.3, helpful: Math.floor(Math.random() * 50)
      });
    }
    allReviews.forEach(r => {
      reviewsContainer.innerHTML += `
        <div class="review-card">
          <div class="review-avatar" style="background:${r.color};">${r.name.charAt(0)}</div>
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;flex-wrap:wrap;">
              <span class="review-name">${r.name}</span>
              ${r.verified ? '<span class="review-verified"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
              <span class="review-date">${r.daysAgo} days ago</span>
            </div>
            <div class="review-stars">${'<i class="fas fa-star"></i>'.repeat(r.stars)}${'<i class="far fa-star"></i>'.repeat(5 - r.stars)}</div>
            <p class="review-text">${r.text}</p>
            <div class="review-helpful">
              <button onclick="this.innerHTML='<i class=\\'fas fa-thumbs-up\\'></i> Helpful (${(r.helpful||0)+1})';this.style.color='var(--accent-primary)';this.style.borderColor='var(--accent-primary)';"><i class="far fa-thumbs-up"></i> Helpful (${r.helpful||0})</button>
              <button onclick="this.innerHTML='Reported';this.disabled=true;"><i class="far fa-flag"></i> Report</button>
            </div>
          </div>
        </div>`;
    });
  }
  renderReviews();

  // Write Review
  let userRating = 0;
  document.querySelectorAll('#star-input i').forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.val);
      document.querySelectorAll('#star-input i').forEach((s, i) => {
        s.className = i < val ? 'fas fa-star active' : 'far fa-star';
      });
    });
    star.addEventListener('click', () => { userRating = parseInt(star.dataset.val); });
  });
  document.getElementById('star-input').addEventListener('mouseleave', () => {
    document.querySelectorAll('#star-input i').forEach((s, i) => {
      s.className = i < userRating ? 'fas fa-star active' : 'far fa-star';
    });
  });
  document.getElementById('submit-review').addEventListener('click', () => {
    const name = document.getElementById('review-name-input').value.trim() || 'Anonymous';
    const text = document.getElementById('review-text-input').value.trim();
    if (!text || userRating === 0) { App.showToast('Please add rating and review text'); return; }
    userReviews.unshift({ name, text, stars: userRating, daysAgo: 0, color: avatarColors[Math.floor(Math.random()*8)], verified: true, helpful: 0 });
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(userReviews));
    document.getElementById('review-name-input').value = '';
    document.getElementById('review-text-input').value = '';
    userRating = 0;
    document.querySelectorAll('#star-input i').forEach(s => s.className = 'far fa-star');
    renderReviews();
    App.showToast('Review submitted! Thank you 🎉');
  });

  // FAQ
  const faqContainer = document.getElementById('faq-container');
  const faqs = [
    { q: `Is this ${product.name} original?`, a: 'Yes, all products sold on Safari are 100% genuine and sourced directly from authorized distributors.' },
    { q: 'What is the return/exchange policy?', a: 'We offer a 30-day hassle-free return policy. If you\'re not satisfied, you can return or exchange the product within 30 days of delivery.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-7 business days. Express delivery (1-2 days) is available in select cities for an additional ₹99.' },
    { q: 'Is there a warranty?', a: `This product comes with a 1-year manufacturer warranty covering manufacturing defects. Extended warranty plans are available at checkout.` },
    { q: 'Can I get this gift wrapped?', a: 'Yes! We offer premium gift wrapping for ₹49. You can add this option during checkout.' }
  ];
  faqs.forEach((faq, i) => {
    faqContainer.innerHTML += `
      <div style="border-bottom:1px solid var(--border-color);padding:18px 0;cursor:pointer;" onclick="this.querySelector('.faq-a').style.display=this.querySelector('.faq-a').style.display==='block'?'none':'block';this.querySelector('.faq-icon').classList.toggle('fa-plus');this.querySelector('.faq-icon').classList.toggle('fa-minus');">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:.95rem;">
          <span><i class="fas fa-question-circle" style="color:var(--accent-primary);margin-right:8px;"></i>${faq.q}</span>
          <i class="fas fa-plus faq-icon" style="font-size:.8rem;color:var(--text-secondary);"></i>
        </div>
        <div class="faq-a" style="display:none;margin-top:10px;color:var(--text-secondary);font-size:.9rem;line-height:1.7;padding-left:28px;">${faq.a}</div>
      </div>`;
  });

  // Related Products
  const related = window.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedGrid = document.getElementById('related-grid');
  related.forEach(rp => {
    relatedGrid.innerHTML += `
      <a href="product.html?id=${rp.id}" class="related-card">
        <img src="${rp.images[0]}" alt="${rp.name}" loading="lazy">
        <div class="related-card-info">
          <h4>${rp.name}</h4>
          <span class="price">₹${rp.price.toLocaleString('en-IN')}</span>
          <div class="r-rating">${generateStars(rp.rating)} <span style="color:var(--text-secondary);font-size:.75rem;">(${rp.reviews})</span></div>
        </div>
      </a>`;
  });

  // Bought Together
  const btProducts = window.products.filter(p => p.id !== product.id).sort(() => Math.random() - 0.5).slice(0, 2);
  if (btProducts.length >= 2) {
    document.getElementById('bought-together').style.display = 'block';
    const btItems = document.getElementById('bt-items');
    const allItems = [product, ...btProducts];
    const totalPrice = allItems.reduce((s, p) => s + p.price, 0);
    allItems.forEach((p, i) => {
      btItems.innerHTML += `
        <div class="bt-item">
          <a href="product.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.name}"></a>
          <p>${p.name}</p>
          <span class="bt-price">₹${p.price.toLocaleString('en-IN')}</span>
        </div>
        ${i < allItems.length - 1 ? '<span class="bt-plus">+</span>' : ''}`;
    });
    btItems.innerHTML += `
      <div class="bt-total" style="margin-left:auto;text-align:center;">
        <div style="font-size:.85rem;color:var(--text-secondary);margin-bottom:5px;">Total Price</div>
        <div class="bt-total-price" style="font-size:1.3rem;font-weight:800;margin-bottom:8px;">₹${totalPrice.toLocaleString('en-IN')}</div>
        <button class="btn btn-primary" style="padding:8px 20px;font-size:.85rem;" onclick="addBundleToCart()"><i class="fas fa-cart-plus"></i> Add All</button>
      </div>`;
    window.addBundleToCart = function() {
      allItems.forEach(p => App.addToCart({ id: p.id, name: p.name, price: p.price, image: p.images[0], category: p.category }));
      App.showToast('All items added to cart! 🎉');
    };
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Add to Cart
  document.getElementById('add-cart-btn').addEventListener('click', () => {
    for (let i = 0; i < qty; i++) {
      App.addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0], category: product.category });
    }
  });

  // Buy Now
  document.getElementById('buy-now-btn').addEventListener('click', () => {
    for (let i = 0; i < qty; i++) {
      App.addToCart({ id: product.id, name: product.name, price: product.price, image: product.images[0], category: product.category });
    }
    window.location.href = 'checkout.html';
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') switchImage((currentImgIdx - 1 + product.images.length) % product.images.length);
    if (e.key === 'ArrowRight') switchImage((currentImgIdx + 1) % product.images.length);
    if (e.key === 'Escape') document.getElementById('zoom-modal').classList.remove('active');
  });

  // Scroll to reviews on rating click
  const ratingScroll = document.getElementById('rating-scroll-target');
  if (ratingScroll) {
    ratingScroll.addEventListener('click', () => {
      const reviewTabBtn = document.querySelector('.tab-btn[data-tab="reviews"]');
      if (reviewTabBtn) reviewTabBtn.click();
      
      const tabsSection = document.querySelector('.tabs');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});

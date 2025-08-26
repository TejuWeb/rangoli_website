
    // Sample product data - replace with real images and data as needed
    const products = [
        {id:1, title:'Traditional Lotus Rangoli', category:'traditional', price:499, desc:'Hand-drawn lotus rangoli with natural pigments.', img:'../Img/1.jpg'},
        {id:2, title:'Floral Mandala (Medium)', category:'modern', price:799, desc:'Bright floral mandala design, prints available on canvas.', img:'../Img/2.jpg'},
        {id:3, title:'Diwali Spark Rangoli', category:'traditional', price:1199, desc:'Large rangoli with metallic pigments for Diwali display.', img:'../Img/3.jpg'},
        {id:4, title:'Name Custom Rangoli (Small)', category:'custom', price:299, desc:'Personalised name rangoli made to order.', img:'../Img/4.jpg'},
        {id:5, title:'Modern Abstract Rangoli', category:'modern', price:999, desc:'Abstract shapes and contemporary colours for modern interiors.', img:'../Img/5.jpg'}
    ];

    const el = (id) => document.getElementById(id);

    function currency(n){ return '₹' + n.toFixed(0); }

    // Render product grid
    function renderProducts(list){
      const grid = el('productsGrid'); grid.innerHTML = '';
      list.forEach(p => {
        const card = document.createElement('article'); card.className='product';
        card.innerHTML = `
          <div class="thumb"><img src="${p.img}" alt="${p.title}"></div>
          <div class="p-title">${p.title}</div>
          <div class="muted">${p.desc}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="price">${currency(p.price)}</div>
            <div class="muted">${p.category}</div>
          </div>
          <footer>
            <button class="btn-small" data-id="${p.id}" aria-label="View ${p.title}">View</button>
            <button class="btn-small" data-buy="${p.id}" aria-label="Buy ${p.title}">Buy</button>
          </footer>
        `;
        grid.appendChild(card);
      })
    }

    // Initial render
    renderProducts(products);

    // Search & filter
    el('searchInput').addEventListener('input', ()=>applyFilters());
    el('categoryFilter').addEventListener('change', ()=>applyFilters());

    function applyFilters(){
      const q = el('searchInput').value.trim().toLowerCase();
      const cat = el('categoryFilter').value;
      const filtered = products.filter(p => {
        if(cat!=='all' && p.category !== cat) return false;
        if(q==='') return true;
        return (p.title + ' ' + p.desc + ' ' + p.category).toLowerCase().includes(q);
      });
      renderProducts(filtered);
    }

    // Modal behavior
    const modal = el('modal');
    document.body.addEventListener('click', (e)=>{
      const view = e.target.closest('[data-id]');
      const buy = e.target.closest('[data-buy]');
      if(view){ const id = +view.dataset.id; openModal(id); }
      if(buy){ const id = +buy.dataset.buy; addToCartId(id,1); }
    });

    el('closeModal').addEventListener('click', ()=>closeModal());
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

    function openModal(id){
      const p = products.find(x=>x.id===id);
      if(!p) return;
      el('modalTitle').textContent = p.title;
      el('modalDesc').textContent = p.desc;
      el('modalCategory').textContent = p.category;
      el('modalPrice').textContent = currency(p.price);
      el('modalQty').value = 1;
      el('modalImage').innerHTML = `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover" alt="${p.title}">`;
      el('addToCart').dataset.add = p.id;
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    }
    function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }

    el('addToCart').addEventListener('click', ()=>{
      const id = +el('addToCart').dataset.add; const q = +el('modalQty').value || 1;
      addToCartId(id,q); closeModal();
    });

    // Simple cart implementation using localStorage
    function getCart(){ return JSON.parse(localStorage.getItem('rangoli_cart')||'[]'); }
    function saveCart(c){ localStorage.setItem('rangoli_cart', JSON.stringify(c)); updateCartUI(); }

    function addToCartId(id,qty=1){
      const p = products.find(x=>x.id===id); if(!p) return;
      const c = getCart();
      const found = c.find(i=>i.id===id);
      if(found) found.qty += qty; else c.push({id:p.id, title:p.title, price:p.price, qty});
      saveCart(c);
      openCartPanel();
    }

    function updateCartUI(){
      const c = getCart();
      const count = c.reduce((s,i)=>s+i.qty,0);
      const countEl = el('cartCount');
      if(count>0){ countEl.style.display='inline-block'; countEl.textContent = count; } else { countEl.style.display='none'; }

      el('cartItems').innerHTML = c.length ? c.map(item=>`<div style="display:flex;justify-content:space-between;margin-bottom:8px"><div><strong>${item.title}</strong><div class="muted">Qty: ${item.qty}</div></div><div>${currency(item.price*item.qty)}</div></div>`).join('') : '<div class="muted">Cart is empty.</div>';
      const total = c.reduce((s,i)=>s + i.price*i.qty,0);
      el('cartTotal').textContent = currency(total);
    }

    // Cart panel toggles
    function openCartPanel(){ el('cartPanel').style.display='block'; }
    function closeCartPanel(){ el('cartPanel').style.display='none'; }

    el('open-cart').addEventListener('click', ()=>{
      const panel = el('cartPanel'); panel.style.display = panel.style.display==='block' ? 'none' : 'block'; updateCartUI();
    });
    el('closeCart').addEventListener('click', ()=>closeCartPanel());

    el('checkout').addEventListener('click', ()=>{
      // Simple simulated checkout — in real site integrate payment gateway or server
      const c = getCart(); if(c.length===0){ alert('Your cart is empty.'); return; }
      const total = c.reduce((s,i)=>s + i.price*i.qty,0);
      const name = prompt('Enter your name for order (demo):');
      if(!name) return;
      // simulate order creation
      localStorage.removeItem('rangoli_cart'); updateCartUI(); closeCartPanel(); alert('Thank you '+name+"! Your order for "+currency(total)+" is received (demo). We'll contact you via email to confirm.");
    });

    // Form handling (demo only)
    el('contactForm').addEventListener('submit', (e)=>{
      e.preventDefault(); const fd = new FormData(e.target);
      // In a real site you would POST this to a server. Here we'll just show a friendly message.
      alert('Thanks ' + fd.get('name') + '! Your request has been sent. We will reply to ' + fd.get('email') + '.');
      e.target.reset();
    });

    // wire up dynamic event listeners for newly rendered buttons
    // use mutation observer to attach handlers after rendering
    const gridObserver = new MutationObserver(()=>{
      document.querySelectorAll('[data-id]').forEach(btn=>btn.onclick = ()=>openModal(+btn.dataset.id));
      document.querySelectorAll('[data-buy]').forEach(btn=>btn.onclick = ()=>addToCartId(+btn.dataset.buy,1));
    });
    gridObserver.observe(el('productsGrid'), {childList:true, subtree:true});

    // initialize
    document.getElementById('year').textContent = new Date().getFullYear();
    updateCartUI();


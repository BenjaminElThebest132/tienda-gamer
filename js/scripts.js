window.comprar = function(productName){
  localStorage.setItem('selectedProduct', productName);
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({product: productName, at: new Date().toISOString()});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  location.href = 'contacto.html';
};

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const el = document.getElementById('cartCount');
  if(el) el.textContent = cart.length;
}

window.showPanel = function(panel){
  const title = document.getElementById('panelTitle');
  if(title) title.textContent = panel === 'productos' ? 'Productos' : 'Pedidos';

  if(panel === 'pedidos') renderOrders();

  if(panel === 'productos'){
    const container = document.getElementById('ordersContainer');
    if(!container) return;

    container.innerHTML = `
      <h3>Productos Registrados</h3>
      <div id="productsTable"></div>

      <h3>Agregar Producto</h3>
      <form id="addProductForm">
        <label for="productName">Nombre:</label>
        <input type="text" id="productName" required>

        <label for="productPrice">Precio:</label>
        <input type="number" id="productPrice" required>

        <label for="productPlatform">Plataforma:</label>
        <input type="text" id="productPlatform">

        <button type="submit">Agregar Producto</button>
      </form>
    `;

    renderProducts();

    const form = document.getElementById('addProductForm');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('productName').value.trim();
      const price = parseFloat(document.getElementById('productPrice').value);
      const platform = document.getElementById('productPlatform').value.trim();

      if(!name || isNaN(price)){
        alert('Nombre y precio son obligatorios.');
        return;
      }

      addProduct(name, price, platform);
      form.reset();
    });
  }
};

function addProduct(name, price, platform){
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const id = Date.now();
  products.push({id, name, price, platform});
  localStorage.setItem('products', JSON.stringify(products));
  renderProducts();
}

function renderProducts(){
  const container = document.getElementById('productsTable');
  if(!container) return;

  const products = JSON.parse(localStorage.getItem('products') || '[]');
  if(products.length === 0){
    container.innerHTML = '<p>No hay productos registrados.</p>';
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Plataforma</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>`;

  products.forEach(p => {
    html += `<tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td>${escapeHtml(p.platform || '')}</td>
      <td><button onclick="deleteProduct(${p.id})">Eliminar</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

window.deleteProduct = function(id){
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(filtered));
  renderProducts();
};

window.clearAllOrders = function(){
  if(!confirm('¿Vaciar todos los pedidos? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem('orders');
  localStorage.removeItem('cart');
  renderOrders();
  updateCartCount();
};

function renderOrders(){
  const container = document.getElementById('ordersContainer');
  if(!container) return;
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if(orders.length === 0){
    container.innerHTML = '<p>No hay pedidos registrados.</p>';
    return;
  }

  let html = `<table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Nombre</th>
        <th>Email</th>
        <th>Producto</th>
        <th>Cant.</th>
        <th>Plataforma</th>
        <th>Ciudad</th>
        <th>Fecha</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>`;

  orders.forEach(o => {
    html += `<tr>
      <td>${o.id}</td>
      <td>${escapeHtml(o.name)}</td>
      <td>${escapeHtml(o.email)}</td>
      <td>${escapeHtml(o.product)}</td>
      <td>${o.quantity}</td>
      <td>${escapeHtml(o.platform || '')}</td>
      <td>${escapeHtml(o.city || '')}</td>
      <td>${new Date(o.date).toLocaleString()}</td>
      <td><button onclick="deleteOrder(${o.id})">Eliminar</button></td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

window.deleteOrder = function(id){
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const filtered = orders.filter(o => o.id !== id);
  localStorage.setItem('orders', JSON.stringify(filtered));
  renderOrders();
  updateCartCount();
};

// Escape simple para evitar HTML injection
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// VALIDACIÓN DEL FORMULARIO CONTACTO
document.addEventListener('DOMContentLoaded', function(){
  updateCartCount();

  // Prefill producto si viene de "Comprar"
  const selected = localStorage.getItem('selectedProduct');
  if(selected){
    const selEl = document.getElementById('product');
    if(selEl){
      let found = false;
      for(const opt of selEl.options){
        if(opt.value === selected){ opt.selected = true; found = true; break; }
      }
      if(!found){
        const option = document.createElement('option');
        option.textContent = selected;
        option.value = selected;
        option.selected = true;
        selEl.appendChild(option);
      }
    }
    localStorage.removeItem('selectedProduct');
  }

  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      clearAllErrors();
      document.getElementById('formSuccess').textContent = '';

      const name = (document.getElementById('name') || {}).value?.trim() || '';
      const email = (document.getElementById('email') || {}).value?.trim() || '';
      const product = (document.getElementById('product') || {}).value || '';
      const quantity = Number((document.getElementById('quantity') || {}).value || 0);
      const platform = (document.getElementById('platform') || {}).value || '';
      const city = (document.getElementById('city') || {}).value || '';
      const message = (document.getElementById('message') || {}).value?.trim() || '';
      const terms = !!(document.getElementById('terms') || {}).checked;

      let valid = true;
      if(name === ''){ setError('errorName','Ingresa tu nombre completo.'); valid = false; }
      if(!validateEmail(email)){ setError('errorEmail','Correo inválido.'); valid = false; }
      if(!product){ setError('errorProduct','Selecciona un producto.'); valid = false; }
      if(!Number.isFinite(quantity) || quantity < 1){ setError('errorQuantity','La cantidad debe ser al menos 1.'); valid = false; }
      if(message && message.length > 0 && message.length < 10){ setError('errorMessage','Si escribes un mensaje, mínimo 10 caracteres.'); valid = false; }
      if(!terms){ setError('errorTerms','Acepta los términos y condiciones.'); valid = false; }

      if(!valid) return;

      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = { id: Date.now(), name, email, product, quantity, platform, city, message, date: new Date().toISOString() };
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));

      document.getElementById('formSuccess').textContent = 'Pedido registrado correctamente.';
      form.reset();
      updateCartCount();
    });

    form.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', function(){
        const err = document.getElementById('error' + capitalize(el.id));
        if(err) err.textContent = '';
        const success = document.getElementById('formSuccess');
        if(success) success.textContent = '';
      });
    });
  }

  if(document.location.pathname.endsWith('admin.html') || document.title.toLowerCase().includes('admin')){
    renderOrders();
  }

  const toggleBtn = document.getElementById('toggleProductsBtn');
  const productsDiv = document.getElementById('productosDiv');
  if(toggleBtn && productsDiv){
    toggleBtn.addEventListener('click', ()=>{
      if(productsDiv.style.display === 'none'){
        productsDiv.style.display = 'grid';
        toggleBtn.textContent = 'Ocultar Juegos';
      } else {
        productsDiv.style.display = 'none';
        toggleBtn.textContent = 'Ver Juegos';
      }
    });
    productsDiv.style.display = 'none';
  }
});

function setError(id, msg){ const el = document.getElementById(id); if(el) el.textContent = msg; }
function clearAllErrors(){ document.querySelectorAll('.error').forEach(e => e.textContent = ''); }
function validateEmail(email){ const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return re.test(email); }
function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }

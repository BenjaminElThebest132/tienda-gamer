// ----------------- FUNCIONES DE CARRITO Y COMPRA -----------------
window.comprar = function(productName){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const existing = cart.find(item => item.product === productName);
  if(existing){
    existing.quantity += 1;
  } else {
    cart.push({product: productName, quantity: 1, at: new Date().toISOString()});
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
};

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const el = document.querySelectorAll('#cartCount');
  el.forEach(span => span.textContent = cart.reduce((total, item) => total + item.quantity, 0));
}

// ----------------- MOSTRAR / OCULTAR CARRITO -----------------
function renderCart(){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cartItems');
  if(!container) return;

  if(cart.length === 0){
    container.innerHTML = '<p>El carrito está vacío 🛒</p>';
    return;
  }

  let html = '<ul style="list-style:none; padding:0;">';
  cart.forEach((item, index) => {
    html += `<li style="margin-bottom:10px;">
      ${item.product} x ${item.quantity} 
      <button onclick="changeQuantity(${index},1)">➕</button> 
      <button onclick="changeQuantity(${index},-1)">➖</button> 
      <button onclick="removeItem(${index})">❌</button>
    </li>`;
  });
  html += '</ul>';
  html += `<button onclick="clearCart()" style="margin-top:10px; padding:5px 10px;">Vaciar Carrito</button>`;

  container.innerHTML = html;
}

window.changeQuantity = function(index, delta){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if(!cart[index]) return;
  cart[index].quantity += delta;
  if(cart[index].quantity < 1) cart[index].quantity = 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

window.removeItem = function(index){
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index,1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

window.clearCart = function(){
  if(confirm('¿Vaciar todo el carrito? Esta acción no se puede deshacer.')){
    localStorage.removeItem('cart');
    updateCartCount();
    renderCart();
  }
}

// Abrir y cerrar carrito
document.addEventListener('DOMContentLoaded', function(){
  updateCartCount();
  renderCart();

  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartSection = document.getElementById('cartSection');

  if(openCartBtn && cartSection){
    openCartBtn.addEventListener('click', () => cartSection.style.display = 'block');
  }

  if(closeCartBtn && cartSection){
    closeCartBtn.addEventListener('click', () => cartSection.style.display = 'none');
  }
});

// ----------------- LOGIN / SESIONES -----------------
document.addEventListener('DOMContentLoaded', function(){
  const role = localStorage.getItem('userRole');
  const modal = document.getElementById('loginModal');
  const adminMenuItem = document.getElementById('adminMenuItem');

  let logoutBtn = document.getElementById('logoutBtn');
  if(!logoutBtn){
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Cerrar Sesión';
    logoutBtn.style.marginLeft = '10px';
    logoutBtn.style.padding = '5px 10px';
    logoutBtn.style.cursor = 'pointer';
    if(document.querySelector('.header-inner')) document.querySelector('.header-inner').appendChild(logoutBtn);
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userRole');
    alert('Sesión cerrada');
    location.reload();
  });

  if(!role){
    modal.style.display = 'flex';
    logoutBtn.style.display = 'none';
  } else {
    modal.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  }

  if(adminMenuItem){
    adminMenuItem.style.display = (role === 'admin') ? 'inline-block' : 'none';
  }

  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if(email === 'admin@tiendagamer.cl' && password === '1234'){
      localStorage.setItem('userRole','admin');
      if(adminMenuItem) adminMenuItem.style.display = 'inline-block';
      logoutBtn.style.display = 'inline-block';
      alert('Bienvenido Admin');
    } else {
      localStorage.setItem('userRole','cliente');
      if(adminMenuItem) adminMenuItem.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      alert('Bienvenido Cliente');
    }
    modal.style.display = 'none';
  });
});

// ----------------- ADMIN PANEL -----------------
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

// ----------------- FORMULARIO DE CONTACTO -----------------
document.addEventListener('DOMContentLoaded', function(){
  const contactForm = document.getElementById('contactForm');
  if(!contactForm) return;

  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    let valid = true;

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const product = document.getElementById('product');
    const quantity = document.getElementById('quantity');
    const terms = document.getElementById('terms');

    document.querySelectorAll('.error').forEach(el => el.textContent = '');

    if(!name.value.trim()){
      document.getElementById('errorName').textContent = 'El nombre es obligatorio';
      valid = false;
    }

    if(!email.value.trim()){
      document.getElementById('errorEmail').textContent = 'El correo es obligatorio';
      valid = false;
    } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){
      document.getElementById('errorEmail').textContent = 'El correo no es válido';
      valid = false;
    }

    if(!product.value.trim()){
      document.getElementById('errorProduct').textContent = 'Debes seleccionar un producto';
      valid = false;
    }

    if(quantity.value < 1){
      document.getElementById('errorQuantity').textContent = 'Cantidad mínima es 1';
      valid = false;
    }

    if(!terms.checked){
      document.getElementById('errorTerms').textContent = 'Debes aceptar los términos';
      valid = false;
    }

    if(valid){
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const id = Date.now();
      orders.push({
        id,
        name: name.value.trim(),
        email: email.value.trim(),
        product: product.value.trim(),
        quantity: parseInt(quantity.value),
        platform: document.getElementById('platform').value.trim(),
        city: document.getElementById('city').value.trim(),
        message: document.getElementById('message').value.trim(),
        date: new Date().toISOString()
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      updateCartCount();

      contactForm.reset();
      document.getElementById('formSuccess').textContent = 'Pedido enviado correctamente 👍';
      setTimeout(() => document.getElementById('formSuccess').textContent = '', 5000);
    }
  });
});

// ----------------- TOGGLE JUEGOS -----------------
document.addEventListener('DOMContentLoaded', function(){
  const toggleBtn = document.getElementById('toggleGames');
  const productsSection = document.getElementById('productosDiv');
  if(toggleBtn && productsSection){
    let visible = false;
    productsSection.style.display = 'none';
    toggleBtn.addEventListener('click', () => {
      visible = !visible;
      if(visible){
        productsSection.style.display = 'grid';
        setTimeout(() => {
          productsSection.style.opacity = 1;
          productsSection.style.transform = 'translateY(0)';
        }, 50);
        toggleBtn.textContent = 'Ocultar Juegos';
      } else {
        productsSection.style.opacity = 0;
        productsSection.style.transform = 'translateY(30px)';
        setTimeout(() => productsSection.style.display = 'none', 500);
        toggleBtn.textContent = 'Ver Juegos';
      }
    });
    productsSection.style.opacity = 0;
    productsSection.style.transform = 'translateY(30px)';
    productsSection.style.transition = 'all 0.5s ease';
  }
});

/* =============================================
   LA ROUPAS — JavaScript
   ============================================= */

(() => {
  'use strict';

  // ── Navbar scroll ──────────────────────────
  const navbar    = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });

  // ── Menu hamburguer ────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMenu.classList.toggle('open', open);
  });
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
    }
  });

  // ── Voltar ao topo ─────────────────────────
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Reveal on scroll ──────────────────────
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), (i % 4) * 100);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── Newsletter ─────────────────────────────
  const form = document.getElementById('newsletterForm');
  const msg  = document.getElementById('newsletterMsg');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      msg.textContent = 'Cadastrando...';
      setTimeout(() => {
        msg.textContent = `Obrigada! O e-mail ${email} foi cadastrado com sucesso. ♡`;
        form.reset();
      }, 800);
    });
  }

  // ============================================
  //  ABAS DE CATEGORIA
  // ============================================
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function activateTab(tabName) {
    tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    tabPanels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tabName));
    bindCardEvents();
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });

  // Cards das categorias também ativam a aba correspondente
  document.querySelectorAll('.categoria-card[data-tab]').forEach(card => {
    card.addEventListener('click', e => {
      const tab = card.dataset.tab;
      document.getElementById('colecao').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => activateTab(tab), 400);
    });
  });

  // ============================================
  //  SELETOR DE TAMANHO — delegado ao documento
  // ============================================
  document.addEventListener('click', e => {
    if (!e.target.classList.contains('size-btn')) return;
    const card = e.target.closest('.produto-card');
    if (!card) return;
    card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
  });

  // ============================================
  //  CARRINHO
  // ============================================
  let cart = [];

  const cartSidebar   = document.getElementById('cartSidebar');
  const cartOverlay   = document.getElementById('cartOverlay');
  const cartBtn       = document.getElementById('cartBtn');
  const cartClose     = document.getElementById('cartClose');
  const cartBadge     = document.getElementById('cartBadge');
  const cartEmpty     = document.getElementById('cartEmpty');
  const cartItemsEl   = document.getElementById('cartItems');
  const cartFooter    = document.getElementById('cartFooter');
  const cartSubtotal  = document.getElementById('cartSubtotal');
  const cartTotal     = document.getElementById('cartTotal');
  const cartFreteMsg  = document.getElementById('cartFreteMsg');
  const cartFinalizar = document.getElementById('cartFinalizar');
  const cartLimpar    = document.getElementById('cartLimpar');
  const cartGoShop    = document.getElementById('cartGoShop');
  const toastEl       = document.getElementById('toast');

  const FRETE_GRATIS = 199;

  function openCart()  {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  if (cartGoShop) cartGoShop.addEventListener('click', closeCart);

  // Toast
  let toastTimer;
  function showToast(msg, type = '') {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className = 'toast show ' + type;
    toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2800);
  }

  // Badge pop
  function animateBadge() {
    cartBadge.classList.remove('pop');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('pop');
    setTimeout(() => cartBadge.classList.remove('pop'), 300);
  }

  function brl(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function itemKey(id, size) { return `${id}__${size}`; }

  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
    const qty   = cart.reduce((sum, item) => sum + item.qty, 0);

    cartBadge.textContent = qty;

    const isEmpty = cart.length === 0;
    cartEmpty.classList.toggle('hidden', !isEmpty);
    cartItemsEl.classList.toggle('hidden', isEmpty);
    cartFooter.classList.toggle('hidden', isEmpty);

    if (isEmpty) return;

    cartItemsEl.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.key = itemKey(item.id, item.size);
      li.innerHTML = `
        <div class="cart-item__img" id="cimg-${item.id}">
          <img src="images/${item.img}" alt="${item.nome}"
               onerror="this.parentElement.classList.add('no-img')" />
        </div>
        <div class="cart-item__details">
          <h5>${item.nome}</h5>
          <span class="cart-item__size">Tam: ${item.size}</span>
          <p class="cart-item__preco">${brl(item.preco * item.qty)}</p>
          <div class="cart-item__qty">
            <button class="qty-minus" data-key="${itemKey(item.id, item.size)}">−</button>
            <span>${item.qty}</span>
            <button class="qty-plus" data-key="${itemKey(item.id, item.size)}">+</button>
          </div>
        </div>
        <button class="cart-item__remove" data-key="${itemKey(item.id, item.size)}" aria-label="Remover">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      cartItemsEl.appendChild(li);
    });

    cartSubtotal.textContent = brl(total);
    cartTotal.textContent    = brl(total);

    if (total >= FRETE_GRATIS) {
      cartFreteMsg.className   = 'cart-frete gratis';
      cartFreteMsg.textContent = '✓ Frete grátis aplicado!';
    } else {
      const falta = FRETE_GRATIS - total;
      cartFreteMsg.className   = 'cart-frete faltam';
      cartFreteMsg.textContent = `Faltam ${brl(falta)} para frete grátis`;
    }

    cartItemsEl.querySelectorAll('.qty-minus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.key, -1));
    });
    cartItemsEl.querySelectorAll('.qty-plus').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.key, +1));
    });
    cartItemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.dataset.key));
    });
  }

  function changeQty(key, delta) {
    const idx = cart.findIndex(i => itemKey(i.id, i.size) === key);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCart();
  }

  function removeItem(key) {
    cart = cart.filter(i => itemKey(i.id, i.size) !== key);
    renderCart();
    showToast('Item removido do carrinho.');
  }

  // Vincula eventos dos botões "Adicionar" de todos os cards visíveis
  function bindCardEvents() {
    document.querySelectorAll('.produto-card').forEach(card => {
      const addBtn = card.querySelector('.btn-add-cart');
      if (!addBtn || addBtn._bound) return;
      addBtn._bound = true;

      addBtn.addEventListener('click', () => {
        const selectedSize = card.querySelector('.size-btn.selected');
        if (!selectedSize) {
          showToast('Selecione um tamanho primeiro!', 'error');
          const opts = card.querySelector('.size-options');
          opts.style.animation = 'none';
          void opts.offsetWidth;
          opts.style.animation = 'shake .3s ease';
          return;
        }

        const id    = card.dataset.id;
        const nome  = card.dataset.nome;
        const preco = parseFloat(card.dataset.preco);
        const img   = card.dataset.img || `produto${id}.jpg`;
        const size  = selectedSize.dataset.size;
        const key   = itemKey(id, size);

        const existing = cart.find(i => itemKey(i.id, i.size) === key);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({ id, nome, preco, img, size, qty: 1 });
        }

        renderCart();
        animateBadge();
        showToast(`${nome} (${size}) adicionado ao carrinho! ♡`, 'success');

        const original = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado!';
        addBtn.classList.add('added');
        setTimeout(() => {
          addBtn.innerHTML = original;
          addBtn.classList.remove('added');
        }, 1500);
      });
    });
  }

  // Limpar carrinho
  cartLimpar.addEventListener('click', () => {
    if (!confirm('Deseja remover todos os itens do carrinho?')) return;
    cart = [];
    renderCart();
    showToast('Carrinho limpo.');
  });

  // Finalizar compra — envia pedido pelo WhatsApp
  const WHATSAPP_NUMBER = '5583981801744'; // ← troque pelo seu número com DDI+DDD, sem espaços ou símbolos

  cartFinalizar.addEventListener('click', () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);

    const linhas = cart.map(i =>
      `▪ ${i.nome}\n   Tamanho: ${i.size} | Qtd: ${i.qty} | ${brl(i.preco * i.qty)}`
    ).join('\n');

    const mensagem =
      `🛍️ *NOVO PEDIDO — LA ROUPAS*\n\n` +
      `${linhas}\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `💰 *Total: ${brl(total)}*\n` +
      (total >= FRETE_GRATIS ? `🚚 *Frete grátis aplicado!*\n` : '') +
      `\nOlá! Gostaria de finalizar esse pedido. ♡`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    cart = [];
    renderCart();
    closeCart();
  });

  // Inicia
  renderCart();
  bindCardEvents();

})();

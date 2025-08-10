// Toggle menú móvil + accesibilidad
const btn = document.querySelector('.nav__toggle');
const menu = document.getElementById('navmenu');
if(btn && menu){
  btn.addEventListener('click',()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
    btn.setAttribute('aria-expanded',!expanded);
    menu.toggleAttribute('aria-expanded');
    menu.setAttribute('aria-expanded',!expanded);
  });
}

// Sombra al hacer scroll en la nav
const navbar = document.getElementById('navbar');
const onScroll = ()=>{
  if(!navbar) return;
  if(window.scrollY>24){ navbar.style.boxShadow='0 6px 24px rgba(0,0,0,.35)'; }
  else{ navbar.style.boxShadow='none'; }
};
window.addEventListener('scroll', onScroll);

// Activar enlace del menú según sección visible
(function(){
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(sections.length){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        const id = '#'+e.target.id;
        const link = links.find(l => l.getAttribute('href')===id);
        if(!link) return;
        if(e.isIntersecting){ links.forEach(l=>l.classList.remove('active')); link.classList.add('active'); }
      });
    },{ rootMargin:'-45% 0px -50% 0px', threshold:0.01 });
    sections.forEach(s=>io.observe(s));
  }
})();

// Reveal al hacer scroll (animaciones suaves)
(function(){
  const targets = document.querySelectorAll('.reveal, .card, .service, .section__title');
  if(!targets.length) return;
  targets.forEach(el=>el.classList.add('reveal'));
  const io = new IntersectionObserver(ents=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
  },{ threshold:0.08 });
  targets.forEach(el=>io.observe(el));
})();

// Botón Volver arriba + Sticky CTA hide near footer
(function(){
  const toTop = document.getElementById('toTop');
  const sticky = document.querySelector('.sticky-cta');
  const footer = document.querySelector('footer');

  const onWinScroll = ()=>{
    if(toTop){
      if(window.scrollY > 400) toTop.classList.add('show'); else toTop.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onWinScroll, { passive:true });
  onWinScroll();

  if(toTop){
    toTop.addEventListener('click', ()=>{
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  if(sticky && footer){
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ sticky.style.opacity = '0'; sticky.style.pointerEvents='none'; }
        else{ sticky.style.opacity = ''; sticky.style.pointerEvents=''; }
      });
    },{ threshold:0.01 });
    io.observe(footer);
  }
})();

// Modo claro/oscuro con persistencia
(function(){
  const root = document.documentElement;
  const btnTheme = document.getElementById('themeToggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const saved = localStorage.getItem('mt-theme');
  const initial = saved || (prefersLight ? 'light' : 'dark');

  const apply = (theme)=>{
    if(theme==='light'){ root.setAttribute('data-theme','light'); btnTheme && (btnTheme.textContent='☀️'); metaTheme && metaTheme.setAttribute('content','#ffffff'); }
    else { root.setAttribute('data-theme','dark'); btnTheme && (btnTheme.textContent='🌙'); metaTheme && metaTheme.setAttribute('content','#0f1419'); }
  };

  apply(initial);

  btnTheme && btnTheme.addEventListener('click',()=>{
    const next = root.getAttribute('data-theme')==='light' ? 'dark' : 'light';
    localStorage.setItem('mt-theme', next);
    apply(next);
  });
})();

// ===== Multistep form =====
const form = document.getElementById('leadForm');
const formMsg = document.getElementById('formMsg');
(function(){
  if(!form) return;
  const steps = Array.from(form.querySelectorAll('.step'));
  const pills = Array.from(form.querySelectorAll('.steps__item'));
  let i = 0;

  const show = (idx)=>{
    steps.forEach((s,k)=>{ s.hidden = k!==idx; s.classList.toggle('is-current', k===idx); });
    pills.forEach((p,k)=>{ p.classList.toggle('is-active', k===idx); });
  };

  const validateStep = ()=>{
    const current = steps[i];
    const inputs = current.querySelectorAll('input, select, textarea');
    for(const el of inputs){
      if(el.hasAttribute('required') && !el.value.trim()){
        el.focus();
        return false;
      }
    }
    return true;
  };

  form.addEventListener('click', (e)=>{
    const next = e.target.closest('.js-next');
    const prev = e.target.closest('.js-prev');
    if(next){
      if(!validateStep()) return;
      i = Math.min(i+1, steps.length-1);
      show(i);
    }
    if(prev){
      i = Math.max(i-1, 0);
      show(i);
    }
  });

  show(0);
})();

// Envío del formulario con validación básica
if(form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(formMsg) formMsg.textContent = 'Enviando…';

    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.nombre || !data.email){
      if(formMsg) formMsg.textContent = 'Completa nombre y email.';
      return;
    }

    try{
      const res = await fetch(form.action,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      if(!res.ok) throw new Error('Error al enviar');
      if(formMsg) formMsg.textContent = '¡Listo! Te contactamos pronto.';
      form.reset();
    }catch(err){
      if(formMsg) formMsg.textContent = 'No se pudo enviar. Inténtalo más tarde.';
    }
  });
}

// ===== Exit-intent modal =====
(function(){
  const modal = document.getElementById('exitOffer');
  if(!modal) return;
  const overlay = modal.querySelector('[data-close]');
  const closeBtn = modal.querySelector('.modal__close');
  const open = ()=>{ modal.removeAttribute('hidden'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  const close = ()=>{ modal.setAttribute('hidden',''); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  const seen = sessionStorage.getItem('mt-exit');
  if(!seen){
    const handler = (e)=>{
      if(e.clientY <= 0 || e.relatedTarget === null){
        open();
        sessionStorage.setItem('mt-exit','1');
        document.removeEventListener('mouseout', handler);
      }
    };
    document.addEventListener('mouseout', handler);
    // fallback móvil: tras 25s si no hay interacción
    setTimeout(()=>{
      if(sessionStorage.getItem('mt-exit')) return;
      open();
      sessionStorage.setItem('mt-exit','1');
    }, 25000);
  }
  [overlay, closeBtn].forEach(el=> el && el.addEventListener('click', close));
})();

// ===== Gift countdown (24h desde primera visita) =====
(function(){
  const el = document.getElementById('giftCountdown');
  if(!el) return;
  const KEY = 'mt-gift-deadline';
  let deadline = localStorage.getItem(KEY);
  if(!deadline){
    deadline = String(Date.now() + 24*60*60*1000);
    localStorage.setItem(KEY, deadline);
  }
  const target = new Date(parseInt(deadline,10));
  const pad = (n)=> String(n).padStart(2,'0');
  const tick = ()=>{
    const now = new Date();
    let diff = target - now;
    if(diff <= 0){ el.textContent = '00:00:00'; return; }
    const h = Math.floor(diff/3.6e6); diff -= h*3.6e6;
    const m = Math.floor(diff/6e4);   diff -= m*6e4;
    const s = Math.floor(diff/1e3);
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  tick();
  setInterval(tick, 1000);
})();
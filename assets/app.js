// Guarda este bloque como /assets/app.js

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

// Envío del formulario con validación básica
const form = document.getElementById('leadForm');
const formMsg = document.getElementById('formMsg');
if(form){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    formMsg.textContent = 'Enviando…';

    const data = Object.fromEntries(new FormData(form).entries());
    // Validación mínima
    if(!data.nombre || !data.email){
      formMsg.textContent = 'Completa nombre y email.';
      return;
    }

    try{
      const res = await fetch(form.action,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      if(!res.ok) throw new Error('Error al enviar');
      formMsg.textContent = '¡Listo! Te contactamos pronto.';
      form.reset();
    }catch(err){
      formMsg.textContent = 'No se pudo enviar. Inténtalo más tarde.';
    }
  });
}

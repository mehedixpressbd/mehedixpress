/* P25: visual navigation only; does not read/write Firebase and does not create orders. */
(()=>{
  'use strict';
  if (!document.body.classList.contains('mx-p25-public')) return;
  const $=(s)=>document.querySelector(s);
  // P24 brand treatment; leave the original logo element in the markup as a fallback.
  const logo=$('.mx-logo');
  if (logo && !logo.querySelector('.mx-p25-wordmark')){
    const brand=document.createElement('span');
    brand.className='mx-p25-wordmark';brand.innerHTML='MEHEDI<strong>XPRESS</strong>';
    const sub=document.createElement('small');sub.className='mx-p25-brand-sub';sub.textContent='SPORTS · FASHION · CUSTOM PRINT';
    logo.append(brand,sub);
  }
  // Section navigation for P24 catalog appearance. All product cards and filters
  // remain rendered by the real store.js, not by demo app.js.
  const section=$('#products');
  if(section && !section.querySelector('.mx-p25-breadcrumb')){
    const crumbs=document.createElement('div');crumbs.className='mx-p25-breadcrumb';
    const home=document.createElement('a');home.href='#home';home.textContent='⌂ হোম';
    const arrow=document.createElement('span');arrow.textContent='›';
    const title=document.createElement('strong');title.textContent='সব পণ্য';
    crumbs.append(home,arrow,title);
    section.querySelector('.mx-container')?.prepend(crumbs);
  }
  const updateRoute=()=>{
    const catalog=decodeURIComponent(location.hash||'').toLowerCase()==='#products';
    document.body.classList.toggle('mx-p25-catalog-view',catalog);
    document.querySelectorAll('.mx-nav-links a[href="#home"], .mx-nav-links a[href="#products"]').forEach(a=>{
      const active=a.getAttribute('href')===(catalog?'#products':'#home');
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('hashchange',()=>{updateRoute();if(location.hash==='#products')requestAnimationFrame(()=>section?.scrollIntoView({block:'start'}));});
  updateRoute();
  // P24 marketing strip: factual service promise, never a made-up discount.
  const categories=$('#categories');
  if(categories && !$('.mx-p25-promo')){
    const promo=document.createElement('section');promo.className='mx-p25-promo';promo.setAttribute('aria-label','Custom jersey promotion');
    const b=document.createElement('b');b.textContent='নিজের পছন্দমতো কাস্টম জার্সি';
    const s=document.createElement('span');s.textContent='Team Jerseys  ·  Sports Gear  ·  Custom Printing';
    const a=document.createElement('a');a.href='#custom-print';a.textContent='কাস্টম প্রিন্ট →';
    promo.append(b,s,a);categories.after(promo);
  }
})();

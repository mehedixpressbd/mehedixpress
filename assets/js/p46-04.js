/* P45 inline copy of assets/js/mx-design-interactions.js; original JavaScript function bodies retained. */
/* P22 UI ONLY. No Firebase, order, stock, pricing or receipt business operations. */
(function(){
  'use strict';
  const app = document.getElementById('app');
  if (!app) return;  // storefront uses the existing store.js, which remains authoritative.
  const menu = app.querySelector('.side .menu');
  const search = document.getElementById('mxP22MenuSearch');
  const toggle = document.getElementById('mxP22MenuToggle');
  const items = menu ? Array.from(menu.querySelectorAll('button[data-p]')) : [];
  const groupNames = new Map([
    ['dashboard','OVERVIEW'],['products','STORE MANAGEMENT'],['orders','SALES & ORDERS'],
    ['reports','FINANCE & REPORTS'],['settings','SETTINGS & CONTENT'],['mxEmployees','TEAM (DEFERRED)'],
    ['mxCampaigns','LOYALTY & MARKETING'],['mxCRM','CUSTOMER MANAGEMENT']
  ]);
  // Use non-clickable labels; preserve the original buttons and their listeners unchanged.
  if (menu && !menu.dataset.mxP22Enhanced) {
    items.forEach(btn=>{
      const group = groupNames.get(btn.dataset.p);
      if (group) {
        const caption=document.createElement('div');
        caption.className='mx-p22-menu-heading';caption.textContent=group;
        menu.insertBefore(caption,btn);
      }
    });
    menu.dataset.mxP22Enhanced='yes';
  }
  function updateHeadings(){
    if (!menu)return;
    menu.querySelectorAll('.mx-p22-menu-heading').forEach(h=>{
      let item=h.nextElementSibling,found=false;
      while (item && !item.classList.contains('mx-p22-menu-heading')) {
        if(item.matches('button[data-p]') && !item.hidden){found=true;break;}
        item=item.nextElementSibling;
      }
      h.hidden=!found;
    });
  }
  if(search){
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLocaleLowerCase();
      items.forEach(b=>{b.hidden=!!q && !((b.textContent||'')+' '+(b.dataset.p||'')).toLocaleLowerCase().includes(q);});
      updateHeadings();
      if(q && window.matchMedia('(max-width:760px)').matches){document.body.classList.add('mx-p22-menu-open');}
    });
    search.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const matched=items.find(b=>!b.hidden);
      if(matched){e.preventDefault();matched.click();search.blur();}
    });
  }
  if(toggle){toggle.addEventListener('click',()=>{
    const active=document.body.classList.toggle('mx-p22-menu-open');
    toggle.setAttribute('aria-expanded',String(active));
  });}
  items.forEach(btn=>btn.addEventListener('click',()=>{
    if(window.matchMedia('(max-width:760px)').matches){
      document.body.classList.remove('mx-p22-menu-open');
      toggle?.setAttribute('aria-expanded','false');
    }
  }));
  document.querySelectorAll('[data-mx-goto]').forEach(btn=>btn.addEventListener('click',()=>{
    const target=menu?.querySelector('button[data-p="'+btn.dataset.mxGoto+'"]');
    if(target){target.click();app.querySelector('.main')?.scrollTo({top:0,behavior:'smooth'});}
  }));
})();

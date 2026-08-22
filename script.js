const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', ()=>{
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  navToggle.addEventListener('click', ()=> siteNav.classList.toggle('open'));
  document.querySelectorAll('.nav-link').forEach(l=>{
    l.addEventListener('click', (e)=>{
      siteNav.classList.remove('open');
      const targetId = l.getAttribute('href');
      const target = document.querySelector(targetId);
      if(target){
        target.querySelectorAll('.reveal').forEach(el=> el.classList.add('in'));
        const sectionReveal = target.matches('.reveal') ? target : null;
        if(sectionReveal) sectionReveal.classList.add('in');
      }
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.15});
  revealEls.forEach(el=> io.observe(el));
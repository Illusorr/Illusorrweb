/* ILLUSORR — work grid filtering */
/* ===== EMBEDDED WORK GRID logic ===== */
(function(){
  const root=document.getElementById('workGrid');
  if(!root) return;

  let fd='All', fs='All', dealing=false;
  const grid=root.querySelector('#grid');
  const tiles=[...grid.querySelectorAll('.tile')];
  const countEl=root.querySelector('#count'), emptyEl=root.querySelector('#empty');

  tiles.forEach(t=>t.classList.add('dealt'));

  function matches(t){const d=(t.dataset.disc||'').split('|'),s=(t.dataset.sector||'').split('|');
    return (fd==='All'||d.indexOf(fd)>-1)&&(fs==='All'||s.indexOf(fs)>-1);}

  function apply(){
    const show=tiles.filter(matches);
      // Stagger was tuned for ten cards. Cap the total so a 36-card deal still
      // lands in well under a second: per-card delay shrinks as the set grows.
      const outStep=Math.min(40, 500/Math.max(1,tiles.length));
      const inStep =Math.min(85, 700/Math.max(1,show.length));
    const hideNow=tiles.filter(t=>!matches(t) && !t.classList.contains('hide'));

    // 1) throw out the cards that no longer match (quick spin-away)
    hideNow.forEach((t,i)=>{
      t.classList.remove('dealt','deal-in');
      t.style.transitionDelay=(i*outStep)+'ms';
      t.classList.add('throw');
      setTimeout(()=>{ t.classList.remove('throw'); t.classList.add('hide'); t.style.transitionDelay=''; }, 380+i*outStep);
    });

    // 2) after discards clear, deal in the matching cards one by one
    const dealStart = hideNow.length ? 260 : 0;
    setTimeout(()=>{
      show.forEach((t,i)=>{
        const wasHidden=t.classList.contains('hide');
        // reset any hidden/throw state, then place at deck position
        t.classList.remove('hide','throw','dealt');
        // ensure it's in the flow
        t.style.transitionDelay='';
        // set incoming state without transition
        t.classList.add('deal-in');
        // vary the throw angle/offset a touch so it feels hand-dealt
        const ang=22+Math.random()*16, ox=48+Math.random()*24, oy=22+Math.random()*16;
        t.style.transform=`translate(${ox}vw,${oy}vh) rotate(${ang}deg) scale(.7)`;
        // force reflow so the starting transform sticks
        void t.offsetWidth;
        // stagger the deal
        setTimeout(()=>{
          t.style.transform='';
          t.classList.remove('deal-in');
          t.classList.add('dealt');
        }, i*inStep);
      });
    }, dealStart);

    countEl.textContent=show.length+' project'+(show.length===1?'':'s');
    emptyEl.style.display=show.length?'none':'block';
  }

  root.querySelectorAll('[data-kind]').forEach(row=>{
    row.addEventListener('click',e=>{
      const b=e.target.closest('button'); if(!b)return;
      const kind=row.dataset.kind;
      [...row.querySelectorAll('button')].forEach(x=>x.classList.toggle('on',x===b));
      if(kind==='disc'){ fd=b.dataset.v; }
      else { fs=b.dataset.v; secLabel.textContent=b.dataset.v; secdrop.classList.remove('open'); }
      apply();
    });
  });

  // sector dropdown open/close
  const secdrop=root.querySelector('#secdrop'), secBtn=root.querySelector('#secBtn'), secLabel=root.querySelector('#secLabel');
  secBtn.addEventListener('click',e=>{ e.stopPropagation(); secdrop.classList.toggle('open'); });
  document.addEventListener('click',e=>{ if(!secdrop.contains(e.target)) secdrop.classList.remove('open'); });

  // initial count only (no animation on load)
  countEl.textContent=tiles.length+' projects';

})();

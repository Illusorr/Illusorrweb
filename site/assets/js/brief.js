/* ILLUSORR — guided brief intake */
// GUIDED BRIEF — an intake that behaves like something is asking.
  (function(){
    var cv=document.getElementById('bfCanvas'); if(!cv) return;
    var page=document.getElementById('p-brief'), ctx=cv.getContext('2d');
    var core=document.getElementById('bfCore'), stage=document.getElementById('bfStage');
    var bar=document.getElementById('bfBar'), stepNo=document.getElementById('bfStep');
    var back=document.getElementById('bfBack'), next=document.getElementById('bfNext');
    var hint=document.getElementById('bfHint'), err=document.getElementById('bfErr');
    var sum=document.getElementById('bfSum'), nav=document.getElementById('bfNav'), orb=document.getElementById('bfOrb');
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    var INTENTS=[['project','New project'],['pricing','Sector pricing'],
                 ['licence','Licence from the Lab'],['collective','Join the Collective'],
                 ['other','Something else']];
    var DETAIL={
      project:{q:'What kind of work?',opts:['Content production','Visualisation','Worlds and IP',
        'Immersive and installation','Brand, web and product','Not sure yet']},
      pricing:{q:'Which sector?',opts:['Beauty & Fragrance','Fashion, Retail & Jewellery',
        'Real Estate & Architecture','Gaming, Worlds & IP','Culture & Immersive','Business & Institutions']},
      licence:{q:'What would you licence?',opts:['CLONE Engine','Procedural character system',
        'Procedural art, environments and spaces','Asset library','Metagenus','Research partnership','Not sure yet']},
      collective:{q:'What do you do?',opts:['3D artist','Environment artist','Character artist',
        'Game developer','AI content creator','Motion designer','Technical artist','Web developer','Producer']}
    };
    var Q={
      where:{q:'Where does the work live?',opts:['Physical','Digital','Virtual','Across all three','Not sure yet']},
      timeline:{q:'When do you need it?',opts:['Just exploring','Within a month','One to three months',
        'Later this year','We have a fixed date']},
      budget:{q:'Is there a budget range?',opts:['Under 10k','10k to 50k','50k to 150k','150k and above',
        'Not defined yet']},
      level:{q:'Where are you in your career?',opts:['Studying','Early career','Working professional',
        'Senior or lead']},
      scale:{q:'How big is this?',opts:['A single piece','A campaign','An ongoing programme','A full build']}
    };
    var FLOW={
      project:['intent','detail','where','scale','timeline','budget','who','msg'],
      pricing:['intent','detail','where','scale','timeline','budget','who','msg'],
      licence:['intent','detail','timeline','budget','who','msg'],
      collective:['intent','detail','level','links','who','msg'],
      other:['intent','who','msg']
    };
    var PROMISE={project:'A scoped proposal within three working days.',
      pricing:'Scope, structure and a rate card for that sector within two working days.',
      licence:'A licensing conversation with the studio, usually within two working days.',
      collective:'We review work weekly and reply either way.',
      other:'We reply to everything within two working days.'};
    var TINT={project:[142,162,255],pricing:[120,190,255],licence:[138,255,196],
              collective:[224,168,106],other:[198,206,226]};

    /* ---------- field ---------- */
    var N=2600, DF=new Float32Array(N*3), FM=new Float32Array(N*3), CU=new Float32Array(N*3), BIG=new Uint8Array(N);
    (function(){ var s=99; function rnd(){s=(s*1664525+1013904223)>>>0;return s/4294967296;}
      for(var i=0;i<N;i++){
        var y=1-((i+0.5)/N)*2, r=Math.sqrt(Math.max(0,1-y*y)), th=Math.PI*(3-Math.sqrt(5))*i;
        FM[i*3]=Math.cos(th)*r; FM[i*3+1]=y; FM[i*3+2]=Math.sin(th)*r;
        var u=rnd()*6.2832, v=Math.acos(2*rnd()-1), rr=0.6+Math.pow(rnd(),0.4)*2.2;
        DF[i*3]=Math.sin(v)*Math.cos(u)*rr; DF[i*3+1]=Math.cos(v)*rr*0.85; DF[i*3+2]=Math.sin(v)*Math.sin(u)*rr;
        CU[i*3]=DF[i*3]; CU[i*3+1]=DF[i*3+1]; CU[i*3+2]=DF[i*3+2]; BIG[i]=rnd()<0.045?1:0;
      }})();
    var W=1,H=1,ry=0.3,coh=0,cohT=0,pulse=0,tint=[198,206,226],tintT=[198,206,226],T=0,running=false;
    var EX={x:0,y:0,rx:1,ry:1};
    function measure(){                                  // the void the text sits in
      var cr=core.getBoundingClientRect(), rr=cv.getBoundingClientRect();
      EX.x=cr.left-rr.left+cr.width/2; EX.y=cr.top-rr.top+cr.height/2;
      EX.rx=Math.max(60,cr.width/2+56); EX.ry=Math.max(60,cr.height/2+44);
    }
    function size(){
      var r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
      W=Math.max(1,r.width); H=Math.max(1,r.height);
      cv.width=W*d; cv.height=H*d; ctx.setTransform(d,0,0,d,0,0); measure();
    }
    var NB=6, MT=3;
    function draw(){
      coh+=(cohT-coh)*0.035; pulse*=0.94;
      for(var k=0;k<3;k++) tint[k]+=(tintT[k]-tint[k])*0.05;
      var R=Math.min(W,H)*0.46, ox=W/2, oy=H/2, cy=Math.cos(ry), sy=Math.sin(ry), jit=(1-coh)*0.30;
      ctx.clearRect(0,0,W,H);
      var bk=[]; for(var b=0;b<NB*MT;b++) bk.push([]);
      for(var i=0;i<N;i++){
        var j=i*3, m=coh;
        var tx=DF[j]*(1-m)+FM[j]*m, ty=DF[j+1]*(1-m)+FM[j+1]*m, tz=DF[j+2]*(1-m)+FM[j+2]*m;
        var ph=i*0.7+T;
        tx+=Math.sin(ph*0.9)*jit; ty+=Math.cos(ph*1.13)*jit; tz+=Math.sin(ph*0.77)*jit;
        var g=1+pulse*0.5;
        CU[j]+=(tx*g-CU[j])*0.05; CU[j+1]+=(ty*g-CU[j+1])*0.05; CU[j+2]+=(tz*g-CU[j+2])*0.05;
        var x=CU[j]*cy-CU[j+2]*sy, z=CU[j]*sy+CU[j+2]*cy, s=3.4/(3.4+z);
        if(s<=0) continue;
        var px=ox+x*s*R, py=oy+CU[j+1]*s*R;
        var dx=(px-EX.x)/EX.rx, dy=(py-EX.y)/EX.ry, dd=Math.sqrt(dx*dx+dy*dy);
        if(dd<1) continue;                               // inside the void: nothing drawn
        var mask=Math.min(1,(dd-1)/0.42); if(mask<0.05) continue;
        var bi=Math.min(NB-1,Math.max(0,Math.floor((1-(z+2.7)/5.4)*NB)));
        var mi=mask>0.72?2:(mask>0.35?1:0);
        bk[bi*MT+mi].push(px,py,s,BIG[i]);
      }
      for(var b=0;b<NB*MT;b++){
        var arr=bk[b]; if(!arr.length) continue;
        var f=((b/MT|0)+0.5)/NB, mf=[0.22,0.6,1][b%MT];
        var al=(0.05+f*0.5)*(0.55+coh*0.45)*mf;
        ctx.fillStyle='rgba('+(tint[0]|0)+','+(tint[1]|0)+','+(tint[2]|0)+','+al.toFixed(3)+')';
        ctx.beginPath();
        for(var k2=0;k2<arr.length;k2+=4){
          var rr=(arr[k2+3]?1.9:0.85)*arr[k2+2];
          ctx.moveTo(arr[k2]+rr,arr[k2+1]); ctx.arc(arr[k2],arr[k2+1],rr,0,6.2832);
        }
        ctx.fill();
      }
    }
    function loop(){
      if(page.className.indexOf('show')<0){ running=false; setTimeout(start,400); return; }
      T+=0.016; ry+=0.0016; draw(); requestAnimationFrame(loop);
    }
    function start(){ if(running) return; running=true; size(); loop(); }
    addEventListener('resize',function(){ if(running) size(); });

    /* ---------- intake ---------- */
    var data={}, order=[], step=0, gen=0, LBL={};
    function reset(){ data={intent:'',detail:'',where:'',scale:'',timeline:'',budget:'',
                            level:'',links:'',name:'',email:'',org:'',msg:''}; step=0; }
    reset();
    function flow(){ return FLOW[data.intent]||FLOW.other; }
    function ask(el,txt,then){
      var my=++gen;
      orb.classList.add('think');
      el.innerHTML='<span class="bf-dots"><i></i><i></i><i></i></span>';
      var wait=reduced?0:520;
      setTimeout(function(){
        if(my!==gen) return;
        orb.classList.remove('think');
        if(reduced){ el.textContent=txt; if(then)then(); return; }
        el.textContent=''; var car=document.createElement('span'); car.className='car';
        el.appendChild(car); var i=0;
        // ~34ms a character, easing off for long lines, with a beat after each sentence
        var per=Math.max(21,32-Math.floor(txt.length/26)*3);   // long lines type a touch quicker
        (function tick(){ if(my!==gen) return;
          if(i<txt.length){
            var ch=txt.charAt(i); car.insertAdjacentText('beforebegin',ch); i++;
            var pause=(ch==='.'||ch==='?')?300:(ch===','?140:(ch===' '?per*1.15:per));
            setTimeout(tick,pause);
          }
          else { setTimeout(function(){ if(my===gen&&car.parentNode) car.remove(); },700); if(then)then(); }
        })();
      },wait);
    }
    function drawSum(){
      var r=[];
      ['intent','detail','where','scale','timeline','budget','level'].forEach(function(k){
        if(data[k]) r.push(k==='intent'?LBL[data.intent]:data[k]); });
      if(data.name) r.push(data.name);
      sum.innerHTML=r.map(function(v){return '<li>'+String(v).replace(/</g,'&lt;')+'</li>'}).join('');
    }
    INTENTS.forEach(function(x){ LBL[x[0]]=x[1]; });
    function opts(list,cb){
      var w=document.createElement('div'); w.className='bf-opts';
      list.forEach(function(o,i){
        var b=document.createElement('button'); b.type='button'; b.className='bf-opt';
        b.innerHTML='<span class="n">'+String(i+1).padStart(2,'0')+'</span><span>'+o+'</span>';
        b.addEventListener('click',function(){ cb(o); }); w.appendChild(b);
      });
      return w;
    }
    function fld(lbl,key,ty,ph){
      var l=document.createElement('label'); l.textContent=lbl;
      var el=document.createElement(ty==='area'?'textarea':'input');
      if(ty!=='area') el.type=ty; else el.rows=4;
      if(ph) el.placeholder=ph; el.value=data[key]||'';
      el.addEventListener('input',function(){ data[key]=el.value; drawSum(); });
      l.appendChild(el); return l;
    }
    var lastAnswer='', cap=null;
    function render(){
      var S=flow(), k=S[step]; err.hidden=true; back.hidden=step===0;
      cohT=Math.min(1,step/(S.length-1)); tintT=TINT[data.intent]||TINT.other; pulse=1;
      bar.style.width=(cohT*100).toFixed(1)+'%';
      stepNo.textContent=String(step+1).padStart(2,'0')+' / '+String(S.length).padStart(2,'0');
      stage.innerHTML=''; nav.style.display='none';
      var q=document.createElement('div'); q.className='bf-q'; stage.appendChild(q);
      /* The previous answer used to be prefixed to the next question, so the
         screen read "Content production. Where does the work live?" - it
         looked like the form was repeating your answer back at you. The
         question now stands on its own; the running summary below already
         shows what has been picked. */
      function body(fn){ ask(q,fn.q,function(){ stage.appendChild(fn.el()); measure(); }); }

      if(k==='intent'){ lastAnswer='';
        body({q:'What do you need?',el:function(){ return opts(INTENTS.map(function(x){return x[1]}),function(v){
          data.intent=INTENTS.filter(function(x){return x[1]===v})[0][0];
          lastAnswer=v; step=1; drawSum(); render(); }); }});
      } else if(k==='detail'){ var D=DETAIL[data.intent];
        body({q:D.q,el:function(){ return opts(D.opts,function(v){ data.detail=v; lastAnswer=v; step++; drawSum(); render(); }); }});
      } else if(Q[k]){ var C=Q[k];
        body({q:C.q,el:function(){ return opts(C.opts,function(v){ data[k]=v; lastAnswer=v; step++; drawSum(); render(); }); }});
      } else if(k==='links'){
        body({q:'Where can we see your work?',el:function(){
          var f=document.createElement('div'); f.className='bf-fields';
          f.appendChild(fld('Portfolio, reel or profile','links','text','https://'));
          nav.style.display=''; next.textContent='Continue →'; hint.textContent='or press Enter';
          return f; }});
      } else if(k==='who'){
        body({q:'Who should we reply to?',el:function(){
          var f=document.createElement('div'); f.className='bf-fields';
          f.appendChild(fld('Name','name','text')); f.appendChild(fld('Email','email','email'));
          if(data.intent!=='collective') f.appendChild(fld('Company or organisation','org','text'));
          nav.style.display=''; next.textContent='Continue →'; hint.textContent='or press Enter';
          setTimeout(function(){ var i=f.querySelector('input'); if(i) i.focus(); },80);
          return f; }});
      } else {
        body({q:'Anything we should know?',el:function(){
          var f=document.createElement('div'); f.className='bf-fields';
          f.appendChild(fld('Message (optional)','msg','area','What are you making, and by when?'));
          /* the human check sits on the last step only, so the flow is not
             interrupted while someone is still choosing options */
          cap = window.ILForm ? new window.ILForm.Challenge() : null;
          if(cap) f.appendChild(cap.el());
          nav.style.display=''; next.textContent='Send brief ↗'; hint.textContent=PROMISE[data.intent]||'';
          return f; }});
      }
      drawSum();
    }
    function advance(){
      var S=flow(), k=S[step];
      if(k==='who'){
        if(!data.name.trim()){ err.textContent='Please add your name.'; err.hidden=false; return; }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())){
          err.textContent='That email address does not look right.'; err.hidden=false; return; }
        lastAnswer='Thank you, '+data.name.split(' ')[0];
      } else if(k==='links'){ lastAnswer=''; }
      if(step<S.length-1){ step++; render(); return; }

      /* last step: human check, then a real POST. This used to stop here and
         say "this is a wireframe, so nothing was sent". */
      if(cap){ var bad=cap.check(); if(bad){ err.textContent=bad; err.hidden=false; return; } }
      err.hidden=true;
      next.disabled=true; next.textContent='Sending…';

      function receipt(){
        gen++; cohT=1; pulse=1.7; bar.style.width='100%'; stepNo.textContent='Sent';
        nav.style.display='none'; back.hidden=true; err.hidden=true; orb.classList.remove('think');
        /* the stage carries a min-height so the layout does not jump between
           questions. The receipt is much shorter than any question, so that
           floor left a dead band above "Start again" - it is dropped here. */
        stage.classList.add('bf-done');
        stage.innerHTML='<div class="bf-q">Brief received.</div>'+
          '<p class="ct-hint" style="margin:16px auto 0;max-width:460px;font-size:15px;color:rgba(238,242,255,.7)">'+
          data.name.split(' ')[0]+', that is with the studio. '+(PROMISE[data.intent]||'')+'</p>'+
          '<div class="brief-nav"><button type="button" class="brief-back" id="bfAgain">Start again →</button></div>';
        measure();
        document.getElementById('bfAgain').addEventListener('click',function(){
          stage.classList.remove('bf-done');
          next.disabled=false; cap=null; reset(); lastAnswer=''; render(); });
      }
      if(!window.ILForm){ receipt(); return; }
      window.ILForm.send('brief',{
        intent:LBL[data.intent]||data.intent, detail:data.detail, where:data.where,
        scale:data.scale, timeline:data.timeline, budget:data.budget, level:data.level,
        links:data.links, name:data.name, email:data.email, org:data.org, msg:data.msg
      }).then(receipt).catch(function(){
        next.disabled=false; next.textContent='Send brief ↗';
        err.textContent='That did not go through. Please email hello@illusorr.com directly.';
        err.hidden=false;
      });
    }
    next.addEventListener('click',advance);
    back.addEventListener('click',function(){ if(step>0){ step--; lastAnswer=''; render(); } });
    document.addEventListener('keydown',function(e){
      if(page.className.indexOf('show')<0) return;
      var S=flow(), k=S[step];
      if(e.key==='Enter' && (k==='who'||k==='links') && e.target.tagName!=='TEXTAREA'){ e.preventDefault(); advance(); }
      if(e.key==='Enter' && (e.metaKey||e.ctrlKey) && k==='msg'){ e.preventDefault(); advance(); }
      if(/^[1-9]$/.test(e.key) && e.target.tagName!=='INPUT' && e.target.tagName!=='TEXTAREA'){
        var b=stage.querySelectorAll('.bf-opt')[+e.key-1]; if(b) b.click();
      }
    });
    window.__ctIntent=function(intent,sector){
      if(!LBL[intent]) return;
      reset(); data.intent=intent; lastAnswer=LBL[intent];
      if(sector && DETAIL[intent]){
        var want=sector.replace(/&amp;/g,'&');
        DETAIL[intent].opts.forEach(function(o){ if(o===want){ data.detail=o; lastAnswer=o; } });
      }
      step = data.detail?2:1; render(); start();
    };
    render(); start();
  })();

// deep-link intents: brief.html?intent=pricing&sector=...
(function(){
  var q=new URLSearchParams(location.search), it=q.get('intent');
  if(it&&window.__ctIntent) window.__ctIntent(it, q.get('sector')||'');
})();

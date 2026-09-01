/* ILLUSORR — shared components: rails, reveals, sector stacks, canvas studies */
// case-study rails: arrows, counter, wheel-to-horizontal, drag
  document.querySelectorAll('.sd-cases').forEach(function(sec){
    var rail=sec.querySelector('.rail'), cards=[].slice.call(sec.querySelectorAll('.railcard'));
    var count=sec.querySelector('.rail-count'), btns=[].slice.call(sec.querySelectorAll('.rail-btn'));
    if(!rail||!cards.length) return;
    function step(){ return cards[0].offsetWidth + 22; }
    function sync(){
      var i=Math.round(rail.scrollLeft/step())+1;
      i=Math.max(1,Math.min(cards.length,i));
      if(count) count.textContent=String(i).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
      var max=rail.scrollWidth-rail.clientWidth-2;
      btns.forEach(function(b){
        b.disabled = (b.dataset.dir==='-1') ? rail.scrollLeft<=2 : rail.scrollLeft>=max;
      });
    }
    rail.addEventListener('scroll',sync,{passive:true});
    btns.forEach(function(b){ b.addEventListener('click',function(){
      rail.scrollBy({left:step()*parseInt(b.dataset.dir,10),behavior:'smooth'});
    })});
    rail.addEventListener('wheel',function(e){
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ rail.scrollLeft+=e.deltaY; e.preventDefault(); }
    },{passive:false});
    var down=false,sx=0,sl=0;
    rail.addEventListener('pointerdown',function(e){ down=true;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('dragging'); });
    rail.addEventListener('pointermove',function(e){ if(down) rail.scrollLeft=sl-(e.clientX-sx); });
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){
      rail.addEventListener(ev,function(){ down=false;rail.classList.remove('dragging'); });
    });
    rail.addEventListener('click',function(e){ if(Math.abs(rail.scrollLeft-sl)>6) e.preventDefault(); },true);
    sync();
  });

  // scroll reveal — scroll-driven so it survives page switching
  (function(){
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function check(){
      if(reduced){document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in')});return;}
      document.querySelectorAll('.reveal:not(.in)').forEach(function(el){
        if(el.offsetParent===null) return;
        var r=el.getBoundingClientRect();
        if(r.top < innerHeight*0.92 && r.bottom > 0) el.classList.add('in');
      });
    }
    addEventListener('scroll',check,{passive:true});
    addEventListener('resize',check);
    document.body.addEventListener('click',function(e){
      if(e.target.closest('[data-goto]')) setTimeout(check,70);
    });
    // a click is not the only way a page gets shown; watch the class instead
    if(window.MutationObserver){
      var mo=new MutationObserver(function(){ setTimeout(check,60); });
      document.querySelectorAll('.page').forEach(function(p){
        mo.observe(p,{attributes:true,attributeFilter:['class']}); });
    }
    check();
  })();

  // sectors stack — each card recedes as the next covers it
  (function(){
    var cards=[].slice.call(document.querySelectorAll('.scard'));
    if(!cards.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var pending=false;
    function frame(){
      pending=false;
      for(var i=0;i<cards.length;i++){
        var inner=cards[i].firstElementChild, nxt=cards[i+1];
        if(!nxt){ inner.style.transform=''; inner.style.filter=''; continue; }
        var top=cards[i].getBoundingClientRect().top;
        var gap=nxt.getBoundingClientRect().top-top;
        var p=1-Math.min(1,Math.max(0,gap/Math.max(1,cards[i].offsetHeight)));
        inner.style.transform='scale('+(1-p*0.055).toFixed(4)+')';
        inner.style.filter='brightness('+(1-p*0.4).toFixed(3)+')';
      }
    }
    function onScroll(){ if(!pending){pending=true;requestAnimationFrame(frame);} }
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll);
    frame();
  })();

  // sector panels — the covered one recedes as the next slides over it
  (function(){
    var panels=[].slice.call(document.querySelectorAll('.sd-stack>section'));
    if(!panels.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if(matchMedia('(max-width: 980px)').matches) return;
    var pending=false;
    function frame(){
      pending=false;
      for(var i=0;i<panels.length;i++){
        var inner=panels[i].querySelector('.pnl'); if(!inner) continue;
        var nxt=panels[i+1];
        if(!nxt || nxt.parentNode!==panels[i].parentNode){ inner.style.transform='';inner.style.opacity='';continue; }
        var t=nxt.getBoundingClientRect().top, vh=innerHeight||1;
        var p=1-Math.min(1,Math.max(0,t/vh));           // 0 uncovered, 1 fully covered
        inner.style.transform='scale('+(1-p*0.07).toFixed(4)+')';
        inner.style.opacity=(1-p*0.75).toFixed(3);
      }
    }
    function onScroll(){ if(!pending){pending=true;requestAnimationFrame(frame);} }
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll);
    document.body.addEventListener('click',function(e){
      if(e.target.closest('[data-goto]')) setTimeout(frame,70);
    });
    frame();
  })();

  // interactive procedural form — canvas 2D, no library
  (function(){
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.c3d').forEach(function(el){
      var cv=el.querySelector('canvas'); if(!cv) return;
      var ctx=cv.getContext('2d');
      var W=1,H=1,ry=0.5,rx=-0.20,drag=false,px=0,py=0,running=false,morph=0,PTS=[];
      for(var u=0;u<70;u++) for(var v=0;v<20;v++) PTS.push([u/70*6.2832,v/20*6.2832]);
      function size(){
        var r=el.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
        W=Math.max(1,r.width); H=Math.max(1,r.height);
        cv.width=W*d; cv.height=H*d; ctx.setTransform(d,0,0,d,0,0);
      }
      function rot(x,y,z){
        var cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
        var X=x*cy-z*sy, Z1=x*sy+z*cy, Y=y*cx-Z1*sx, Z=y*sx+Z1*cx, s=3.2/(3.2+Z);
        return [X*s,Y*s,Z,s];
      }
      function draw(){
        ctx.clearRect(0,0,W,H);
        var R=Math.min(W,H)*0.37, ox=W/2, oy=H/2, k=1.6+0.45*Math.sin(morph*0.30), Q=[];
        for(var i=0;i<PTS.length;i++){
          var u=PTS[i][0], v=PTS[i][1], Rr=1+0.32*Math.cos(k*u);
          Q.push(rot((Rr+0.33*Math.cos(v))*Math.cos(u)*0.6,
                     (Rr+0.33*Math.cos(v))*Math.sin(u)*0.5,
                     (0.33*Math.sin(v)+0.4*Math.sin(k*u))*0.6));
        }
        Q.sort(function(a,b){return b[2]-a[2]});
        for(var i=0;i<Q.length;i++){
          var p=Q[i], al=Math.max(0.05,1-(p[2]+1.1)/2.2)*0.85;
          ctx.beginPath(); ctx.arc(ox+p[0]*R*1.2,oy+p[1]*R*1.2,1.6*p[3],0,6.2832);
          ctx.fillStyle=(al>0.5?'rgba(142,162,255,':'rgba(226,233,255,')+al.toFixed(3)+')';
          ctx.fill();
        }
      }
      function loop(){
        if(el.offsetParent===null){ running=false; setTimeout(start,400); return; }
        morph+=0.016; if(!drag) ry+=0.0026;
        draw(); requestAnimationFrame(loop);
      }
      function start(){ if(running) return; running=true; size(); loop(); }
      cv.addEventListener('pointerdown',function(e){drag=true;px=e.clientX;py=e.clientY;
        try{cv.setPointerCapture(e.pointerId)}catch(x){}});
      cv.addEventListener('pointermove',function(e){ if(!drag)return;
        ry+=(e.clientX-px)*0.006; rx+=(e.clientY-py)*0.005;
        rx=Math.max(-1.2,Math.min(1.2,rx)); px=e.clientX; py=e.clientY; if(reduced) draw(); });
      ['pointerup','pointercancel','pointerleave'].forEach(function(v){
        cv.addEventListener(v,function(){drag=false});});
      addEventListener('resize',function(){size(); if(reduced) draw();});
      if(reduced){ size(); draw(); } else { start(); }
    });
  })();



  // point-cloud globe + depth-slice scan. Canvas 2D, no library.
  (function(){
    var el=document.querySelector('.pcloud'); if(!el) return;
    var cv=el.querySelector('canvas'); if(!cv) return;
    var ctx=cv.getContext('2d');
    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var N=3200, P=new Float32Array(N*3);
    for(var i=0;i<N;i++){                       // fibonacci sphere = even coverage
      var y=1-(i/(N-1))*2, r=Math.sqrt(Math.max(0,1-y*y)), th=Math.PI*(3-Math.sqrt(5))*i;
      P[i*3]=Math.cos(th)*r; P[i*3+1]=y; P[i*3+2]=Math.sin(th)*r;
    }
    var W=1,H=1,ry=0.4,rx=-0.20,t=0,drag=false,mx=0,my=0,running=false,NB=9;
    function size(){
      var r=el.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
      W=Math.max(1,r.width); H=Math.max(1,r.height);
      cv.width=W*d; cv.height=H*d; ctx.setTransform(d,0,0,d,0,0);
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      var R=Math.min(W,H)*0.38, ox=W/2, oy=H/2;
      var scan=Math.sin(t*0.5)*0.5+0.5;                 // sweeps front to back
      var cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
      var buckets=[]; for(var b=0;b<NB;b++) buckets.push([]);
      var lit=[];
      for(var i=0;i<N;i++){
        var X=P[i*3],Y=P[i*3+1],Z=P[i*3+2];
        var x1=X*cy-Z*sy, z1=X*sy+Z*cy, y1=Y*cx-z1*sx, z2=Y*sx+z1*cx;
        var s=3.2/(3.2+z2), sxp=ox+x1*s*R, syp=oy+y1*s*R;
        var d=(z2+1)/2;                                  // 0 nearest, 1 furthest
        var bv=1-Math.min(1,Math.abs(d-scan)/0.06);
        if(bv>0.03) lit.push(sxp,syp,bv,s);
        var f=1-d, bi=Math.min(NB-1,Math.max(0,Math.floor(f*NB)));
        buckets[bi].push(sxp,syp,s);
      }
      for(var b=0;b<NB;b++){                             // dim body, back to front
        var arr=buckets[b]; if(!arr.length) continue;
        var f=(b+0.5)/NB;
        ctx.fillStyle='rgba(226,233,255,'+(0.045+f*0.26).toFixed(3)+')';
        ctx.beginPath();
        for(var k=0;k<arr.length;k+=3){
          var rr=0.85*arr[k+2];
          ctx.moveTo(arr[k]+rr,arr[k+1]); ctx.arc(arr[k],arr[k+1],rr,0,6.2832);
        }
        ctx.fill();
      }
      for(var q=0;q<3;q++){                              // the scan band, three intensities
        var lo=q/3, hi=(q+1)/3;
        ctx.fillStyle='rgba('+(q===2?'236,242,255':'142,162,255')+','+(0.16+q*0.34).toFixed(3)+')';
        ctx.beginPath();
        for(var k=0;k<lit.length;k+=4){
          var bv=lit[k+2]; if(bv<lo||bv>=hi) continue;
          var rr=(0.9+bv*1.5)*lit[k+3];
          ctx.moveTo(lit[k]+rr,lit[k+1]); ctx.arc(lit[k],lit[k+1],rr,0,6.2832);
        }
        ctx.fill();
      }
    }
    function loop(){
      if(el.offsetParent===null){ running=false; setTimeout(start,400); return; }
      t+=0.016; if(!drag) ry+=0.0024;
      draw(); requestAnimationFrame(loop);
    }
    function start(){ if(running) return; running=true; size(); loop(); }
    cv.addEventListener('pointerdown',function(e){drag=true;mx=e.clientX;my=e.clientY;
      try{cv.setPointerCapture(e.pointerId)}catch(x){}});
    cv.addEventListener('pointermove',function(e){ if(!drag)return;
      ry+=(e.clientX-mx)*0.006; rx+=(e.clientY-my)*0.005;
      rx=Math.max(-1.2,Math.min(1.2,rx)); mx=e.clientX; my=e.clientY; if(reduced) draw(); });
    ['pointerup','pointercancel','pointerleave'].forEach(function(v){
      cv.addEventListener(v,function(){drag=false});});
    addEventListener('resize',function(){size(); if(reduced) draw();});
    if(reduced){ size(); draw(); } else { start(); }
  })();

  // depth-parallax + depth-slice scan, per sector photograph. WebGL2, no library.
  (function(){
    var VS='#version 300 es\nin vec2 p;out vec2 vUv;void main(){vUv=p*0.5+0.5;gl_Position=vec4(p,0.,1.);}';
    var FS='#version 300 es\n'+
    'precision highp float;in vec2 vUv;out vec4 o;\n'+
    'uniform sampler2D uTex;uniform vec2 uPtr;uniform vec2 uFit;uniform vec2 uRes;uniform float uProg;\n'+
    'float lum(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}\n'+
    // no depth map ships with the photo, so derive one: blurred luminance biased by radius
    'float depth(vec2 uv){float s=0.;for(int i=-1;i<=1;i++){for(int j=-1;j<=1;j++){\n'+
    '  s+=lum(texture(uTex,clamp(uv+vec2(float(i),float(j))*0.014,0.001,0.999)).rgb);}}\n'+
    '  float d=s/9.;return clamp(d*0.72+(1.-length(uv-0.5)*1.35)*0.28,0.,1.);}\n'+
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+
    'void main(){\n'+
    '  vec2 uv=(vUv-0.5)*uFit+0.5;\n'+
    '  float d=depth(uv);\n'+
    '  vec2 par=clamp(uv+(d-0.5)*uPtr*0.05,0.001,0.999);\n'+
    '  vec3 col=texture(uTex,par).rgb;\n'+
    '  vec2 tile=vec2(96.*uRes.x/uRes.y,96.);\n'+
    '  vec2 cell=fract(uv*tile)-0.5;\n'+
    '  float dots=(1.-smoothstep(0.28,0.34,length(cell)))*hash(floor(uv*tile));\n'+
    '  float band=1.-smoothstep(0.,0.045,abs(d-uProg));\n'+
    '  vec3 accent=vec3(0.42,0.53,1.0);\n'+
    '  vec3 glow=accent*dots*band*2.4;\n'+
    '  vec3 fin=1.-(1.-col)*(1.-glow);\n'+
    '  fin+=accent*band*0.045;\n'+
    '  o=vec4(fin,1.);}';

    var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.dscan').forEach(function(el,idx){
      var cv=el.querySelector('canvas'); if(!cv) return;
      var secN=(el.dataset.img||'--sec1').replace('--sec','');
      var probe=document.createElement('div'); probe.className='sec-bg-'+secN; probe.style.cssText='position:absolute;width:0;height:0;visibility:hidden';
      document.body.appendChild(probe);
      var raw=getComputedStyle(probe).backgroundImage; probe.remove();
      var m=raw.match(/url\(["']?([^"')]+)["']?\)/);
      function fail(){ cv.style.display='none'; el.style.background=raw?('#05060a center/cover no-repeat'):''; 
                       if(raw) el.style.backgroundImage=raw; }
      if(!m) return fail();
      var img=new Image();
      img.onerror=fail;
      img.onload=function(){
        var gl=cv.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'low-power'});
        if(!gl) return fail();
        function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);
          if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(x));return null;}return x;}
        var vs=sh(gl.VERTEX_SHADER,VS), fs=sh(gl.FRAGMENT_SHADER,FS);
        if(!vs||!fs) return fail();
        var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
        if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(pr));return fail();}
        gl.useProgram(pr);
        var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
        var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
        var tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        var uPtr=gl.getUniformLocation(pr,'uPtr'),uFit=gl.getUniformLocation(pr,'uFit'),
            uRes=gl.getUniformLocation(pr,'uRes'),uProg=gl.getUniformLocation(pr,'uProg');
        var W=1,H=1,tx=0,ty=0,cx=0,cy=0,t=idx*0.9,running=false;   // stagger so sectors differ
        function size(){
          var r=el.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
          W=Math.max(1,r.width|0); H=Math.max(1,r.height|0);
          cv.width=W*d; cv.height=H*d; gl.viewport(0,0,cv.width,cv.height);
          var ia=img.width/img.height, ca=W/H;
          gl.uniform2f(uFit, ia>ca?ca/ia:1, ia>ca?1:ia/ca);
          gl.uniform2f(uRes,W,H);
        }
        function draw(){
          cx+=(tx-cx)*0.06; cy+=(ty-cy)*0.06;
          gl.uniform2f(uPtr,cx,cy);
          gl.uniform1f(uProg, reduced?0.5:(Math.sin(t*0.55)*0.5+0.5));
          gl.drawArrays(gl.TRIANGLES,0,3);
        }
        function loop(){
          if(el.offsetParent===null){running=false;setTimeout(start,400);return;}
          t+=0.016; draw(); requestAnimationFrame(loop);
        }
        function start(){ if(running)return; running=true; size(); loop(); }
        el.addEventListener('pointermove',function(e){
          var r=el.getBoundingClientRect();
          tx=((e.clientX-r.left)/r.width-0.5)*2; ty=((e.clientY-r.top)/r.height-0.5)*2; });
        el.addEventListener('pointerleave',function(){tx=0;ty=0;});
        addEventListener('resize',function(){size();});
        if(reduced){ size(); draw(); } else { start(); }
      };
      img.src=m[1];
    });
  })();

  

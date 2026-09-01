/* ILLUSORR — WebGL noise field (home only) */


/* ILLUSORR — noise transition studies.
 *
 * The FIELD is identical in every study. Only the way a section boundary is
 * crossed differs, so the comparison is about transition design, not about
 * the pattern.
 *
 *   00 none      state snaps at the boundary — the baseline to beat
 *   01 flood     lines ignite, frame floods to white, state changes at peak
 *   02 sticky    content is pinned while the field completes its change
 *   03 wipe      a white curtain sweeps up the screen, new state behind it
 *   04 collapse  contours thin to nothing, then reopen in the new state
 *   05 contract  field pulls into the orb, changes, then expands again
 *
 * All five latch discontinuous state (mirror, contraction) at the moment
 * the change is least visible. None of them crossfade the field against
 * itself — that is what produced a ghosted double pattern.
 */
(() => {
  const P = {
    base:[0.020,0.030,0.110], accent:[0.45,0.65,1.00], lightDensity:0.42,
    lightBg:[1.00,1.00,1.00], lightInk:[0.298,0.388,1.000], lightContrast:1.0,
    noiseScale:0.40, flowStretch:3.5, contourDensity:13, contourSharpness:20,
    topFade:1.5, animSpeed:0.10, densityWobble:20.5, noiseWobble:0.25,
    hoverStrength:0.17, hoverRadius:0.77, hoverGlow:2.0,
    curlSteps:8, curlScale:1.7, curlStrength:1.0,
    sphereRadius:0.36, pinchSoft:0.5, focusX:0.5, renderScale:0.7,
  };
  /* Field defaults are snapshotted BEFORE any stored override is applied, so
     Reset always returns to the designed values rather than to whatever was
     last saved. Colours are cloned — a shared array reference would let an
     edit mutate the default it is supposed to restore. */
  const P_DEFAULTS=JSON.parse(JSON.stringify(P));
  Object.assign(P,JSON.parse(localStorage.getItem('nfField')||'{}'));
  const saveP=()=>localStorage.setItem('nfField',JSON.stringify(P));

  /* PER-SECTION OVERRIDES. A section may restate any of these keys; anything
     it leaves unset falls through to the global field value, so a section is
     a delta rather than a full copy. Held apart from the data-bg-* attributes
     because colours and a dozen numbers do not belong in markup. */
  const SEC_COL=['base','accent','lightBg','lightInk'];
  const SEC_NUM=['lightDensity','lightContrast','noiseScale','flowStretch',
                 'contourDensity','contourSharpness','curlStrength','animSpeed','topFade','focusX'];
  const SEC_KEYS=[...SEC_COL,...SEC_NUM];
  let secOv=JSON.parse(localStorage.getItem('nfSecParams')||'[]');
  const saveSecOv=()=>localStorage.setItem('nfSecParams',JSON.stringify(secOv));
  // Index keying breaks as soon as a second page has sections, because measure()
  // only counts the visible ones. Read the override off the element instead.
  const ovOf=(el,i)=>{ const a=el&&el.getAttribute('data-bg-ov');
    if(a){ try{ return JSON.parse(a)||{}; }catch(e){} }
    return secOv[i]||{}; };
  /* E is what the shader actually sees: the overrides eased in, so a section
     change moves the palette rather than cutting to it. */
  const E={}; SEC_KEYS.forEach(k=>E[k]=Array.isArray(P[k])?P[k].slice():P[k]);
  let latchedOv={};

  const NOTES = {
    none:'Baseline. The change is instant and you see it happen — mirror in particular jumps.',
    flood:'Most cinematic. Reads as the field igniting. Costs a moment of full white.',
    sticky:'Strongest for storytelling: the page holds still while the field works. Needs the extra scroll height.',
    wipe:'Directional and quieter than a flood. The boundary becomes a curtain rather than an edge.',
    collapse:'Subtlest. The flow thins out and reopens, so the palette change arrives without a bright frame.',
    contract:'Reuses the hero contraction as punctuation. Good rhythm, but it conceals the switch least of the five — the field stays partly visible — and it repeats a gesture you already use.',
    shock:'A ring rips outward and the flow compresses ahead of it. Most physical of the set; reads as an impact.',
    vortex:'The field twists around the centre and unwinds into its new state. Hardest twist at the middle, so it feels driven from a point.',
    shear:'The pattern splits into slabs that slide against each other, then re-align. Mechanical and abrupt — good for a hard cut between sectors.',
    zoom:'Space rushes through the viewer. Strong forward momentum; pairs well with a page that moves deeper into a subject.',
    melt:'Columns run downward at uneven rates, like the pattern is liquefying. Slowest and most organic.',
    dissolve:'Contours erode into a grain matrix and reform. Quietest of the transforms — the change arrives without any motion at all.'
  };

  const cv=document.getElementById('nf');
  const gl=cv.getContext('webgl2',{antialias:true,alpha:false});
  if(!gl) return;

  const VERT=`#version 300 es
in vec2 a_pos; out vec2 v_uv;
void main(){ v_uv=a_pos*0.5+0.5; gl_Position=vec4(a_pos,0.,1.); }`;

  const FRAG=`#version 300 es
precision highp float;
in vec2 v_uv; out vec4 frag;
uniform vec2 u_res; uniform float u_time,u_aspect; uniform vec2 u_mouse;
uniform vec3 u_base,u_accent; uniform float u_density; uniform sampler2D u_lut;
uniform float u_morph,u_sphereRadius,u_pinchSoft; uniform vec2 u_focus;
uniform float u_noiseScale,u_flowStretch,u_contourDensity,u_contourSharpness;
uniform float u_topFade,u_animSpeed,u_densityWobble,u_noiseWobble;
uniform float u_hoverStrength,u_hoverRadius,u_hoverGlow;
uniform float u_curlSteps,u_curlScale,u_curlStrength;
uniform float u_mirror,u_dim;
uniform vec3 u_lightBg,u_lightInk; uniform float u_lightContrast;
uniform float u_flash;     // white flood 0..1
uniform float u_curtain;   // wipe band CENTRE in uv.y; parked far off-screen
uniform float u_wipeOn;    // 0 = wipe term disabled entirely
uniform float u_collapse;  // contour thinning 0..1
uniform float u_ignite;    // how hard the lines light up before the flood
uniform float u_bandSoft;  // wipe band edge softness
uniform float u_collapseAmt; // how far contours thin when collapsing
uniform float u_tx;       // pattern-transform progress 0..1
uniform int   u_txMode;   // which deformation is running
uniform float u_txAmt;    // deformation strength

#define TX_NONE 0
#define TX_SHOCK 1
#define TX_VORTEX 2
#define TX_SHEAR 3
#define TX_ZOOM 4
#define TX_MELT 5
#define TX_DISSOLVE 6

vec2 hash22(vec2 p){
  p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
  return -1.0+2.0*fract(sin(p)*43758.5453123);
}
float snoise(vec2 p){
  const float K1=0.366025404,K2=0.211324865;
  vec2 i=floor(p+(p.x+p.y)*K1);
  vec2 a=p-i+(i.x+i.y)*K2;
  float m=step(a.y,a.x);
  vec2 o=vec2(m,1.0-m);
  vec2 b=a-o+K2,c=a-1.0+2.0*K2;
  vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
  vec3 n=h*h*h*h*vec3(dot(a,hash22(i)),dot(b,hash22(i+o)),dot(c,hash22(i+1.0)));
  return dot(n,vec3(70.0));
}
float fbm(vec2 p){
  float v=0.0,a=0.5;
  for(int i=0;i<5;i++){ v+=a*snoise(p); p*=2.07; a*=0.5; }
  return v;
}
float curlPot(vec2 p){ return snoise(p+vec2(u_time*u_animSpeed*0.08,0.0)); }
vec2 curlNoise(vec2 p){
  const float e=0.01;
  float a=curlPot(p+vec2(e,0.)),b=curlPot(p-vec2(e,0.));
  float c=curlPot(p+vec2(0.,e)),d=curlPot(p-vec2(0.,e));
  vec2 g=vec2(a-b,c-d)/(2.0*e);
  return vec2(g.y,-g.x);
}

/* Returns (bands, halo, insideSphere). Mirror is binary — see notes. */
vec3 evalField(vec2 uv,float mir){
  /* PATTERN TRANSFORMS. These deform the sampling space itself, so the flow
     visibly reorganises through a section change instead of being hidden
     behind an overlay. Every one is the identity at u_tx = 0, so a
     transform that is not running cannot alter the resting field. */
  float w = clamp(u_tx,0.,1.);
  if (u_txMode != TX_NONE && w > 0.0001){
    vec2 c = uv - 0.5;
    c.x *= u_aspect;
    float r = length(c);

    if (u_txMode == TX_SHOCK){
      /* Ring travelling outward; the field compresses ahead of it. Travel is
         paced so the ring is still crossing frame at the switch point — at
         1.5x it had already left the viewport by then and concealed nothing. */
      float ring = r - w*0.95;
      float env = exp(-ring*ring*10.0);
      uv += normalize(c+1e-6) * sin(ring*20.0) * env * 0.36 * u_txAmt;
    } else if (u_txMode == TX_VORTEX){
      // Twist falling off with radius, so the centre spins hardest.
      float a = w * u_txAmt * 3.4 * exp(-r*1.6);
      float s=sin(a), co=cos(a);
      c = mat2(co,-s,s,co)*c;
      c.x /= u_aspect;
      uv = c + 0.5;
    } else if (u_txMode == TX_SHEAR){
      // Horizontal slabs slide against each other, then re-align.
      float slab = floor(uv.y*11.0);
      float dir = fract(sin(slab*17.13)*43758.5453)*2.0-1.0;
      uv.x += dir * w * u_txAmt * 0.55;
    } else if (u_txMode == TX_ZOOM){
      // Space rushes through the viewer.
      c /= mix(1.0, 0.22, w*u_txAmt);
      c.x /= u_aspect;
      uv = c + 0.5;
    } else if (u_txMode == TX_MELT){
      // Downward liquid drip, keyed to noise so columns run unevenly.
      float col = snoise(vec2(uv.x*7.0, 0.0));
      uv.y += (0.55 + 0.45*col) * w * u_txAmt * 0.9;
    }
  }

  /* Softened fold: a plain abs() reflection flips the derivative at x=0.5
     and shows as a hard crease, so the apex is rounded. */
  float dx=uv.x-0.5;
  const float FOLD=0.012;
  float folded=0.5+sqrt(dx*dx+FOLD*FOLD)-FOLD;
  vec2 muv=vec2(mir>0.5?folded:uv.x,uv.y);

  float densityNow=u_contourDensity+sin(u_time*u_animSpeed*0.6)*u_densityWobble;
  float scaleNow=u_noiseScale+sin(u_time*u_animSpeed*0.37+1.7)*u_noiseWobble;

  vec2 p=vec2(muv.x*scaleNow*u_flowStretch,muv.y*scaleNow);

  vec2 sc=(uv-u_focus)*vec2(u_aspect,1.0)/max(u_sphereRadius,0.001);
  float r2=dot(sc,sc), r=sqrt(max(r2,1e-6));
  /* Radial bulge. pow(r,e)/r has an infinite gradient at r=0, which shows up
     as a vortex/starburst pinching the noise at the sphere's centre, so the
     warp is faded to identity inside u_pinchSoft — finite derivative there,
     full bulge further out. */
  float bulgeE=mix(1.0,0.35,clamp(u_morph,0.,1.));
  float soft=max(u_pinchSoft,1e-3);
  sc*=mix(1.0,pow(r,bulgeE)/r,smoothstep(0.0,soft,r));
  r2=dot(sc,sc);
  float insideS=1.0-smoothstep(0.85,1.05,r2);
  float zS=sqrt(max(1.0-min(r2,1.0),0.0));
  vec3 N3=vec3(sc.x,sc.y,zS);
  float lon=atan(N3.x,max(N3.z,1e-3))+u_time*u_animSpeed*0.15;
  float lat=asin(clamp(N3.y,-1.0,1.0));
  vec2 sphereP=vec2(lon*0.159155*scaleNow*u_flowStretch*0.4,lat*0.318310*scaleNow);
  p=mix(p,sphereP,clamp(u_morph,0.,1.)*insideS);

  const int MAXC=32;
  int steps=int(clamp(u_curlSteps,0.0,float(MAXC)));
  vec2 q=p/max(u_curlScale,0.001);
  for(int i=0;i<MAXC;i++){ if(i>=steps) break; q+=curlNoise(q)*(u_curlStrength*0.05); }
  p=q*u_curlScale;

  /* Displacement follows the fold (or the halves tear apart at the seam);
     the glow does not (or the cursor gains a second hotspot). */
  float mouseFolded=0.5+sqrt((u_mouse.x-0.5)*(u_mouse.x-0.5)+FOLD*FOLD)-FOLD;
  vec2 dispFrom=vec2(mir>0.5?mouseFolded:u_mouse.x,u_mouse.y);
  vec2 toDisp=muv-dispFrom; toDisp.x*=u_res.x/max(u_res.y,1.0);
  float rad=max(u_hoverRadius,0.001);
  p+=toDisp*exp(-dot(toDisp,toDisp)/(rad*rad))*u_hoverStrength*8.0;
  vec2 toGlow=uv-u_mouse; toGlow.x*=u_res.x/max(u_res.y,1.0);
  float halo=pow(exp(-dot(toGlow,toGlow)/(rad*rad)),0.8)*u_hoverGlow;

  vec2 warp=vec2(fbm(p+vec2(1.7,9.2))*0.4,fbm(p+vec2(8.3,2.8))*1.6);
  float h=fbm(p+warp);

  /* Collapse thins the contours toward nothing by raising the exponent,
     so the flow reads as closing rather than fading. */
  float sharp=u_contourSharpness*(1.0+u_collapse*u_collapseAmt);
  float bands=pow(0.5+0.5*sin(h*densityNow),sharp);

  /* Dissolve is the one transform that acts on the RESULT rather than the
     coordinate: contours erode into a grain matrix and reform. */
  if (u_txMode == TX_DISSOLVE && w > 0.0001){
    vec2 cell = floor(uv*mix(160.0,34.0,u_txAmt));
    float rnd = fract(sin(dot(cell,vec2(12.9898,78.233)))*43758.5453);
    bands *= step(w*1.08, rnd);
  }


  return vec3(bands,halo,insideS);
}

void main(){
  vec2 uv=v_uv;
  vec3 F=evalField(uv,u_mirror);
  float bands=F.x,halo=F.y,insideS=F.z;

  float topFade=pow(clamp(uv.y,0.,1.),mix(u_topFade,0.25,clamp(u_morph,0.,1.)));
  float outsideFade=mix(1.0,insideS,clamp(u_morph,0.,1.));
  float present=1.0-u_collapse;   // collapse also drains line intensity

  vec3 colDark=mix(u_base,u_accent,bands*present)*topFade;
  colDark+=u_accent*bands*present*halo*topFade*0.8;
  colDark*=outsideFade;

  /* WHITE stays the literal white the FLOOD needs. The inverted sections get
     their own paper and ink colours so "light" is a designable theme rather
     than a hardcoded pair. */
  const vec3 WHITE=vec3(1.0);
  float amtL=clamp(bands*present*u_density*(0.75+0.25*halo),0.,1.)*outsideFade;
  amtL=pow(amtL,max(u_lightContrast,0.05));
  vec3 colLight=mix(u_lightBg,u_lightInk,amtL);

  float th=texture(u_lut,vec2(0.5,uv.y)).r;
  vec3 col=mix(colDark,colLight,th);
  vec3 rest=mix(u_base*0.55,u_lightBg,th);
  col=mix(rest,col,clamp(u_dim,0.,1.));

  /* WHITE FLOOD — lines ignite first, then the frame goes white. */
  float f=clamp(u_flash,0.,1.);
  col+=WHITE*bands*pow(f,0.7)*u_ignite;
  col=mix(col,WHITE,pow(smoothstep(0.0,1.0,f),1.6));

  /* CURTAIN WIPE — a soft white BAND travels up the frame: it grows to
     cover the screen, then clears off the top. u_curtain is the band's
     centre in uv.y, so parking it far off-screen makes the term a provable
     no-op, and u_wipeOn gates it out of the other studies entirely. */
  float bandD=abs(uv.y-u_curtain);
  float curtain=(1.0-smoothstep(u_bandSoft*0.72,u_bandSoft,bandD))*u_wipeOn;
  col=mix(col,WHITE,curtain);

  frag=vec4(col,1.0);
}`;

  const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(sh));return sh};
  const prog=gl.createProgram();
  gl.attachShader(prog,mk(gl.VERTEX_SHADER,VERT));
  gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(prog));

  gl.bindVertexArray(gl.createVertexArray());
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,'a_pos');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

  const U={};
  ['u_res','u_time','u_aspect','u_mouse','u_base','u_accent','u_density','u_lut',
   'u_morph','u_sphereRadius','u_pinchSoft','u_focus','u_noiseScale','u_flowStretch','u_contourDensity',
   'u_contourSharpness','u_topFade','u_animSpeed','u_densityWobble','u_noiseWobble',
   'u_hoverStrength','u_hoverRadius','u_hoverGlow','u_curlSteps','u_curlScale',
   'u_curlStrength','u_mirror','u_dim','u_lightBg','u_lightInk','u_lightContrast',
   'u_flash','u_curtain','u_wipeOn','u_collapse',
   'u_ignite','u_bandSoft','u_collapseAmt','u_tx','u_txMode','u_txAmt']
    .forEach(n=>U[n]=gl.getUniformLocation(prog,n));

  const N=2048,lutData=new Uint8Array(N),lutTex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,lutTex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,1,N,0,gl.RED,gl.UNSIGNED_BYTE,lutData);

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse={x:0.5,y:0.55},mTarget={x:0.5,y:0.55};
  let morph=0,morphT=0, mirror=0, dim=1,dimT=1;
  /* Transition settings. Every value here is a knob on HOW a section change
     is performed, not on the field itself. Persisted so a setting survives
     reload while you judge it. */
  const T_DEFAULTS={
    window:0.50,      // transition length, in viewport heights
    stickyWindow:0.85,// the sticky study wants a longer hold
    rise:0.085,       // how fast the transition builds
    clear:0.055,      // how fast it clears (slower = an exhale)
    ignite:1.60,      // line flare before the flood
    bandSoft:0.72,    // wipe band edge softness
    collapseAmt:7.0,  // contour thinning depth
    contractAmt:0.78, // how far the orb pulls in
    txAmt:1.00,       // pattern-deformation strength
    latch:0.55        // where in the transition state changes
  };
  const T=Object.assign({},T_DEFAULTS,JSON.parse(localStorage.getItem('nfTweaks')||'{}'));
  const saveT=()=>localStorage.setItem('nfTweaks',JSON.stringify(T));

  /* Pattern-transform modes map to the shader's TX_* constants. Kept as a
     lookup rather than a chain of comparisons so adding one is a one-line
     change here and in the shader. */
  const TX={none:0,shock:1,vortex:2,shear:3,zoom:4,melt:5,dissolve:6};
  const isTx=m=>m in TX && m!=='none';

  const CURTAIN_PARK=-3;   // far enough that the band factor is exactly 0
  let flash=0,flashT=0, curtain=CURTAIN_PARK, collapse=0,collapseT=0;
  let tx=0,txT=0, txForce=null;   // txForce pins the transform for inspection
  // Contract study: the sphere is already fully formed by then, so the
  // punctuation has to be a change of SIZE, not of morph.
  let radius=1,radiusT=1;
  let latchedMirror=0,latchedMorph=null;
  let geom=[],heroGeom=null,lutSig='',edges=[];
  let mode=localStorage.getItem('nfMode')||'flood';

  addEventListener('pointermove',e=>{
    mTarget.x=e.clientX/innerWidth; mTarget.y=1-e.clientY/innerHeight;
  },{passive:true});

  function measure(){
    const sy=scrollY;
    geom=[...document.querySelectorAll('[data-bg-theme]')].map((el,i)=>{
      const r=el.getBoundingClientRect();
      const mv=parseFloat(el.getAttribute('data-bg-mirror'));
      const dv=parseFloat(el.getAttribute('data-bg-dim'));
      const pv=parseFloat(el.getAttribute('data-bg-morph'));
      return {top:r.top+sy,h:r.height,light:el.getAttribute('data-bg-theme')==='light',
              ov:ovOf(el,i),ovSig:JSON.stringify(ovOf(el,i)),
              mirror:isFinite(mv)?mv:null,dim:isFinite(dv)?dv:null,morph:isFinite(pv)?pv:null};
    }).filter(g=>g.h>0);
    const hero=document.querySelector('[data-bg-hero]');
    heroGeom=hero?(r=>({top:r.top+sy,h:r.height}))(hero.getBoundingClientRect()):null;
    lutSig='';
    // Only boundaries where the field's state actually changes are worth a
    // transition; identical neighbours need none.
    edges=[];
    for(let i=1;i<geom.length;i++){
      const a=geom[i-1],b=geom[i];
      if(a.light!==b.light || (a.mirror||0)!==(b.mirror||0) || a.ovSig!==b.ovSig ||
         (a.dim==null?1:a.dim)!==(b.dim==null?1:b.dim) ||
         (a.morph==null?-1:a.morph)!==(b.morph==null?-1:b.morph)) edges.push(b.top);
    }
  }

  function scanScroll(){
    if(heroGeom){
      const span=Math.max(heroGeom.h*0.85,1);
      morphT=Math.max(0,Math.min(1,-(heroGeom.top-scrollY)/span));
    }
    const mid=scrollY+innerHeight*0.5;

    // Signed progress through the nearest state boundary, -1 .. +1.
    const WIN=innerHeight*(mode==='sticky'?T.stickyWindow:T.window);
    let near=Infinity,signed=0;
    for(const e of edges){
      const d=mid-e;
      if(Math.abs(d)<Math.abs(near)){ near=d; signed=d/WIN; }
    }
    const prox=Math.abs(near)<WIN ? Math.pow(1-Math.abs(near)/WIN,1.5) : 0;

    flashT=0; collapseT=0; radiusT=1; txT=0;
    // Parked unless the wipe study is running. Assigned directly rather than
    // eased: it is already a continuous function of scroll, and easing it
    // would sweep the band through frame on park/unpark.
    curtain=CURTAIN_PARK;
    if(mode==='flood'||mode==='sticky') flashT=prox;
    else if(mode==='wipe'){
      // Band centre travels below-screen → above-screen across the window,
      // so white grows over the frame and then clears off the top.
      if(Math.abs(signed)<1) curtain=-1.3+((signed+1)/2)*3.6;
    }
    else if(mode==='collapse') collapseT=prox;
    else if(mode==='contract'){
      // Draw the orb in tight, then let it expand again past the boundary.
      radiusT=1-prox*T.contractAmt;
      morphT=Math.max(morphT,prox);
    }
    else if(isTx(mode)) txT=prox;

    let mi=0,di=1,mo=null,ov={};
    for(const g of geom){
      if(mid>=g.top&&mid<g.top+g.h){
        if(g.mirror!==null) mi=g.mirror;
        if(g.dim!==null) di=g.dim;
        if(g.morph!==null) mo=g.morph;
        ov=g.ov;
        break;
      }
    }
    dimT=di;

    /* Latch state where the change is least visible for this study, then
       hold it — otherwise the hero's continuous contraction would
       overwrite a section override on the next frame. */
    /* Concealment gate. This MUST key off the normalised transition progress
       rather than the magnitude of an effect: every magnitude ceiling depends
       on the exposed settings (length, speed, depth), so a magnitude test
       becomes unreachable across much of a slider's range and the state then
       flips in plain view — the exact pop these studies exist to hide.
       `prox` always peaks at 1 at the boundary whatever the settings, so
       T.latch reliably means "how far through the transition the change
       happens". Wipe keeps a geometric test because its concealment is a
       position (band over frame centre), not a magnitude. */
    const hidden = mode==='none' ? true
      : mode==='wipe' ? Math.abs(curtain-0.5)<0.28
      : prox>T.latch;
    /* Also latch whenever the viewport centre is OUTSIDE every transition
       window: nothing is animating there, so the owning section's state can
       be applied directly and invisibly. Without this, any discontinuous
       scroll that skips a peak (Home/End, an anchor jump, browser scroll
       restoration, a fast flick) strands the previous section's state
       indefinitely. In normal scrolling the peak latch fires first, so this
       only ever corrects the skipped-peak case. */
    const outsideAllWindows = Math.abs(near) > WIN;
    if(hidden || outsideAllWindows || !edges.length){
      latchedMirror=mi>0.5?1:0;
      latchedMorph=mo;
      latchedOv=ov;
    }
    mirror=latchedMirror;
    // contract drives morph from the hero scroll, but a section that explicitly
    // asks for full bleed (data-bg-morph="0") must still win.
    if(latchedMorph!==null) morphT=latchedMorph;
    else if(latchedMorph!==null) morphT=Math.max(latchedMorph,prox);
  }

  function buildLut(){
    const sig=scrollY+'|'+innerHeight+'|'+geom.length;
    if(sig===lutSig) return;
    lutSig=sig;
    const raw=new Float32Array(N);
    const sy=scrollY,vh=innerHeight;
    /* Sampled per texel from the scanline it represents, so the theme edge
       lands within one texel (~0.5px at this N) instead of being rounded to
       a whole texel and then blurred into a visible ramp. */
    /* Each texel covers vh/N screen pixels. Testing one scanline per texel
       made the value flip a whole texel at a time, so the edge advanced in
       jumps as you scrolled (the jitter) and the linear filter then smeared
       that step into a visible ramp (the bleed). Instead each texel stores
       how much of its own span is light, so the filtered edge is accurate to
       a fraction of a texel and slides continuously with scroll. */
    const span=vh/(N-1);
    const lightAt=y=>{
      for(const g of geom){
        const top=g.top-sy,bot=top+g.h;
        if(y>=top&&y<bot) return g.light?1:0;
      }
      return 0;
    };
    const SUB=8;
    for(let i=0;i<N;i++){
      const c=(1-i/(N-1))*vh;
      let acc=0;
      for(let k=0;k<SUB;k++) acc+=lightAt(c+((k+0.5)/SUB-0.5)*span);
      raw[i]=acc/SUB;
    }
    for(let i=0;i<N;i++) lutData[i]=Math.round(raw[i]*255);
    gl.bindTexture(gl.TEXTURE_2D,lutTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
    gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,1,N,gl.RED,gl.UNSIGNED_BYTE,lutData);
  }

  /* Canvas sizing is SELF-HEALING rather than event-dependent. Inside an
     iframe or any container not yet laid out, innerWidth/innerHeight are 0
     when this runs, which would pin the buffer at 1x1 forever — a resize
     event never fires in a statically-sized frame, so there is no recovery
     path. The draw loop re-checks the wanted size every frame (a cheap
     integer compare), and a ResizeObserver covers the reduced-motion case
     where there is no loop. */
  function wantedSize(){
    const dpr=Math.min(devicePixelRatio||1,1.5)*P.renderScale;
    const vw=innerWidth||document.documentElement.clientWidth||0;
    const vh=innerHeight||document.documentElement.clientHeight||0;
    return [Math.max(1,Math.floor(vw*dpr)),Math.max(1,Math.floor(vh*dpr))];
  }
  function syncSize(){
    const [w,h]=wantedSize();
    // Keep the fixed panel inside the real viewport; see .panel comment.
    const pnl=document.getElementById('panel');
    if(pnl){
      const cap=Math.max(120,(innerHeight||document.documentElement.clientHeight||600)-36)+'px';
      if(pnl.style.maxHeight!==cap) pnl.style.maxHeight=cap;
    }
    if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; measure(); return true; }
    return false;
  }
  function resize(){ syncSize(); measure(); if(reduced) draw(0); }
  addEventListener('resize',resize);
  if(window.ResizeObserver) new ResizeObserver(()=>{
    if(syncSize() && reduced) draw(0);
  }).observe(document.documentElement);

  /* Animation phase is INTEGRATED, not t*speed: multiplying a large clock by a
     changing speed makes any per-section animSpeed shift sweep the pattern
     violently (the 04→05 boundary). Accumulating dt*speed keeps the phase
     continuous, so a speed change only changes the rate from here on. */
  let phase=0,lastT=null;
  const readout=document.getElementById('readout');
  function draw(t){
    syncSize();
    scanScroll(); buildLut();
    const k=reduced?1:0;
    morph+=(morphT-morph)*(k||0.07);
    dim+=(dimT-dim)*(k||0.035);
    /* Build/clear rates scale with the transition length. Without this a
       short window gives the easing too few frames to reach full magnitude,
       so the concealing effect never fully arrives even though the latch
       fires at the right progress point. */
    const winScale = 0.5 / Math.max(mode==='sticky'?T.stickyWindow:T.window, 0.05);
    const rise  = Math.min(0.5, T.rise  * winScale);
    const clear = Math.min(0.5, T.clear * winScale);
    flash+=(flashT-flash)*(k||(flashT>flash?rise:clear));
    collapse+=(collapseT-collapse)*(k||(collapseT>collapse?rise:clear));
    tx+=(txT-tx)*(k||(txT>tx?rise:clear));
    if(txForce!==null) tx=txForce;
    radius+=(radiusT-radius)*(k||Math.min(0.5,0.075*winScale));
    mouse.x+=(mTarget.x-mouse.x)*(k||0.07);
    mouse.y+=(mTarget.y-mouse.y)*(k||0.07);
    /* Ease every overridable key toward the owning section's value. Unset
       keys target the global, so removing an override glides back rather
       than snapping. */
    const ovRate=k||0.06;
    for(const key of SEC_KEYS){
      const tv=latchedOv[key]!=null?latchedOv[key]:P[key];
      if(Array.isArray(tv)) for(let j=0;j<3;j++) E[key][j]+=(tv[j]-E[key][j])*ovRate;
      else E[key]+=(tv-E[key])*ovRate;
    }

    gl.viewport(0,0,cv.width,cv.height);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,lutTex);
    gl.uniform1i(U.u_lut,0);
    gl.uniform2f(U.u_res,cv.width,cv.height);
    const dt=lastT==null?0:Math.max(0,Math.min(0.1,t-lastT)); lastT=t;
    phase+=dt*E.animSpeed;
    gl.uniform1f(U.u_time,reduced?0:phase);
    gl.uniform1f(U.u_aspect,cv.width/Math.max(cv.height,1));
    gl.uniform2f(U.u_mouse,mouse.x,mouse.y);
    gl.uniform3f(U.u_base,...E.base);
    gl.uniform3f(U.u_accent,...E.accent);
    gl.uniform1f(U.u_density,E.lightDensity);
    gl.uniform1f(U.u_morph,morph);
    gl.uniform1f(U.u_sphereRadius,P.sphereRadius*radius);
    gl.uniform1f(U.u_pinchSoft,P.pinchSoft);
    gl.uniform2f(U.u_focus,E.focusX,0.5);
    gl.uniform1f(U.u_noiseScale,E.noiseScale);
    gl.uniform1f(U.u_flowStretch,E.flowStretch);
    gl.uniform1f(U.u_contourDensity,E.contourDensity);
    gl.uniform1f(U.u_contourSharpness,E.contourSharpness);
    gl.uniform1f(U.u_topFade,E.topFade);
    gl.uniform1f(U.u_animSpeed,reduced?0:1);
    gl.uniform1f(U.u_densityWobble,P.densityWobble);
    gl.uniform1f(U.u_noiseWobble,P.noiseWobble);
    gl.uniform1f(U.u_hoverStrength,reduced?0:P.hoverStrength);
    gl.uniform1f(U.u_hoverRadius,P.hoverRadius);
    gl.uniform1f(U.u_hoverGlow,P.hoverGlow);
    gl.uniform1f(U.u_curlSteps,P.curlSteps);
    gl.uniform1f(U.u_curlScale,P.curlScale);
    gl.uniform1f(U.u_curlStrength,E.curlStrength);
    gl.uniform1f(U.u_mirror,mirror);
    gl.uniform1f(U.u_dim,dim);
    gl.uniform3f(U.u_lightBg,...E.lightBg);
    gl.uniform3f(U.u_lightInk,...E.lightInk);
    gl.uniform1f(U.u_lightContrast,E.lightContrast);
    gl.uniform1f(U.u_flash,flash);
    gl.uniform1f(U.u_curtain,curtain);
    gl.uniform1f(U.u_wipeOn,mode==='wipe'?1:0);
    gl.uniform1f(U.u_collapse,collapse);
    gl.uniform1f(U.u_ignite,T.ignite);
    gl.uniform1f(U.u_bandSoft,T.bandSoft);
    gl.uniform1f(U.u_collapseAmt,T.collapseAmt);
    gl.uniform1f(U.u_tx,tx);
    gl.uniform1i(U.u_txMode,isTx(mode)?TX[mode]:0);
    gl.uniform1f(U.u_txAmt,T.txAmt);
    gl.drawArrays(gl.TRIANGLES,0,3);

    /* Readout names the effect that is actually driving THIS mode — printing
       flash/collapse in a pattern-transform mode reports 0 for both and omits
       the real driver. */
    if(readout){
      const parts=['morph '+morph.toFixed(2),'mirror '+mirror];
      if(isTx(mode)) parts.push('deform '+tx.toFixed(2));
      else if(mode==='wipe') parts.push('band '+(curtain<-2?'off':curtain.toFixed(2)));
      else if(mode==='collapse') parts.push('collapse '+collapse.toFixed(2));
      else if(mode==='contract') parts.push('radius '+radius.toFixed(2));
      else if(mode!=='none') parts.push('flash '+flash.toFixed(2));
      readout.textContent=mode+'  ·  '+parts.join('  ');
    }
  }

  
  /* ---- baked settings (exported 2026-08-05, 'contract') ---- */
  Object.assign(T, {"window": 0.6, "stickyWindow": 0.85, "rise": 0.025, "clear": 0.02, "ignite": 0.7, "bandSoft": 0.72, "collapseAmt": 7, "contractAmt": 0.2, "txAmt": 0.25, "latch": 0.4});
  Object.assign(P, {"base": [0.02, 0.03, 0.11], "accent": [0.45, 0.65, 1], "lightDensity": 1.12, "lightBg": [1, 1, 1], "lightInk": [0.298, 0.388, 1], "lightContrast": 1.95, "noiseScale": 0.4, "flowStretch": 3.5, "contourDensity": 13, "contourSharpness": 20, "topFade": 1.5, "animSpeed": 0.085, "densityWobble": 12, "noiseWobble": 0.17, "hoverStrength": 0.17, "hoverRadius": 0.77, "hoverGlow": 2, "curlSteps": 8, "curlScale": 1.7, "curlStrength": 1, "sphereRadius": 0.36, "pinchSoft": 0.5, "focusX": 0.5, "renderScale": 0.7});
  secOv = [];
  /* 'contract' animated a radius through every theme boundary, so the light
     and dark edges travelled up and down the page as you scrolled. 'none'
     drops the transition overlay: the boundary is purely geometric and sits
     exactly where the section edge is. */
  mode  = "none";
  /* the studio panel is gone; setMode only needs to re-measure */
  function setMode(m){ mode=m; requestAnimationFrame(measure); }
  /* run on the three pages that use the field */
  (function(){
    var pgs=['p-landing','p-about','p-contact']
      .map(function(i){return document.getElementById(i)}).filter(Boolean);
    if(!pgs.length) return;
    var on=function(){ return pgs.some(function(p){return p.classList.contains('show')}); };
    var _draw=draw;
    draw=function(t){ if(on()) _draw(t); };
    var cv=document.getElementById('nf');
    var sync=function(){ cv.style.display = on() ? 'block' : 'none'; if(on()) requestAnimationFrame(measure); };
    if(window.MutationObserver){
      pgs.forEach(function(p){ new MutationObserver(sync).observe(p,{attributes:true,attributeFilter:['class']}); });
    }
    sync();
  })();
resize(); setMode(mode);
  addEventListener('load',resize);

  /* Palette setter. Writing P alone is not enough: E eases toward P at a few
     percent per frame, so under a throttled rAF a scroll-driven colour change
     never arrives. This moves both, so the shader sees it on the next draw. */
  function setPalette(accent,base){
    if(accent){ P.accent=accent.slice(); E.accent=accent.slice(); }
    if(base){ P.base=base.slice(); E.base=base.slice(); }
  }

  window.__noiseField={
    draw, measure, params:P, setMode, tweaks:T, setPalette,
    forceTx:v=>{txForce=v;},
    state:()=>({mode,morph:+morph.toFixed(3),mirror,dim:+dim.toFixed(3),
                flash:+flash.toFixed(3),curtain:+curtain.toFixed(3),
                collapse:+collapse.toFixed(3),radius:+radius.toFixed(3),
                tx:+tx.toFixed(3),
                edges:edges.length, themeAtCentre:lutData[N>>1]/255})
  };

  if(reduced){
    let q=false;
    addEventListener('scroll',()=>{ if(q)return; q=true;
      requestAnimationFrame(()=>{q=false;draw(0)});},{passive:true});
    draw(0);
  } else {
    const t0=performance.now(); let prev=0;
    (function loop(){
      requestAnimationFrame(loop);
      const now=performance.now();
      if(now-prev<1000/30) return;
      prev=now; draw((now-t0)/1000);
    })();
  }
})();


  // tag slider: arrows, drag, wheel, and keep the active tag in view
  (function(){
    var sl=document.getElementById('tagSlider'); if(!sl) return;
    var track=sl.querySelector('.tagtrack'),
        prev=document.getElementById('tagPrev'), next=document.getElementById('tagNext');
    function sync(){
      var max=track.scrollWidth-track.clientWidth-2;
      prev.disabled = track.scrollLeft<=2;
      next.disabled = track.scrollLeft>=max;
    }
    function step(dir){ track.scrollBy({left:dir*Math.max(200,track.clientWidth*0.7),behavior:'smooth'}); }
    prev.addEventListener('click',function(){step(-1)});
    next.addEventListener('click',function(){step(1)});
    track.addEventListener('scroll',sync,{passive:true});
    addEventListener('resize',sync);
    track.addEventListener('wheel',function(e){
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ track.scrollLeft+=e.deltaY; e.preventDefault(); }
    },{passive:false});
    var down=false,sx=0,sc=0,moved=0;
    track.addEventListener('pointerdown',function(e){
      down=true;moved=0;sx=e.clientX;sc=track.scrollLeft;track.classList.add('dragging'); });
    track.addEventListener('pointermove',function(e){
      if(!down)return; var d=e.clientX-sx; moved=Math.max(moved,Math.abs(d)); track.scrollLeft=sc-d; });
    ['pointerup','pointerleave','pointercancel'].forEach(function(v){
      track.addEventListener(v,function(){down=false;track.classList.remove('dragging')}); });
    // a drag must not also select a tag
    track.addEventListener('click',function(e){ if(moved>6){e.preventDefault();e.stopPropagation();} },true);
    // when a tag is chosen, bring it fully into view
    track.addEventListener('click',function(e){
      var b=e.target.closest('.tf'); if(!b||moved>6) return;
      setTimeout(function(){
        var t=track.getBoundingClientRect(), r=b.getBoundingClientRect();
        if(r.left<t.left+24) track.scrollBy({left:r.left-t.left-40,behavior:'smooth'});
        else if(r.right>t.right-24) track.scrollBy({left:r.right-t.right+40,behavior:'smooth'});
      },0);
    });
    // The work page is display:none at load, so first measure returns 0 and both
    // arrows latch disabled. Re-sync whenever the track actually gets a size.
    if(window.ResizeObserver) new ResizeObserver(sync).observe(track);
    document.body.addEventListener('click',function(e){
      if(e.target.closest('[data-goto]')) setTimeout(sync,120);
    });
    sync(); setTimeout(sync,300);
  })();

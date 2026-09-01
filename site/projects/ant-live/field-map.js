/* FIELD — full-screen interactive world map of NANOTERN field sites.
   Real Natural Earth geometry via d3-geo + TopoJSON. Click a pin to open its record. */
(function(){
"use strict";
var LS='ant-field-lang';
var root=document.getElementById('field-map-app');
if(!root||typeof d3==='undefined') return;

var SITES=window.FIELD_SITES;
var LANG=localStorage.getItem(LS); if(['en','fr','tr'].indexOf(LANG)<0) LANG='en';

var UI={
  en:{ title:'Field reference map', sub:'Every NANOTERN™ field application, plotted. Select a site to open its full field record.',
    search:'Search by country, crop or partner', sites:'field sites', countries:'countries', continents:'continents',
    allCrops:'All crops', allCountries:'All countries', allProducts:'All products', reset:'Reset', none:'No sites match that filter.',
    hint:'Drag to pan · scroll to zoom · click a pin', published:'Report published', zoomOut:'Zoom out', close:'Close',
    index:'Site index', openRecord:'Open field record', report:'Official report' },
  fr:{ title:'Carte de référence des essais', sub:'Chaque application de terrain NANOTERN™, cartographiée. Sélectionnez un site pour ouvrir sa fiche complète.',
    search:'Rechercher par pays, culture ou partenaire', sites:'sites d’essai', countries:'pays', continents:'continents',
    allCrops:'Toutes cultures', allCountries:'Tous pays', allProducts:'Tous produits', reset:'Réinitialiser', none:'Aucun site ne correspond.',
    hint:'Glisser pour déplacer · molette pour zoomer · cliquer un repère', published:'Rapport publié', zoomOut:'Dézoomer', close:'Fermer',
    index:'Index des sites', openRecord:'Ouvrir la fiche', report:'Rapport officiel' },
  tr:{ title:'Saha referans haritası', sub:'Her NANOTERN™ saha uygulaması haritada. Tam saha kaydını açmak için bir saha seçin.',
    search:'Ülke, ürün veya ortak ara', sites:'saha', countries:'ülke', continents:'kıta',
    allCrops:'Tüm ürünler', allCountries:'Tüm ülkeler', allProducts:'Tüm formülasyonlar', reset:'Sıfırla', none:'Bu filtreye uyan saha yok.',
    hint:'Sürükleyerek gezin · tekerlekle yakınlaştır · bir işarete tıkla', published:'Rapor yayımlandı', zoomOut:'Uzaklaş', close:'Kapat',
    index:'Saha dizini', openRecord:'Saha kaydını aç', report:'Resmi rapor' }
};

var state={ q:'', country:'', product:'', selected:null };

/* ---------- shell ---------- */
root.innerHTML=
'<div class="fm2-bar">'+
  '<div class="fm2-brand"><b>ANT Systems</b><span>/ field</span></div>'+
  '<div class="fm2-counts" id="fm2-counts"></div>'+
  '<div class="fm2-langs" id="fm2-langs">'+
    ['en','fr','tr'].map(function(l){return '<button class="fm2-lang" data-lang="'+l+'">'+l.toUpperCase()+'</button>';}).join('')+
  '</div>'+
'</div>'+
'<div class="fm2-main">'+
  '<aside class="fm2-rail">'+
    '<div class="fm2-railtop">'+
      '<input class="fm2-search" id="fm2-search" type="search" autocomplete="off">'+
      '<div class="fm2-selects">'+
        '<select class="fm2-select" id="fm2-country"></select>'+
        '<select class="fm2-select" id="fm2-product"></select>'+
      '</div>'+
    '</div>'+
    '<div class="fm2-index" id="fm2-index"></div>'+
  '</aside>'+
  '<div class="fm2-canvas" id="fm2-canvas">'+
    '<svg id="fm2-svg" role="img"></svg>'+
    '<div class="fm2-hint" id="fm2-hint"></div>'+
    '<div class="fm2-tip" id="fm2-tip"><b></b><span></span></div>'+
    '<div class="fm2-legend" id="fm2-legend"></div>'+
    '<button class="fm2-zoomout" id="fm2-zoomout"></button>'+
  '</div>'+
'</div>'+
'<div class="fm2-reader" id="fm2-reader" aria-hidden="true">'+
  '<div class="fm2-readerbar">'+
    '<button class="fm2-back" id="fm2-back">←</button>'+
    '<div class="fm2-readertitle" id="fm2-readertitle"></div>'+
    '<div class="fm2-langs" id="fm2-readerlangs">'+
      ['en','fr','tr'].map(function(l){return '<button class="fm2-lang" data-lang="'+l+'">'+l.toUpperCase()+'</button>';}).join('')+
    '</div>'+
  '</div>'+
  '<div class="fm2-readerbody">'+
    '<div id="field-report"></div>'+
  '</div>'+
'</div>';

var svgEl=document.getElementById('fm2-svg');
var canvas=document.getElementById('fm2-canvas');
var tip=document.getElementById('fm2-tip');
var reader=document.getElementById('fm2-reader');

/* ---------- map ---------- */
var svg=d3.select(svgEl);
var gRoot=svg.append('g');
var gLand=gRoot.append('g'), gPins=gRoot.append('g');
var projection=d3.geoNaturalEarth1();
var path=d3.geoPath(projection);
var W=0,H=0, land=null, activeISO={};
SITES.forEach(function(s){ activeISO[s.iso]=true; });

var NUM_ISO={ '686':'SEN','792':'TUR','604':'PER','152':'CHL','784':'ARE','380':'ITA','368':'IRQ','840':'USA','528':'NLD' };

var zoom=d3.zoom().scaleExtent([1,14]).on('zoom',function(ev){
  gRoot.attr('transform',ev.transform);
  gLand.attr('stroke-width',0.6/ev.transform.k);
  gPins.selectAll('.fm2-pin').attr('transform',function(d){
    var p=projection([d.lng,d.lat]);
    return 'translate('+p[0]+','+p[1]+') scale('+(1/ev.transform.k)+')';
  });
  document.getElementById('fm2-zoomout').classList.toggle('show', ev.transform.k>1.15);
});
svg.call(zoom).on('dblclick.zoom',null);

function size(){
  var r=canvas.getBoundingClientRect();
  if(!r.width || !r.height) return false;   /* hidden page: never bake a fake viewBox */
  W=r.width; H=r.height;
  svg.attr('viewBox','0 0 '+W+' '+H).attr('width',W).attr('height',H)
     .attr('preserveAspectRatio','xMidYMid meet');
  projection.fitExtent([[16,26],[W-16,H-30]],{type:'Sphere'});
  if(land) draw();
  return true;
}

/* keep trying until the page is actually visible and measurable */
var settleReq=null;
function settle(){
  if(settleReq) cancelAnimationFrame(settleReq);
  var tries=0;
  (function tick(){
    if(size()) return;
    if(++tries>600) return;              /* ~10s of frames, then give up quietly */
    settleReq=requestAnimationFrame(tick);
  })();
}

function draw(){
  if(!W || !H || !land) return;   /* never paint against an unfitted projection */
  gLand.selectAll('path').remove();
  gLand.attr('stroke','rgba(255,255,255,0.10)').attr('stroke-width',0.6);
  gLand.selectAll('path').data(land.features).enter().append('path')
    .attr('d',path)
    .attr('fill',function(f){
      var iso=NUM_ISO[String(f.id)];
      return (iso&&activeISO[iso])?'#1B4D24':'#131A18';
    })
    .attr('class',function(f){ var iso=NUM_ISO[String(f.id)]; return (iso&&activeISO[iso])?'fm2-country on':'fm2-country'; });
  drawPins();
}

function visible(){
  var q=state.q.toLowerCase();
  return SITES.filter(function(s){
    if(state.country && s.country[LANG]!==state.country) return false;
    if(state.product && s.products.indexOf(state.product)<0) return false;
    if(!q) return true;
    return [s.name,s.partner,s.region,s.country[LANG],s.crop[LANG],s.products.join(' ')].join(' ').toLowerCase().indexOf(q)>=0;
  });
}

function drawPins(){
  var k=d3.zoomTransform(svgEl).k;
  var vis=visible();
  var sel=gPins.selectAll('.fm2-pin').data(vis,function(d){return d.id;});
  sel.exit().remove();
  var g=sel.enter().append('g').attr('class','fm2-pin');

  g.append('circle').attr('class','fm2-halo').attr('r',15);
  g.append('circle').attr('class','fm2-ring').attr('r',9);
  g.append('circle').attr('class','fm2-core').attr('r',5.2);
  g.append('path').attr('class','fm2-emb')
    .attr('d','M0,-3.1 L0,3.1 M-2.2,-2.2 L2.2,2.2 M-3.1,0 L3.1,0')
    .attr('stroke','#20170a').attr('stroke-width',1.15).attr('stroke-linecap','round').attr('fill','none');
  g.append('circle').attr('class','fm2-hit').attr('r',17).attr('fill','transparent');

  var all=gPins.selectAll('.fm2-pin')
    .classed('flagship',function(d){return !!d.flagship;})
    .classed('active',function(d){return state.selected===d.id;})
    .attr('transform',function(d){
      var p=projection([d.lng,d.lat]);
      return 'translate('+p[0]+','+p[1]+') scale('+(1/k)+')';
    });
  all.on('mouseenter',function(ev,d){ showTip(ev,d); })
     .on('mousemove',function(ev,d){ showTip(ev,d); })
     .on('mouseleave',function(){ tip.classList.remove('show'); })
     .on('click',function(ev,d){ ev.stopPropagation(); select(d.id,true); });
}

function showTip(ev,d){
  var r=canvas.getBoundingClientRect();
  tip.querySelector('b').textContent=d.name;
  tip.querySelector('span').textContent=(d.country[LANG]+' · '+d.crop[LANG]).toUpperCase();
  tip.style.left=(ev.clientX-r.left)+'px';
  tip.style.top=(ev.clientY-r.top)+'px';
  tip.classList.add('show');
  document.getElementById('fm2-hint').classList.add('gone');
}

function flyTo(s){
  var p=projection([s.lng,s.lat]);
  var k=4.6;
  svg.transition().duration(900).call(zoom.transform,
    d3.zoomIdentity.translate(W/2,H/2).scale(k).translate(-p[0],-p[1]));
}
document.getElementById('fm2-zoomout').addEventListener('click',function(){
  svg.transition().duration(700).call(zoom.transform,d3.zoomIdentity);
});

/* ---------- index rail ---------- */
function paintIndex(){
  var u=UI[LANG], vis=visible();
  var box=document.getElementById('fm2-index');
  if(!vis.length){ box.innerHTML='<p class="fm2-none">'+u.none+'</p>'; return; }
  var byCountry={};
  vis.forEach(function(s){ (byCountry[s.country[LANG]]=byCountry[s.country[LANG]]||[]).push(s); });
  box.innerHTML='<div class="fm2-mono fm2-indexlbl">'+u.index+' · '+vis.length+'</div>'+
    Object.keys(byCountry).sort().map(function(c){
      return '<div class="fm2-grp"><div class="fm2-mono fm2-grplbl">'+c+'</div>'+
        byCountry[c].map(function(s){
          return '<button class="fm2-item'+(s.flagship?' flag':'')+(state.selected===s.id?' on':'')+'" data-id="'+s.id+'">'+
            '<b>'+s.name+'</b><span>'+s.region+' · '+s.crop[LANG]+'</span>'+
            (s.report?'<em class="fm2-mono">'+u.published+'</em>':'')+'</button>';
        }).join('')+'</div>';
    }).join('');
  box.querySelectorAll('.fm2-item').forEach(function(b){
    b.addEventListener('click',function(){ select(b.dataset.id,true); });
  });
}

function paintChrome(){
  var u=UI[LANG];
  document.getElementById('fm2-search').placeholder=u.search;
  document.getElementById('fm2-hint').textContent=u.hint;
  document.getElementById('fm2-zoomout').textContent=u.zoomOut;
  document.getElementById('fm2-back').setAttribute('aria-label',u.close);

  var countries=[]; var products=[];
  SITES.forEach(function(s){
    if(countries.indexOf(s.country[LANG])<0) countries.push(s.country[LANG]);
    s.products.forEach(function(p){ if(products.indexOf(p)<0) products.push(p); });
  });
  var cs=document.getElementById('fm2-country');
  cs.innerHTML='<option value="">'+u.allCountries+'</option>'+countries.sort().map(function(c){
    return '<option'+(state.country===c?' selected':'')+'>'+c+'</option>';}).join('');
  var ps=document.getElementById('fm2-product');
  ps.innerHTML='<option value="">'+u.allProducts+'</option>'+products.sort().map(function(p){
    return '<option'+(state.product===p?' selected':'')+'>'+p+'</option>';}).join('');

  document.getElementById('fm2-counts').innerHTML=
    [[SITES.length,u.sites],[countries.length,u.countries],[4,u.continents]].map(function(a){
      return '<div class="fm2-count"><b>'+a[0]+'</b><span>'+a[1]+'</span></div>';}).join('');

  document.getElementById('fm2-legend').innerHTML=
    '<span><i class="lg flag"></i>'+u.published+'</span><span><i class="lg"></i>'+u.sites+'</span>';

  root.querySelectorAll('.fm2-lang').forEach(function(b){
    b.setAttribute('aria-pressed', b.dataset.lang===LANG);
  });
}

/* ---------- reader ---------- */
function openReader(site){
  var body=document.querySelector('.fm2-readerbody');
  var out=document.getElementById('field-report');
  if(site.report){
    out.innerHTML=window.FieldReport.full(LANG);
    document.getElementById('fm2-readertitle').textContent=site.name+' · '+site.country[LANG];
  } else {
    out.innerHTML=window.FieldReport.site(site,LANG);
    document.getElementById('fm2-readertitle').textContent=site.name+' · '+site.country[LANG];
  }
  out.querySelectorAll('[data-open-report]').forEach(function(a){
    a.addEventListener('click',function(ev){ ev.preventDefault(); select('senegal-tassette',true); });
  });
  reader.classList.add('open');
  reader.setAttribute('aria-hidden','false');
  body.scrollTop=0;
  window.FieldReport.mountMaps(out,LANG);
  root.querySelectorAll('#fm2-readerlangs .fm2-lang').forEach(function(b){
    b.setAttribute('aria-pressed', b.dataset.lang===LANG);
  });
}
function closeReader(){
  reader.classList.remove('open');
  reader.setAttribute('aria-hidden','true');
}
document.getElementById('fm2-back').addEventListener('click',closeReader);
document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && reader.classList.contains('open')) closeReader();
});

function select(id,open){
  var s=SITES.filter(function(x){return x.id===id;})[0];
  if(!s) return;
  state.selected=id;
  drawPins(); paintIndex();
  flyTo(s);
  if(open) openReader(s);
}

/* ---------- events ---------- */
document.getElementById('fm2-search').addEventListener('input',function(e){
  state.q=e.target.value; drawPins(); paintIndex();
});
document.getElementById('fm2-country').addEventListener('change',function(e){
  state.country=e.target.value; drawPins(); paintIndex();
});
document.getElementById('fm2-product').addEventListener('change',function(e){
  state.product=e.target.value; drawPins(); paintIndex();
});
root.querySelectorAll('.fm2-lang').forEach(function(b){
  b.addEventListener('click',function(){
    LANG=b.dataset.lang;
    try{ localStorage.setItem(LS,LANG); }catch(e){}
    state.country=''; state.product='';
    paintChrome(); paintIndex(); drawPins();
    if(reader.classList.contains('open')){
      var s=SITES.filter(function(x){return x.id===state.selected;})[0];
      if(s) openReader(s);
    }
  });
});
window.addEventListener('resize',size);
if(window.ResizeObserver) new ResizeObserver(size).observe(canvas);
/* the FIELD page starts display:none — re-measure the moment it becomes visible */
if(window.IntersectionObserver){
  new IntersectionObserver(function(ents){
    ents.forEach(function(e){ if(e.isIntersecting) settle(); });
  }).observe(canvas);
}
if(window.MutationObserver){
  var pg=document.getElementById('page-field');
  if(pg) new MutationObserver(function(){
    if(getComputedStyle(pg).display!=='none') settle();
  }).observe(pg,{attributes:true,attributeFilter:['class','style']});
}
/* the site's own navigation runs on every page switch — the dependable hook */
if(typeof window.goTo==='function'){
  var _goTo=window.goTo;
  window.goTo=function(){ var r=_goTo.apply(this,arguments); settle(); return r; };
}

/* ---------- boot ---------- */
paintChrome(); paintIndex(); settle();
d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(function(topo){
  land=topojson.feature(topo,topo.objects.countries);
  settle();
}).catch(function(){
  document.getElementById('fm2-hint').textContent='Map data unavailable — use the site index at left.';
});
})();

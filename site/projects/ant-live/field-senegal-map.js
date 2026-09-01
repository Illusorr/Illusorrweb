/* Senegal thematic maps — real Natural Earth geometry, real station data.
   1) Water-stress / rainfall heat map, interpolated (IDW) from station records and
      clipped to Senegal's true outline, with a month scrubber that runs the season.
   2) Agro-ecological production zones.
   window.SenegalMap.mount(el, lang) */
(function(){
"use strict";

/* Annual rainfall normals, mm — real stations, real coordinates [lng, lat] */
var STATIONS=[
  {n:'Podor',        lng:-14.96, lat:16.65, mm:250},
  {n:'Saint-Louis',  lng:-16.48, lat:16.03, mm:300},
  {n:'Matam',        lng:-13.25, lat:15.66, mm:400},
  {n:'Louga',        lng:-16.22, lat:15.62, mm:350},
  {n:'Linguère',     lng:-15.12, lat:15.39, mm:450},
  {n:'Dakar',        lng:-17.44, lat:14.72, mm:450},
  {n:'Thiès',        lng:-16.93, lat:14.79, mm:500},
  {n:'Diourbel',     lng:-16.23, lat:14.65, mm:550},
  {n:'Kaolack',      lng:-16.07, lat:14.15, mm:700},
  {n:'Tambacounda',  lng:-13.67, lat:13.77, mm:800},
  {n:'Kolda',        lng:-14.95, lat:12.88, mm:1000},
  {n:'Kédougou',     lng:-12.18, lat:12.55, mm:1200},
  {n:'Ziguinchor',   lng:-16.27, lat:12.58, mm:1300}
];
/* Share of annual rainfall by month — Sahelian single-season regime */
var MONTH_F=[0,0,0,0,0.005,0.055,0.22,0.38,0.26,0.075,0.005,0];

var PLACES=[
  {n:'DAKAR', lng:-17.4677, lat:14.7167, kind:'capital'},
  {n:'TASSETTE', lng:-16.8833, lat:14.7833, kind:'trial'},
  {n:'Thiès', lng:-16.9246, lat:14.7910, kind:'city'},
  {n:'Saint-Louis', lng:-16.4818, lat:16.0326, kind:'city'},
  {n:'Kaolack', lng:-16.0726, lat:14.1520, kind:'city'},
  {n:'Tambacounda', lng:-13.6673, lat:13.7707, kind:'city'},
  {n:'Ziguinchor', lng:-16.2719, lat:12.5833, kind:'city'}
];

var ZONES=[
  {id:'valley', lng:-15.6, lat:16.1, en:'Senegal River Valley', fr:'Vallée du fleuve Sénégal', tr:'Senegal Nehri Vadisi',
   cen:'Irrigated rice · sugar cane · tomato', cfr:'Riz irrigué · canne à sucre · tomate', ctr:'Sulu çeltik · şeker kamışı · domates'},
  {id:'niayes', lng:-16.9, lat:15.1, en:'The Niayes', fr:'Les Niayes', tr:'Niayes',
   cen:'Horticulture for export · vegetables', cfr:'Horticulture d’exportation · légumes', ctr:'İhracat bahçeciliği · sebze'},
  {id:'basin', lng:-15.6, lat:14.3, en:'Groundnut Basin', fr:'Bassin arachidier', tr:'Yerfıstığı Havzası',
   cen:'Groundnut · millet · maize', cfr:'Arachide · mil · maïs', ctr:'Yerfıstığı · darı · mısır'},
  {id:'east', lng:-13.2, lat:13.8, en:'Eastern Senegal', fr:'Sénégal oriental', tr:'Doğu Senegal',
   cen:'Cotton · maize · rangeland', cfr:'Coton · maïs · parcours', ctr:'Pamuk · mısır · mera'},
  {id:'casamance', lng:-15.4, lat:12.7, en:'Casamance', fr:'Casamance', tr:'Casamance',
   cen:'Rice · mango · cashew · banana', cfr:'Riz · mangue · anacarde · banane', ctr:'Çeltik · mango · kaju · muz'}
];

var UI={
  en:{ t1:'Water stress, read on the map', t2:'Where Senegal grows',
    tabs:['Rainfall & water stress','Production zones'],
    legend:'Annual rainfall, mm', legendM:'Rainfall this month, mm',
    play:'Run the season', pause:'Pause', annual:'Annual total', months:['January','February','March','April','May','June','July','August','September','October','November','December'],
    src:'Interpolated (inverse-distance weighted) from 13 station rainfall normals and clipped to Senegal’s national boundary. Geometry: Natural Earth. Monthly view applies the single-season Sahelian distribution to each station total.',
    trial:'The 2026 trial site', capital:'Capital',
    stress:['High stress','Moderate stress','Lower stress'],
    note:'Tassette sits inside the high-stress belt: the Diass aquifer serving Dakar and Thiès has fallen about 30 m, and two thirds of the cultivated area lies on sandy Dior profiles holding as little as 25 mm of plant-available water per metre.' },
  fr:{ t1:'Le stress hydrique, lu sur la carte', t2:'Où le Sénégal cultive',
    tabs:['Pluviométrie et stress hydrique','Zones de production'],
    legend:'Pluviométrie annuelle, mm', legendM:'Pluviométrie du mois, mm',
    play:'Dérouler la saison', pause:'Pause', annual:'Total annuel', months:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    src:'Interpolation (pondération inverse à la distance) à partir des normales pluviométriques de 13 stations, découpée sur la frontière nationale du Sénégal. Géométrie : Natural Earth. La vue mensuelle applique la distribution sahélienne à saison unique au total de chaque station.',
    trial:'Le site d’essai 2026', capital:'Capitale',
    stress:['Stress élevé','Stress modéré','Stress plus faible'],
    note:'Tassette se situe dans la ceinture de stress élevé : la nappe de Diass qui alimente Dakar et Thiès a baissé d’environ 30 m, et les deux tiers de la surface cultivée reposent sur des profils sableux Dior ne retenant que 25 mm d’eau utile par mètre.' },
  tr:{ t1:'Su stresini haritadan okumak', t2:'Senegal nerede üretiyor',
    tabs:['Yağış ve su stresi','Üretim bölgeleri'],
    legend:'Yıllık yağış, mm', legendM:'Bu ayın yağışı, mm',
    play:'Sezonu oynat', pause:'Duraklat', annual:'Yıllık toplam', months:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    src:'13 istasyonun yağış normallerinden mesafe-ağırlıklı (IDW) enterpolasyonla üretilmiş ve Senegal ulusal sınırına kırpılmıştır. Geometri: Natural Earth. Aylık görünüm, her istasyon toplamına tek sezonluk Sahel dağılımını uygular.',
    trial:'2026 deneme sahası', capital:'Başkent',
    stress:['Yüksek stres','Orta stres','Düşük stres'],
    note:'Tassette yüksek stres kuşağının içindedir: Dakar ve Thiès’i besleyen Diass akiferi yaklaşık 30 m alçalmış, ekili alanın üçte ikisi metrede yalnızca 25 mm yararlı su tutan kumlu Dior profilleri üzerindedir.' }
};

/* rainfall mm -> colour (dry ochre to wet green) */
function ramp(mm){
  var stops=[[150,'#8C3A1E'],[300,'#B4632A'],[450,'#D9A03C'],[600,'#C9BE55'],
             [800,'#8FB255'],[1000,'#4E9A55'],[1300,'#1F6B45']];
  if(mm<=stops[0][0]) return stops[0][1];
  for(var i=1;i<stops.length;i++){
    if(mm<=stops[i][0]){
      var a=stops[i-1], b=stops[i], f=(mm-a[0])/(b[0]-a[0]);
      return d3.interpolateRgb(a[1],b[1])(f);
    }
  }
  return stops[stops.length-1][1];
}

var INST=0;
function mount(el,lang){
  if(typeof d3==='undefined'||typeof topojson==='undefined') return;
  var v=UI[lang]||UI.en;
  var view='rain', month=null, timer=null;
  var uid='sm'+(++INST);
  var ID=function(k){ return uid+'-'+k; };

  el.innerHTML=
   '<div class="sm-head">'+
     '<div class="sm-tabs">'+v.tabs.map(function(t,i){
        return '<button class="sm-tab'+(i===0?' on':'')+'" data-v="'+(i?'zones':'rain')+'">'+t+'</button>';}).join('')+'</div>'+
     '<div class="sm-title" id="'+ID('title')+'">'+v.t1+'</div>'+
   '</div>'+
   '<div class="sm-stage"><canvas id="'+ID('heat')+'" class="sm-heat"></canvas><svg id="'+ID('svg')+'"></svg>'+
     '<div class="sm-tip" id="'+ID('tip')+'"><b></b><span></span></div></div>'+
   '<div class="sm-controls" id="'+ID('controls')+'">'+
     '<button class="sm-play" id="'+ID('play')+'">'+v.play+'</button>'+
     '<div class="sm-scrub"><input id="'+ID('month')+'" type="range" min="0" max="12" value="12" step="1">'+
       '<div class="sm-monthlbl fr-mono" id="'+ID('monthlbl')+'">'+v.annual+'</div></div>'+
     '<div class="sm-legend" id="'+ID('legend')+'"></div>'+
   '</div>'+
   '<p class="sm-note">'+v.note+'</p>'+
   '<p class="sm-src">'+v.src+'</p>';

  var svg=d3.select(el.querySelector('#'+ID('svg')));
  var heat=el.querySelector('#'+ID('heat'));
  var tip=el.querySelector('#'+ID('tip'));
  var stage=el.querySelector('.sm-stage');
  var gHeat=svg.append('g'), gOutline=svg.append('g'), gMarks=svg.append('g');
  var proj=d3.geoMercator(), path=d3.geoPath(proj);
  var sen=null, W=0,H=0;

  function legend(){
    var maxV = month===null?1300:Math.max(10, Math.round(1300*MONTH_F[month]));
    var lbl = month===null?v.legend:v.legendM;
    var steps=6, cells='';
    for(var i=0;i<steps;i++){
      var mm=(month===null?1300:maxV)*(i+0.5)/steps;
      var shown=Math.round(mm);
      cells+='<i style="background:'+ramp(month===null?mm:mm/Math.max(MONTH_F[month],0.0001)*1)+'" title="'+shown+' mm"></i>';
    }
    el.querySelector('#'+ID('legend')).innerHTML=
      '<span class="sm-leglbl fr-mono">'+lbl+'</span><div class="sm-ramp">'+cells+'</div>'+
      '<span class="sm-legmax fr-mono">0 – '+maxV+'</span>';
  }

  function idw(lng,lat){
    var num=0,den=0;
    for(var i=0;i<STATIONS.length;i++){
      var s=STATIONS[i];
      var dx=lng-s.lng, dy=lat-s.lat;
      var d2=dx*dx+dy*dy;
      if(d2<1e-6) return s.mm;
      var w=1/(d2*d2);
      num+=w*s.mm; den+=w;
    }
    return num/den;
  }

  function size(){
    var r=stage.getBoundingClientRect();
    if(!r.width||!r.height) return;
    W=r.width; H=r.height;
    svg.attr('viewBox','0 0 '+W+' '+H).attr('width',W).attr('height',H)
       .attr('preserveAspectRatio','xMidYMid meet');
    var dpr=Math.min(window.devicePixelRatio||1,2);
    heat.width=Math.round(W*dpr); heat.height=Math.round(H*dpr);
    heat.style.width=W+'px'; heat.style.height=H+'px';
    if(sen){ proj.fitExtent([[14,14],[W-14,H-14]],sen); render(); }
  }

  function render(){
    gHeat.selectAll('*').remove(); gOutline.selectAll('*').remove(); gMarks.selectAll('*').remove();
    if(!sen) return;

    var id='senclip-'+Math.random().toString(36).slice(2,8);
    var defs=gHeat.append('defs');
    defs.append('clipPath').attr('id',id).append('path').attr('d',path(sen));

    var ctx=heat.getContext('2d');
    var dpr=Math.min(window.devicePixelRatio||1,2);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    if(view==='rain'){
      /* one canvas pass, clipped to the true national outline */
      ctx.save();
      var cpath=d3.geoPath(proj,ctx);
      ctx.beginPath(); cpath(sen); ctx.clip();
      var step=5, b=path.bounds(sen);
      var op = month===null? 1 : Math.min(1, 0.18 + MONTH_F[month]*2.1);
      ctx.globalAlpha=op;
      for(var x=b[0][0];x<b[1][0];x+=step){
        for(var y=b[0][1];y<b[1][1];y+=step){
          var ll=proj.invert([x+step/2,y+step/2]);
          if(!ll) continue;
          var mm=idw(ll[0],ll[1]);
          ctx.fillStyle = month===null? ramp(mm) : ramp(MONTH_F[month]>0 ? mm : 120);
          ctx.fillRect(x,y,step+0.7,step+0.7);
        }
      }
      ctx.restore(); ctx.globalAlpha=1;
      gOutline.append('path').attr('d',path(sen)).attr('fill','none')
        .attr('stroke','rgba(255,255,255,0.55)').attr('stroke-width',1.1);
    } else {
      gHeat.append('path').attr('d',path(sen)).attr('fill','#15281B')
        .attr('stroke','rgba(255,255,255,0.5)').attr('stroke-width',1.1);
      ZONES.forEach(function(z,i){
        var p=proj([z.lng,z.lat]);
        var g=gMarks.append('g').attr('class','sm-zone').attr('transform','translate('+p[0]+','+p[1]+')');
        g.append('circle').attr('r',22).attr('fill','rgba(212,160,23,'+(0.10+i*0.03).toFixed(2)+')');
        g.append('circle').attr('r',4).attr('fill','#D4A017');
        g.append('text').attr('x',9).attr('y',-2).attr('class','sm-zlabel').text(z[lang]||z.en);
        g.append('text').attr('x',9).attr('y',11).attr('class','sm-zcrop').text(z['c'+lang]||z.cen);
      });
    }

    PLACES.forEach(function(pl){
      var p=proj([pl.lng,pl.lat]);
      var g=gMarks.append('g').attr('class','sm-place '+pl.kind).attr('transform','translate('+p[0]+','+p[1]+')');
      if(pl.kind==='trial'){
        g.append('circle').attr('r',13).attr('class','sm-trialhalo');
        g.append('circle').attr('r',5.5).attr('class','sm-trialdot');
        g.append('path').attr('d','M0,-3.2 L0,3.2 M-2.3,-2.3 L2.3,2.3 M-3.2,0 L3.2,0')
          .attr('stroke','#20170a').attr('stroke-width','1.2').attr('fill','none').attr('stroke-linecap','round');
        g.append('text').attr('x',11).attr('y',4).attr('class','sm-plabel trial').text(pl.n);
      } else if(pl.kind==='capital'){
        g.append('rect').attr('x',-3.4).attr('y',-3.4).attr('width',6.8).attr('height',6.8).attr('fill','#fff');
        g.append('text').attr('x',9).attr('y',4).attr('class','sm-plabel cap').text(pl.n);
      } else {
        g.append('circle').attr('r',2.4).attr('fill','rgba(255,255,255,.75)');
        g.append('text').attr('x',7).attr('y',3.5).attr('class','sm-plabel').text(pl.n);
      }
      g.on('mouseenter',function(ev){
        var st=STATIONS.filter(function(s){return s.n===pl.n;})[0];
        var mm=st?st.mm:Math.round(idw(pl.lng,pl.lat));
        var shown=month===null?mm+' mm':Math.round(mm*MONTH_F[month])+' mm';
        var r=stage.getBoundingClientRect();
        tip.querySelector('b').textContent=pl.n;
        tip.querySelector('span').textContent=(pl.kind==='trial'?v.trial+' · ':'')+shown;
        tip.style.left=(ev.clientX-r.left)+'px'; tip.style.top=(ev.clientY-r.top)+'px';
        tip.classList.add('show');
      }).on('mouseleave',function(){ tip.classList.remove('show'); });
    });
  }

  el.querySelectorAll('.sm-tab').forEach(function(b){
    b.addEventListener('click',function(){
      view=b.dataset.v;
      el.querySelectorAll('.sm-tab').forEach(function(x){ x.classList.toggle('on',x===b); });
      el.querySelector('#'+ID('title')).textContent = view==='rain'?v.t1:v.t2;
      el.querySelector('#'+ID('controls')).style.visibility = view==='rain'?'visible':'hidden';
      render();
    });
  });

  var slider=el.querySelector('#'+ID('month'));
  function setMonth(i){
    month = (i>=12)?null:i;
    el.querySelector('#'+ID('monthlbl')).textContent = month===null?v.annual:v.months[month];
    legend(); render();
  }
  slider.addEventListener('input',function(){ stop(); setMonth(+slider.value); });

  function stop(){ if(timer){ clearInterval(timer); timer=null; el.querySelector('#'+ID('play')).textContent=v.play; } }
  el.querySelector('#'+ID('play')).addEventListener('click',function(){
    if(timer){ stop(); return; }
    this.textContent=v.pause;
    var i=+slider.value>=12?0:+slider.value;
    timer=setInterval(function(){
      slider.value=i; setMonth(i);
      i++; if(i>11){ i=0; }
    },520);
  });

  window.addEventListener('resize',size);
  if(window.ResizeObserver) new ResizeObserver(size).observe(stage);

  legend(); size();
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json').then(function(topo){
    var fc=topojson.feature(topo,topo.objects.countries);
    sen=fc.features.filter(function(f){ return String(f.id)==='686'; })[0];
    size(); render();
  });
}

window.SenegalMap={ mount:mount };
})();

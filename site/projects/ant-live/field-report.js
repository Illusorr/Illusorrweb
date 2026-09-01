/* Field dossier renderers (not a report document — a scrolling data dossier).
   FieldReport.full(lang)      -> the Senegal dossier
   FieldReport.site(site,lang) -> a site record in the same vocabulary
   FieldReport.mountMaps(root,lang) -> attaches the interactive Senegal maps */
(function(){
"use strict";

function slot(id,ph,ratio){
  return '<div class="fr-slot" style="aspect-ratio:'+(ratio||'4/3')+'">'+
    '<image-slot id="'+id+'" shape="rect" placeholder="'+String(ph).replace(/"/g,'&quot;')+'"></image-slot></div>';
}
function statRow(items,cls){
  return '<div class="fr-stats '+(cls||'')+'">'+items.map(function(a){
    return '<div class="fr-stat"><b>'+a[0]+'</b><span>'+a[1]+'</span></div>';
  }).join('')+'</div>';
}
function band(n,label,name,lede,light){
  return '<div class="fr-band'+(light?' light':'')+'">'+
    '<span class="fr-mono fr-bandn">'+n+'</span>'+
    '<div><div class="fr-mono fr-bandlbl">'+label+'</div>'+
    '<h2 class="fr-bandname">'+name+'</h2>'+
    (lede?'<p class="fr-bandlede">'+lede+'</p>':'')+'</div></div>';
}
var CHAPTER={
  en:['Result','Verification','Method','Water context','Crop & country','Technology','What follows'],
  fr:['Résultat','Vérification','Méthode','Contexte hydrique','Culture et pays','Technologie','La suite'],
  tr:['Sonuç','Doğrulama','Yöntem','Su bağlamı','Ürün ve ülke','Teknoloji','Sonrası']
};
var DOSS={
  en:{ dossier:'FIELD DOSSIER', site:'Site', crop:'Crop & period', scale:'Scale', ref:'Reference',
    keyfig:'THE RESULT IN FOUR FIGURES', credits:'WHO DID THE WORK', mapLive:'INTERACTIVE',
    findings:'What the season established' },
  fr:{ dossier:'DOSSIER DE TERRAIN', site:'Site', crop:'Culture et période', scale:'Échelle', ref:'Référence',
    keyfig:'LE RÉSULTAT EN QUATRE CHIFFRES', credits:'QUI A FAIT LE TRAVAIL', mapLive:'INTERACTIF',
    findings:'Ce que la saison a établi' },
  tr:{ dossier:'SAHA DOSYASI', site:'Saha', crop:'Ürün ve dönem', scale:'Ölçek', ref:'Referans',
    keyfig:'SONUÇ, DÖRT RAKAMLA', credits:'İŞİ KİM YAPTI', mapLive:'ETKİLEŞİMLİ',
    findings:'Sezonun ortaya koyduğu' }
};

function full(lang){
  var rep=window.FIELD_REPORTS.senegal, t=rep[lang], u=t.ui, d=DOSS[lang], ch=CHAPTER[lang], H=[];

  /* ---- masthead: site identity, claim, four figures ---- */
  H.push('<section class="fr-mast"><div class="fr-wrap">'+
    '<div class="fr-mono fr-kicker">'+d.dossier+' · '+t.programme+' · '+t.meta[3][1]+'</div>'+
    '<h1 class="fr-mastclaim">'+t.claim+'</h1>'+
    '<p class="fr-mastsub">'+t.claimSub+'</p>'+
    '<div class="fr-mastmeta">'+t.meta.map(function(m){
      return '<div><div class="fr-mono fr-lbl">'+m[0]+'</div><b>'+m[1]+'</b><span>'+m[2]+'</span></div>';}).join('')+'</div>'+
    '<div class="fr-mastsplit">'+
      '<div class="fr-techbox"><div class="fr-mono fr-lbl gold">'+t.techLabel+'</div><p>'+t.techBody+'</p></div>'+
      '<div class="fr-masthero">'+slot('fr-mast-photo',u.photoPlaceholder,'16/10')+'</div>'+
    '</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+d.keyfig+'</div>'+
    '<div class="fr-four">'+t.four.map(function(f){
      return '<div class="fr-fourcell"><b>'+f[0]+'</b><div class="fr-mono fr-lbl">'+f[1]+'</div><p>'+f[2]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-coveractions"><a class="fr-btn" href="'+rep.pdfs[lang]+'" target="_blank" rel="noopener">'+u.download+'</a></div>'+
    '</div></section>');

  /* ---- 01 RESULT ---- */
  var s=t.s2, max=63;
  H.push('<section class="fr-sec"><div class="fr-wrap">'+
    band('01',ch[0],s.h,s.note)+
    '<div class="fr-resulthead">'+
      '<div class="fr-chart"><div class="fr-mono fr-lbl">'+s.chartLabel+'</div>'+
        s.pairs.map(function(p){
          return '<div class="fr-bargroup"><div class="fr-barlab"><b>'+p[0]+'</b><span>'+p[1]+'</span></div><div class="fr-bars">'+
            '<div class="fr-barline"><div class="fr-bar t" style="width:'+(p[2]/max*100)+'%"></div><i>'+p[2]+'</i></div>'+
            '<div class="fr-barline"><div class="fr-bar c" style="width:'+(p[3]/max*100)+'%"></div><i>'+p[3]+'</i></div>'+
            '</div><div class="fr-bardelta">'+p[4]+'</div></div>';}).join('')+
        '<div class="fr-legend"><span><i class="sw t"></i>'+s.legendT+'</span><span><i class="sw c"></i>'+s.legendC+'</span></div></div>'+
      '<div class="fr-hero"><b>'+s.hero+'</b><p>'+s.heroSub+'</p></div>'+
    '</div>'+
    statRow(s.stats,'four')+
    '<div class="fr-reads">'+s.reads.map(function(r){
      return '<div class="fr-read"><b>'+r[0]+'</b><p>'+r[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-twocol tight">'+
      '<div class="fr-arith"><div class="fr-mono fr-lbl gold">'+s.arithLabel+'</div>'+
        s.arith.map(function(a){return '<div class="fr-arithrow"><span>'+a[0]+'</span><b>'+a[1]+'</b></div>';}).join('')+'</div>'+
      '<div class="fr-callout gold"><b class="fr-margin">'+s.marginTitle+'</b><p>'+s.marginBody+'</p></div>'+
    '</div>'+
    '<h3 class="fr-h3 mt">'+s.multTitle+'</h3><p class="fr-body wide">'+s.multIntro+'</p>'+
    '<div class="fr-tablewrap"><table class="fr-table"><thead><tr><th></th><th>P1 / P4</th><th>P2 / P5</th><th>P3 / P6</th></tr></thead><tbody>'+
      s.tableRows.map(function(r){return '<tr><td class="k">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td></tr>';}).join('')+
      '</tbody></table></div>'+
    '</div></section>');

  /* ---- 02 VERIFICATION ---- */
  s=t.s3;
  H.push('<section class="fr-sec fr-dark"><div class="fr-wrap">'+
    band('02',ch[1],s.h,s.body,true)+
    '<div class="fr-pillars">'+s.pillars.map(function(p){
      return '<div class="fr-pillar"><b>'+p[0]+'</b><p>'+p[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+s.repLabel+'</div>'+
    '<div class="fr-timeline">'+s.reports.map(function(r){
      return '<div class="fr-tl"><div class="fr-tldate">'+r[0]+'</div><b>'+r[1]+'</b><p>'+r[2]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+s.imgLabel+'</div><p class="fr-cap light">'+s.imgCaption+'</p>'+
    s.panels.map(function(pn,pi){
      return '<div class="fr-panel"><h4 class="fr-panelh">'+pn[0]+'</h4><div class="fr-panelgrid">'+
        pn[1].map(function(o,oi){
          return '<figure class="fr-obs"><div class="fr-mono fr-obsdate">'+o[0]+'</div><div class="fr-obspair">'+
            '<div class="fr-obshalf"><span class="fr-mono">'+s.treated+'</span>'+slot('fr-sat-'+pi+'-'+oi+'-t',s.treated+' · '+o[0],'1/1')+'</div>'+
            '<div class="fr-obshalf"><span class="fr-mono">'+s.control+'</span>'+slot('fr-sat-'+pi+'-'+oi+'-c',s.control+' · '+o[0],'1/1')+'</div>'+
            '</div><figcaption>'+o[1]+'</figcaption></figure>';}).join('')+'</div></div>';}).join('')+
    statRow(s.scale,'two')+'</div></section>');

  /* ---- 03 METHOD ---- */
  s=t.s4;
  H.push('<section class="fr-sec fr-off"><div class="fr-wrap">'+
    band('03',ch[2],s.h,s.body)+
    '<div class="fr-treatments">'+s.treatments.map(function(x){
      return '<div class="fr-treat"><div class="fr-treatp">'+x[0]+'</div><b>'+x[1]+'</b>'+
        '<span class="fr-mono fr-vs">'+x[2]+'</span><p>'+x[3]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-twocol tight">'+s.hand.map(function(x){
      return '<div class="fr-callout"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-consts"><div class="fr-mono fr-lbl">'+s.constLabel+'</div>'+
      s.constants.map(function(c){return '<div class="fr-constrow"><span>'+c[0]+'</span><b>'+c[1]+'</b></div>';}).join('')+'</div>'+
    '<h3 class="fr-h3 mt">'+s.logTitle+'</h3><p class="fr-body wide">'+s.logIntro+'</p>'+
    '<div class="fr-tablewrap"><table class="fr-table log"><thead><tr>'+
      s.logHead.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+
      s.log.map(function(r){
        return '<tr class="'+(r[9]?'treated':'ctrl')+'">'+r.slice(0,9).map(function(c,i){
          return '<td'+(i===0?' class="p"':(i===8?' class="d"':''))+'>'+c+'</td>';}).join('')+'</tr>';}).join('')+
      '</tbody></table></div><p class="fr-cap">'+s.logNote+'</p>'+
    '<h3 class="fr-h3 mt">'+s.photoTitle+'</h3><p class="fr-body wide">'+s.photoIntro+'</p>'+
    '<div class="fr-photogrid">'+s.photos.map(function(p,i){
      return '<figure class="fr-photo">'+slot('fr-photo-'+i,p[1],'4/3')+
        '<figcaption><span class="fr-mono">'+p[0]+'</span>'+p[1]+'</figcaption></figure>';}).join('')+'</div></div></section>');

  /* ---- 04 WATER CONTEXT + LIVE MAP ---- */
  s=t.s1;
  H.push('<section class="fr-sec"><div class="fr-wrap">'+
    band('04',ch[3],s.h,s.body)+
    '<div class="fr-mapcard"><div class="fr-mono fr-lbl gold">'+d.mapLive+' · '+s.mapLabel+'</div>'+
      '<div class="fr-senmap" data-senmap="rain"></div></div>'+
    '<div class="fr-twocol">'+
      '<div><div class="fr-mono fr-lbl gold">'+s.worldLabel+'</div><div class="fr-figlist">'+
        s.world.map(function(w){return '<div class="fr-figrow"><b>'+w[0]+'</b><p>'+w[1]+'</p></div>';}).join('')+'</div></div>'+
      '<div><div class="fr-mono fr-lbl gold">'+s.senLabel+'</div><div class="fr-figlist">'+
        s.senegal.map(function(w){return '<div class="fr-figrow"><b>'+w[0]+'</b><p>'+w[1]+'</p></div>';}).join('')+'</div></div>'+
    '</div>'+
    '<div class="fr-zones">'+s.zones.map(function(z){
      return '<div class="fr-zone '+z[2]+'"><span class="fr-zdot"></span><div><b>'+z[0]+'</b><p>'+z[1]+'</p></div></div>';}).join('')+'</div>'+
    '<div class="fr-twocol tight">'+
      '<div class="fr-callout"><div class="fr-mono fr-lbl">'+s.lossLabel+'</div><p>'+s.loss+'</p></div>'+
      '<div class="fr-callout gold"><div class="fr-mono fr-lbl">'+s.holdLabel+'</div><p>'+s.hold+'</p></div></div>'+
    statRow(s.climate,'four')+'</div></section>');

  /* ---- 05 CROP & COUNTRY ---- */
  s=t.s5;
  H.push('<section class="fr-sec fr-off"><div class="fr-wrap">'+
    band('05',ch[4],s.h,s.body)+
    '<div class="fr-silage">'+s.silage.map(function(x){
      return '<div class="fr-silcard"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-twocol tight">'+
      '<div class="fr-callout"><div class="fr-mono fr-lbl">'+s.whyLabel+'</div><p>'+s.why+'</p></div>'+
      '<div class="fr-callout gold"><div class="fr-mono fr-lbl">'+s.windowLabel+'</div><p>'+s.windowBody+'</p></div></div>'+
    '<h3 class="fr-h3 mt">'+s.rootTitle+'</h3>'+
    '<div class="fr-rootwrap"><div class="fr-root"><div class="fr-bandmark"><span class="fr-mono">'+s.band+'</span></div>'+
      s.rootLayers.map(function(l,i){
        return '<div class="fr-layer l'+i+'"><b class="fr-mono">'+l[0]+'</b><p>'+l[1]+'</p></div>';}).join('')+
      '</div><p class="fr-body">'+s.rootNote+'</p></div>'+
    '<div class="fr-stages">'+s.stages.map(function(st,i){
      return '<div class="fr-stage'+(i===2?' peak':'')+'"><b>'+st[0]+'</b><span>'+st[1]+'</span></div>';}).join('')+'</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+s.specLabel+'</div>'+
    '<div class="fr-specs">'+s.specs.map(function(sp){
      return '<div class="fr-specrow"><span class="k">'+sp[0]+'</span><b>'+sp[1]+'</b><span class="n">'+sp[2]+'</span></div>';}).join('')+'</div>'+
    '<h3 class="fr-h3 mt">'+s.econTitle+'</h3><p class="fr-body wide">'+s.econIntro+'</p>'+
    statRow(s.herd,'four')+
    '<div class="fr-mono fr-lbl gold mt">'+s.chainLabel+'</div>'+
    '<div class="fr-chain">'+s.chain.map(function(c,i){
      return '<div class="fr-chainstep"><b>'+c[0]+'</b><p>'+c[1]+'</p></div>'+
        (i<s.chain.length-1?'<div class="fr-chainarrow">→</div>':'');}).join('')+'</div>'+
    '<div class="fr-econ">'+s.econ.map(function(x){
      return '<div class="fr-econcard"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>';}).join('')+'</div>'+
    '<h3 class="fr-h3 mt">'+s.zonesTitle+'</h3><p class="fr-body wide">'+s.zonesIntro+'</p>'+
    '<div class="fr-mapcard"><div class="fr-senmap" data-senmap="zones"></div></div>'+
    statRow(s.zoneStats,'four')+
    '<div class="fr-mono fr-lbl gold mt">'+s.progLabel+'</div>'+
    '<div class="fr-prog">'+s.prog.map(function(p){
      return '<div class="fr-progrow"><b>'+p[0]+'</b><span class="c">'+p[1]+'</span><p>'+p[2]+'</p></div>';}).join('')+'</div>'+
    '</div></section>');

  /* ---- 06 TECHNOLOGY ---- */
  s=t.s6;
  H.push('<section class="fr-sec fr-dark"><div class="fr-wrap">'+
    band('06',ch[5],s.h,s.body,true)+
    '<div class="fr-motto">'+s.motto+'</div>'+
    '<div class="fr-vm">'+s.vm.map(function(v){
      return '<div class="fr-vmcard"><div class="fr-mono fr-lbl gold">'+v[0]+'</div><p>'+v[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-mech">'+s.mech.map(function(m){
      return '<div class="fr-mechcard"><b>'+m[0]+'</b><p>'+m[1]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+s.capLabel+'</div>'+statRow(s.cap,'four')+'</div></section>');

  /* ---- 07 WHAT FOLLOWS ---- */
  s=t.s7;
  H.push('<section class="fr-sec"><div class="fr-wrap">'+
    band('07',ch[6],d.findings,'')+
    '<ol class="fr-findings">'+s.findings.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ol>'+
    '<div class="fr-twocol">'+
      '<div><div class="fr-mono fr-lbl gold">'+s.limitsLabel+'</div>'+
        '<ul class="fr-limits">'+s.limits.map(function(l){return '<li>'+l+'</li>';}).join('')+'</ul></div>'+
      '<div><div class="fr-mono fr-lbl gold">'+s.attLabel+'</div>'+
        '<p class="fr-body">'+s.att+'</p><div class="fr-mono fr-ref">'+s.ref+'</div></div>'+
    '</div>'+
    '<div class="fr-mono fr-lbl gold mt">'+s.recLabel+'</div>'+
    '<div class="fr-recs">'+s.recs.map(function(r){
      return '<div class="fr-rec"><span class="fr-mono fr-recn">'+r[0]+'</span><b>'+r[1]+'</b><p>'+r[2]+'</p></div>';}).join('')+'</div>'+
    '<div class="fr-africa"><div class="fr-mono fr-lbl gold">'+s.africaLabel+'</div><p>'+s.africa+'</p></div>'+
    '<div class="fr-mono fr-lbl gold mt">'+d.credits+'</div>'+
    '<div class="fr-signs">'+t.signatories.map(function(sg){
      return '<div class="fr-sign"><div class="fr-mono fr-lbl">'+sg[0]+'</div><b>'+sg[1]+'</b><span>'+sg[2]+'</span></div>';}).join('')+'</div>'+
    '<div class="fr-coveractions"><a class="fr-btn" href="'+rep.pdfs[lang]+'" target="_blank" rel="noopener">'+u.download+'</a></div>'+
    '</div></section>');

  return H.join('');
}

var SITE_UI={
  en:{ record:'FIELD RECORD', at:'Site record', partner:'Partner', country:'Country', region:'Region',
    crop:'Crop', irrigation:'Irrigation system', scale:'Scale', products:'Products applied', season:'Season', status:'Status',
    coords:'Coordinates', prep:'A full field dossier for this site is in preparation. The record below follows the same framework as the published Senegal dossier.',
    photos:'The season in photographs', photoIntro:'Drop the field photographs for this site into the frames below.',
    photoPlaceholder:'Drop the field photograph here',
    frameworkLabel:'THE FRAMEWORK APPLIED AT EVERY SITE',
    framework:[['01','Paired treatment and control','Every NANOTERN application is matched to an adjacent control parcel under the farm\u2019s own practice, so the effect of the technology can be read directly.'],['02','A deliberate input handicap','Treated parcels carry reduced fertilizer and reduced irrigation events, so any gain is achieved against a handicap rather than under equal inputs.'],['03','Independent monitoring','Satellite imagery and in-field sensors track crop condition through the full cycle, archived before the harvest result is known.'],['04','The farm keeps the record','The primary field log is kept parcel by parcel by the operator and reproduced without adjustment.']],
    seeFull:'Open the Senegal dossier →' },
  fr:{ record:'RELEVÉ DE TERRAIN', at:'Fiche de site', partner:'Partenaire', country:'Pays', region:'Région',
    crop:'Culture', irrigation:'Système d’irrigation', scale:'Échelle', products:'Produits appliqués', season:'Saison', status:'Statut',
    coords:'Coordonnées', prep:'Un dossier de terrain complet pour ce site est en préparation. La fiche ci-dessous suit le même cadre que le dossier Sénégal publié.',
    photos:'La saison en photographies', photoIntro:'Déposez les photographies de terrain de ce site dans les cadres ci-dessous.',
    photoPlaceholder:'Déposez la photographie de terrain ici',
    frameworkLabel:'LE CADRE APPLIQUÉ SUR CHAQUE SITE',
    framework:[['01','Traitement apparié et témoin','Chaque application NANOTERN est appariée à une parcelle témoin adjacente conduite selon la pratique de la ferme, afin de lire directement l’effet de la technologie.'],['02','Un handicap d’intrants délibéré','Les parcelles traitées reçoivent moins d’engrais et moins de tours d’eau : tout gain est obtenu contre un handicap et non à intrants égaux.'],['03','Suivi indépendant','Imagerie satellitaire et capteurs de terrain suivent l’état de la culture sur tout le cycle, archivés avant que le résultat de récolte ne soit connu.'],['04','La ferme tient le relevé','Le journal de champ primaire est tenu parcelle par parcelle par l’opérateur et reproduit sans ajustement.']],
    seeFull:'Ouvrir le dossier Sénégal →' },
  tr:{ record:'SAHA KAYDI', at:'Saha kaydı', partner:'Ortak', country:'Ülke', region:'Bölge',
    crop:'Ürün', irrigation:'Sulama sistemi', scale:'Ölçek', products:'Uygulanan ürünler', season:'Sezon', status:'Durum',
    coords:'Koordinatlar', prep:'Bu saha için tam bir saha dosyası hazırlanıyor. Aşağıdaki kayıt, yayımlanan Senegal dosyasıyla aynı çerçeveyi izler.',
    photos:'Fotoğraflarla sezon', photoIntro:'Bu sahaya ait saha fotoğraflarını aşağıdaki çerçevelere bırakın.',
    photoPlaceholder:'Saha fotoğrafını buraya bırakın',
    frameworkLabel:'HER SAHADA UYGULANAN ÇERÇEVE',
    framework:[['01','Eşleştirilmiş uygulama ve kontrol','Her NANOTERN uygulaması, çiftliğin kendi pratiğiyle yönetilen bitişik bir kontrol parseliyle eşleştirilir; böylece teknolojinin etkisi doğrudan okunur.'],['02','Bilinçli girdi handikabı','Uygulamalı parseller daha az gübre ve daha az sulama alır; dolayısıyla her kazanım eşit girdiyle değil, bir handikaba karşı elde edilir.'],['03','Bağımsız izleme','Uydu görüntüleri ve saha sensörleri bitki kondisyonunu tüm döngü boyunca izler; hasat sonucu bilinmeden arşivlenir.'],['04','Kaydı çiftlik tutar','Birincil saha günlüğü, uygulayıcı tarafından parsel parsel tutulur ve düzeltme yapılmaksızın aktarılır.']],
    seeFull:'Senegal dosyasını aç →' }
};

function site(st,lang){
  var v=SITE_UI[lang], d=DOSS[lang], H=[];
  var coords=Math.abs(st.lat).toFixed(3)+'°'+(st.lat>=0?'N':'S')+' '+Math.abs(st.lng).toFixed(3)+'°'+(st.lng>=0?'E':'W');
  var rows=[[v.partner,st.partner],[v.country,st.country[lang]],[v.region,st.region],
    [v.crop,st.crop[lang]],[v.irrigation,st.irrigation[lang]],[v.scale,st.scale[lang]],
    [v.season,st.season],[v.status,st.status[lang]],[v.coords,coords]];

  H.push('<section class="fr-mast"><div class="fr-wrap">'+
    '<div class="fr-mono fr-kicker">'+v.record+' · NANOTERN™</div>'+
    '<h1 class="fr-mastclaim">'+st.headline[lang]+'</h1>'+
    '<p class="fr-mastsub">'+st.name+' · '+st.region+' · '+st.country[lang]+'</p>'+
    '<div class="fr-mastmeta">'+rows.slice(3,7).map(function(r){
      return '<div><div class="fr-mono fr-lbl">'+r[0]+'</div><b>'+r[1]+'</b></div>';}).join('')+'</div>'+
    '<div class="fr-techbox"><div class="fr-mono fr-lbl gold">'+v.products+'</div>'+
      '<p>'+st.products.map(function(p){return '<b>'+p+'</b>';}).join(' · ')+'</p></div>'+
    '<p class="fr-submission">'+v.prep+'</p></div></section>');

  H.push('<section class="fr-sec fr-off"><div class="fr-wrap">'+
    '<div class="fr-mono fr-lbl gold">'+v.at+'</div>'+
    '<div class="fr-specs" style="margin-top:20px">'+rows.map(function(r){
      return '<div class="fr-specrow"><span class="k">'+r[0]+'</span><b>'+r[1]+'</b><span class="n"></span></div>';}).join('')+'</div>'+
    '</div></section>');

  H.push('<section class="fr-sec fr-dark"><div class="fr-wrap">'+
    '<div class="fr-mono fr-lbl gold">'+v.frameworkLabel+'</div>'+
    '<div class="fr-recs" style="margin-top:20px">'+v.framework.map(function(f){
      return '<div class="fr-rec" style="background:#0B0E0C"><span class="fr-mono fr-recn">'+f[0]+'</span>'+
        '<b style="color:#fff">'+f[1]+'</b><p style="color:rgba(255,255,255,.6)">'+f[2]+'</p></div>';}).join('')+'</div>'+
    '</div></section>');

  H.push('<section class="fr-sec"><div class="fr-wrap">'+
    '<h3 class="fr-h3">'+v.photos+'</h3><p class="fr-body wide">'+v.photoIntro+'</p>'+
    '<div class="fr-photogrid">'+[0,1,2,3].map(function(i){
      return '<figure class="fr-photo">'+slot('fr-site-'+st.id+'-'+i,v.photoPlaceholder,'4/3')+'</figure>';}).join('')+'</div>'+
    '<div class="fr-coveractions"><a class="fr-btn" href="#" data-open-report="senegal">'+v.seeFull+'</a></div>'+
    '</div></section>');

  return H.join('');
}

function mountMaps(root,lang){
  if(!window.SenegalMap) return;
  root.querySelectorAll('.fr-senmap').forEach(function(el){
    window.SenegalMap.mount(el,lang);
    if(el.dataset.senmap==='zones'){
      var tab=el.querySelector('.sm-tab[data-v="zones"]');
      if(tab) tab.click();
    }
  });
}

window.FieldReport={ full:full, site:site, mountMaps:mountMaps, siteUI:SITE_UI };
})();

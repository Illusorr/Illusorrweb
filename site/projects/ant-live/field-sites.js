/* Field sites plotted on the FIELD map. Coordinates are real [lng, lat].
   `report:'senegal'` links a site to a full official report in FIELD_REPORTS. */
window.FIELD_SITES = [
  {
    id:'senegal-tassette', report:'senegal', flagship:true,
    name:'Tassette Demonstration Farm', partner:'Ministry of Agriculture · B2G',
    country:{en:'Senegal',fr:'Sénégal',tr:'Senegal'}, region:'Thiès Region',
    lng:-16.8833, lat:14.7833, iso:'SEN',
    crop:{en:'Silage maize',fr:'Maïs ensilage',tr:'Silajlık mısır'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'6 parcels · 6 hectares',fr:'6 parcelles · 6 hectares',tr:'6 parsel · 6 hektar'},
    products:['NANOTERN Agriculture','NANOTERN Aqua'],
    season:'2026',
    status:{en:'Official report published',fr:'Rapport officiel publié',tr:'Resmi rapor yayımlandı'},
    headline:{en:'+40% peak yield on half the inputs',fr:'+40 % de rendement maximal avec moitié moins d’intrants',tr:'Girdilerin yarısıyla +%40 en yüksek verim'}
  },
  {
    id:'turkiye-tagem', name:'TAGEM · Thrace Research Institutes', partner:'General Directorate of Agricultural Research and Policies',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Trakya · Yalova · Yozgat',
    lng:27.5117, lat:40.9781, iso:'TUR',
    crop:{en:'Wheat · sunflower · sugar beet',fr:'Blé · tournesol · betterave sucrière',tr:'Buğday · ayçiçeği · şeker pancarı'},
    irrigation:{en:'Open field',fr:'Plein champ',tr:'Açık tarla'},
    scale:{en:'3 institutes · 14-month controlled trial',fr:'3 instituts · essai contrôlé de 14 mois',tr:'3 enstitü · 14 aylık kontrollü deneme'},
    products:['NANOTERN Agriculture'], season:'2026–27',
    status:{en:'Trial ongoing',fr:'Essai en cours',tr:'Deneme sürüyor'},
    headline:{en:'Institutional dual-crop validation under ministry oversight',fr:'Validation institutionnelle bi-culture sous supervision ministérielle',tr:'Bakanlık gözetiminde kurumsal çift ürün doğrulaması'}
  },
  {
    id:'turkiye-natura', name:'Natura Tarım', partner:'Advanced Technology Field Partner',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Manisa',
    lng:27.4289, lat:38.6191, iso:'TUR',
    crop:{en:'Cherry orchards',fr:'Vergers de cerisiers',tr:'Kiraz bahçeleri'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'600 decares · 3,400 trees + 1,500 saplings',fr:'600 décares · 3 400 arbres + 1 500 plants',tr:'600 dekar · 3.400 ağaç + 1.500 fidan'},
    products:['NANOTERN Agriculture','NANOTERN Aqua'], season:'2026',
    status:{en:'Monitored under field protocol',fr:'Suivi sous protocole de terrain',tr:'Saha protokolü altında izleniyor'},
    headline:{en:'Regenerative orchard programme, parcel-level irrigation control',fr:'Programme de vergers régénératifs, contrôle d’irrigation à la parcelle',tr:'Rejeneratif bahçe programı, parsel düzeyinde sulama kontrolü'}
  },
  {
    id:'turkiye-manisa-coop', name:'East Manisa Walnut & Almond Cooperative', partner:'S.S. Doğu Manisa Kooperatifi',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Manisa',
    lng:28.05, lat:38.65, iso:'TUR',
    crop:{en:'Walnut · almond',fr:'Noyer · amandier',tr:'Ceviz · badem'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'5,000 trees · 150 g per tree',fr:'5 000 arbres · 150 g par arbre',tr:'5.000 ağaç · ağaç başına 150 g'},
    products:['NANOTERN Agriculture'], season:'2025',
    status:{en:'Completed',fr:'Terminé',tr:'Tamamlandı'},
    headline:{en:'+30% average yield across 5,000 trees, practices unchanged',fr:'+30 % de rendement moyen sur 5 000 arbres, pratiques inchangées',tr:'5.000 ağaçta ortalama +%30 verim, uygulamalar değişmeden'}
  },
  {
    id:'turkiye-balsu', name:'Balsu · Hazelnut Orchards', partner:'Crop-Specific Industrial Producer',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Sakarya · Düzce',
    lng:30.3783, lat:40.7569, iso:'TUR',
    crop:{en:'Hazelnut',fr:'Noisette',tr:'Fındık'},
    irrigation:{en:'Rainfed',fr:'Pluvial',tr:'Yağışa bağlı'},
    scale:{en:'Commercial hazelnut orchards',fr:'Vergers de noisetiers commerciaux',tr:'Ticari fındık bahçeleri'},
    products:['NANOTERN Agriculture'], season:'2025',
    status:{en:'Completed',fr:'Terminé',tr:'Tamamlandı'},
    headline:{en:'+27.8% oil quality improvement with better vegetative growth',fr:'+27,8 % d’amélioration de la qualité de l’huile, meilleure croissance végétative',tr:'Yağ kalitesinde +%27,8 iyileşme, daha iyi vejetatif gelişim'}
  },
  {
    id:'turkiye-mus', name:'Tiryaki Agro · Muş', partner:'Crop-Specific Industrial Producer',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Muş',
    lng:41.7539, lat:38.9462, iso:'TUR',
    crop:{en:'Sunflower · lentil',fr:'Tournesol · lentille',tr:'Ayçiçeği · mercimek'},
    irrigation:{en:'Rainfed',fr:'Pluvial',tr:'Yağışa bağlı'},
    scale:{en:'Drone broadcast and row-band placement',fr:'Épandage par drone et placement en bande',tr:'Drone ile serpme ve sıra bandına yerleştirme'},
    products:['NANOTERN Agriculture'], season:'2025',
    status:{en:'Completed',fr:'Terminé',tr:'Tamamlandı'},
    headline:{en:'+9% yield in a severe drought season with no supplemental irrigation',fr:'+9 % de rendement en saison de sécheresse sévère, sans irrigation d’appoint',tr:'Ek sulama olmadan şiddetli kuraklık sezonunda +%9 verim'}
  },
  {
    id:'turkiye-barbare', name:'Barbare Vineyards', partner:'Crop-Specific Industrial Producer',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Tekirdağ',
    lng:27.51, lat:41.0011, iso:'TUR',
    crop:{en:'Wine grapes (Grenache)',fr:'Raisin de cuve (Grenache)',tr:'Şaraplık üzüm (Grenache)'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'Root-zone placement at 20–30 cm, multi-depth tensiometers',fr:'Placement racinaire à 20–30 cm, tensiomètres multi-profondeurs',tr:'20–30 cm kök bölgesine yerleştirme, çok derinlikli tansiyometre'},
    products:['NANOTERN Agriculture'], season:'2026',
    status:{en:'Trial ongoing',fr:'Essai en cours',tr:'Deneme sürüyor'},
    headline:{en:'Extended root-zone moisture between irrigation cycles',fr:'Humidité racinaire prolongée entre les cycles d’irrigation',tr:'Sulama döngüleri arasında uzayan kök bölgesi nemi'}
  },
  {
    id:'turkiye-smyrna', name:'Smyrna Greenhouse', partner:'Akça Holding · Advanced Technology Field Partner',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Denizli',
    lng:29.0864, lat:37.7765, iso:'TUR',
    crop:{en:'Greenhouse tomato',fr:'Tomate sous serre',tr:'Serada domates'},
    irrigation:{en:'Drip · cocopeat substrate',fr:'Goutte-à-goutte · substrat cocopeat',tr:'Damla · hindistan cevizi torfu'},
    scale:{en:'2 greenhouses · 560 slabs',fr:'2 serres · 560 pains',tr:'2 sera · 560 slab'},
    products:['NANOTERN Bio+ Agriculture','NANOTERN Aqua'], season:'2026',
    status:{en:'Monitored under field protocol',fr:'Suivi sous protocole de terrain',tr:'Saha protokolü altında izleniyor'},
    headline:{en:'Stabilised EC and pH in cocopeat; +40% secondary root formation',fr:'CE et pH stabilisés en cocopeat ; +40 % de racines secondaires',tr:'Kokopitte kararlı EC ve pH; +%40 ikincil kök oluşumu'}
  },
  {
    id:'turkiye-gebze', name:'Gebze Technical University', partner:'TÜBİTAK-supported R&D collaboration',
    country:{en:'Türkiye',fr:'Türkiye',tr:'Türkiye'}, region:'Kocaeli',
    lng:29.4307, lat:40.8028, iso:'TUR',
    crop:{en:'Wheat · maize · pepper',fr:'Blé · maïs · poivron',tr:'Buğday · mısır · biber'},
    irrigation:{en:'Rainfed',fr:'Pluvial',tr:'Yağışa bağlı'},
    scale:{en:'TÜBİTAK project framework',fr:'Cadre de projet TÜBİTAK',tr:'TÜBİTAK proje çerçevesi'},
    products:['NANOTERN Nutri'], season:'2026',
    status:{en:'Field phase newly initiated',fr:'Phase de terrain récemment lancée',tr:'Saha aşaması yeni başladı'},
    headline:{en:'Nitrogen-use efficiency and salt tolerance under academic protocol',fr:'Efficience azotée et tolérance au sel sous protocole académique',tr:'Akademik protokolde azot verimliliği ve tuz toleransı'}
  },
  {
    id:'peru-ica', name:'Campos del Sur', partner:'Crop-Specific Industrial Producer',
    country:{en:'Peru',fr:'Pérou',tr:'Peru'}, region:'ICA',
    lng:-75.7286, lat:-14.0678, iso:'PER',
    crop:{en:'Table grapes',fr:'Raisin de table',tr:'Sofralık üzüm'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'Commercial vineyard systems',fr:'Systèmes viticoles commerciaux',tr:'Ticari bağ sistemleri'},
    products:['NANOTERN Agriculture'], season:'2025',
    status:{en:'Completed',fr:'Terminé',tr:'Tamamlandı'},
    headline:{en:'40% less irrigation water with no yield loss',fr:'40 % d’eau d’irrigation en moins sans perte de rendement',tr:'Verim kaybı olmadan %40 daha az sulama suyu'}
  },
  {
    id:'chile-balsu', name:'Balsu Agrochile', partner:'Crop-Specific Industrial Producer',
    country:{en:'Chile',fr:'Chili',tr:'Şili'}, region:'Maule',
    lng:-71.6554, lat:-35.4264, iso:'CHL',
    crop:{en:'Hazelnut',fr:'Noisette',tr:'Fındık'},
    irrigation:{en:'Drip irrigation',fr:'Irrigation goutte-à-goutte',tr:'Damla sulama'},
    scale:{en:'Southern Hemisphere cultivation systems',fr:'Systèmes de culture de l’hémisphère sud',tr:'Güney Yarımküre yetiştirme sistemleri'},
    products:['NANOTERN Aqua'], season:'2026',
    status:{en:'Trial ongoing',fr:'Essai en cours',tr:'Deneme sürüyor'},
    headline:{en:'Cross-seasonal validation alongside Türkiye operations',fr:'Validation intersaisonnière parallèle aux opérations en Türkiye',tr:'Türkiye operasyonlarıyla mevsimler arası doğrulama'}
  },
  {
    id:'uae-silal', name:'SILAL', partner:'B2G Agricultural Partner',
    country:{en:'United Arab Emirates',fr:'Émirats arabes unis',tr:'Birleşik Arap Emirlikleri'}, region:'Abu Dhabi · Al-Ain · Sharjah',
    lng:54.3773, lat:24.4539, iso:'ARE',
    crop:{en:'Greenhouse, multiple crop categories',fr:'Serre, catégories de cultures multiples',tr:'Sera, çoklu ürün kategorisi'},
    irrigation:{en:'Smart irrigation · controlled environment',fr:'Irrigation intelligente · milieu contrôlé',tr:'Akıllı sulama · kontrollü ortam'},
    scale:{en:'2 greenhouses',fr:'2 serres',tr:'2 sera'},
    products:['NANOTERN Agriculture'], season:'2026',
    status:{en:'Lab validated · field phase in progress',fr:'Validé en laboratoire · phase de terrain en cours',tr:'Laboratuvarda doğrulandı · saha aşaması sürüyor'},
    headline:{en:'Desert agriculture gateway to the GCC region',fr:'Porte d’entrée de l’agriculture désertique vers le CCG',tr:'Çöl tarımında GCC bölgesine geçiş kapısı'}
  },
  {
    id:'italy-ausonia', name:'Azienda Agricola Ausonia', partner:'EIT Test Farms programme',
    country:{en:'Italy',fr:'Italie',tr:'İtalya'}, region:'Abruzzo · Atri',
    lng:13.9814, lat:42.5793, iso:'ITA',
    crop:{en:'Montepulciano wine grapes',fr:'Raisin de cuve Montepulciano',tr:'Montepulciano şaraplık üzüm'},
    irrigation:{en:'Open field',fr:'Plein champ',tr:'Açık tarla'},
    scale:{en:'Montepulciano vineyards',fr:'Vignobles de Montepulciano',tr:'Montepulciano bağları'},
    products:['NANOTERN Bio+ Agriculture'], season:'2026',
    status:{en:'Trial ongoing',fr:'Essai en cours',tr:'Deneme sürüyor'},
    headline:{en:'Selected for validation under a European innovation framework',fr:'Sélectionné pour validation dans un cadre européen d’innovation',tr:'Avrupa inovasyon çerçevesinde doğrulama için seçildi'}
  },
  {
    id:'iraq-tiryaki', name:'Tiryaki Agro Iraq', partner:'Crop-Specific Industrial Producer',
    country:{en:'Iraq',fr:'Irak',tr:'Irak'}, region:'Erbil',
    lng:44.0091, lat:36.1901, iso:'IRQ',
    crop:{en:'Wheat · lentil · pistachio',fr:'Blé · lentille · pistache',tr:'Buğday · mercimek · antep fıstığı'},
    irrigation:{en:'Rainfed',fr:'Pluvial',tr:'Yağışa bağlı'},
    scale:{en:'2026 deployment target',fr:'Objectif de déploiement 2026',tr:'2026 yayılım hedefi'},
    products:['NANOTERN Agriculture'], season:'2026',
    status:{en:'Deployment pipeline',fr:'Déploiement planifié',tr:'Yayılım hattında'},
    headline:{en:'Expansion under extreme heat and water scarcity',fr:'Extension sous chaleur extrême et rareté de l’eau',tr:'Aşırı sıcak ve su kıtlığı altında yayılım'}
  },
  {
    id:'usa-california', name:'California Dairies · Silage Maize', partner:'Crop-Specific Industrial Producer',
    country:{en:'United States',fr:'États-Unis',tr:'Amerika Birleşik Devletleri'}, region:'Central Valley, California',
    lng:-119.2921, lat:36.3302, iso:'USA',
    crop:{en:'Silage maize',fr:'Maïs ensilage',tr:'Silajlık mısır'},
    irrigation:{en:'Open field',fr:'Plein champ',tr:'Açık tarla'},
    scale:{en:'300 hectares',fr:'300 hectares',tr:'300 hektar'},
    products:['NANOTERN Agriculture'], season:'2026',
    status:{en:'Deployment pipeline',fr:'Déploiement planifié',tr:'Yayılım hattında'},
    headline:{en:'Feed production under chronic water scarcity and strict regulation',fr:'Production fourragère sous rareté chronique et réglementation stricte',tr:'Kronik su kıtlığı ve sıkı mevzuat altında yem üretimi'}
  },
  {
    id:'netherlands-okplant', name:'OK Plant · Orchid Production', partner:'Crop-Specific Industrial Producer',
    country:{en:'Netherlands',fr:'Pays-Bas',tr:'Hollanda'}, region:'Den Haag',
    lng:4.3007, lat:52.0705, iso:'NLD',
    crop:{en:'Orchid cultivation',fr:'Culture d’orchidées',tr:'Orkide üretimi'},
    irrigation:{en:'Fertigation · soilless substrate',fr:'Fertigation · substrat hors-sol',tr:'Fertigasyon · topraksız substrat'},
    scale:{en:'Fully controlled greenhouse environment',fr:'Serre entièrement contrôlée',tr:'Tam kontrollü sera ortamı'},
    products:['NANOTERN Agriculture'], season:'2026',
    status:{en:'Deployment pipeline',fr:'Déploiement planifié',tr:'Yayılım hattında'},
    headline:{en:'The most demanding precision-horticulture validation environment',fr:'L’environnement de validation horticole le plus exigeant',tr:'En zorlu hassas bahçecilik doğrulama ortamı'}
  }
];

/* ANT Systems — Nanotern Global Field Network globe (embedded in #page-field) */
const FIELD_DATA = {
  "meta": {
    "network_counters": {
      "continents": 4,
      "countries": 8,
      "trees_monitored": "14.500",
      "hectares_to_be_monitored": "200+"
    },
    "tiers": [
      { "id": "b2g", "label": "B2G Agricultural Partners" },
      { "id": "atfp", "label": "Advanced Technology Field Partners" },
      { "id": "csip", "label": "Crop-Specific Industrial Producers" }
    ]
  },
  "fields": [
    {
      "id": "silal-uae", "tier": "b2g", "name": "SILAL", "subtitle": "B2G Agricultural Partner",
      "country": "United Arab Emirates", "location_label": "Abu Dhabi / Al-Ain / Sharjah, UAE",
      "lat": 24.4539, "lng": 54.3773, "scale": "2 Greenhouses",
      "crop": "Multiple crop categories (greenhouse and open field)",
      "irrigation": "Smart irrigation / controlled environment",
      "application": "Lab validation completed; field application scheduled",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "In Progress",
      "results": null,
      "description": "SILAL is a government-backed agri-food platform established to strengthen the United Arab Emirates' food security strategy, with a strong focus on increasing domestic production capacity, optimizing resource use, and enabling sustainable agriculture in arid environments. Operating across large-scale greenhouse systems, open-field production, and integrated supply chains, SILAL manages and supports agricultural activities at a national scale, making it a key gateway for advanced agricultural technologies entering the GCC region.\nWithin this context, Nanotern has progressed through a structured engagement pathway with SILAL. Initial sample shipments have been completed, followed by laboratory validation under controlled conditions. Based on these results, the product has advanced into greenhouse applications, where it is currently being evaluated under operational settings. A Non-Disclosure Agreement has been signed, and discussions are ongoing regarding the framework for broader deployment.\nSILAL currently supports and collaborates with more than 850 farms across Abu Dhabi, sourcing over 30,000 tons of fresh produce annually while continuously expanding greenhouse and AgTech infrastructure. For ANT Systems, this creates a highly valuable real-world deployment environment where Nanotern can be evaluated across multiple crop categories and irrigation systems under desert agriculture conditions, and a potential large-scale gateway for expanding throughout the GCC region.",
      "figure": "Figure 11. SILAL UAE initial meeting"
    },
    {
      "id": "tagem-tr", "tier": "b2g", "name": "TAGEM",
      "subtitle": "General Directorate of Agricultural Research and Policies, Türkiye",
      "country": "Türkiye", "location_label": "Trakya / Yalova / Yozgat, Türkiye",
      "lat": 40.9781, "lng": 27.5117, "scale": "3 Institutes", "crop": "Wheat / Sunflower / Sugar beet",
      "irrigation": "Open field", "application": "Structured 14-month controlled field trial, dual-crop design",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing", "results": null,
      "description": "TAGEM, the General Directorate of Agricultural Research and Policies under the Ministry of Agriculture and Forestry, represents one of Türkiye's primary research bodies for agricultural innovation. Nanotern is currently under evaluation within structured research frameworks aimed at assessing its performance across different crops and soil conditions.\nA structured field trial has been initiated in the Thrace region, one of Türkiye's most important agricultural zones. The trial is designed as a long-term, controlled evaluation over a 14-month period, ensuring that both seasonal variability and cumulative soil effects are captured. The study includes two different crop systems, selected to represent distinct root structures and water-use behaviors.\nThe measurement framework includes:\n• Soil moisture dynamics at different depths\n• Water retention and irrigation efficiency\n• Plant development parameters (vegetative growth, root development)\n• Yield and quality metrics\n• Soil structure and long-term conditioning effects\nUnlike farmer-driven trials, TAGEM studies provide standardized, scientifically monitored validation under institutional oversight. The Thrace trial serves as a bridge between field-proven performance and formal scientific validation.",
      "figure": null
    },
    {
      "id": "senegal-moa", "tier": "b2g", "name": "Ministry of Agriculture", "subtitle": "B2G Agricultural Partner — Senegal",
      "country": "Senegal", "location_label": "West Africa, Senegal / Dakar",
      "lat": 14.7167, "lng": -17.4677, "scale": "6 Hectares", "crop": "Maize / Tomato / Pepper / Watermelon",
      "irrigation": "Open field", "application": "Ministry of Agriculture land, monitored by field observation and satellite imagery analysis",
      "products": ["Nanotern Agriculture", "Nanotern Aqua"], "system": "Open Field", "status": "Ongoing", "results": null,
      "description": "Senegal serves as a strategic entry point into West African agriculture, combining strong government engagement with high-scale deployment potential. Field trials have been conducted on Ministry of Agriculture land, where Nanotern has been positioned as a strategic solution for improving water efficiency and crop resilience under resource-constrained conditions.\nApplications have been officially initiated on designated areas, and the work has been introduced through a local TV press launch event, signaling early public visibility and institutional support. At the regional level, Senegal functions as a gateway to West Africa, a region characterized by millions of hectares of cultivable land, increasing water stress, and climate variability.\nWithin the Ministry-supported trial areas, both Nanotern Granule and Nanotern Aqua formulations are being evaluated on maize, tomato, pepper, and watermelon cultivation. The applications are being systematically monitored through field observations and satellite imagery analysis, allowing vegetation development, irrigation response, and crop performance to be evaluated over time.",
      "figure": "Figure 13. Snapshots from media launch event of Nanotern Senegal"
    },
    {
      "id": "senegal-ministerial", "tier": "b2g", "name": "Strategic Application: Senegal", "subtitle": "Ministerial Demonstration",
      "country": "Senegal", "location_label": "West Africa - Senegal, Dakar",
      "lat": 14.6937, "lng": -17.2833, "scale": "Ministerial demonstration plots",
      "crop": "Maize silage, Pepper, Tomatoes, Watermelon", "irrigation": "Drip Irrigation",
      "application": "Digital field monitoring and data-driven analytics in collaboration with Doktar Technologies",
      "products": ["Nanotern Agriculture", "Nanotern Aqua"], "system": "Open Field",
      "status": "Ongoing – monitored under controlled field protocol", "results": null,
      "description": "This application represents one of the most critical validation environments for Nanotern, conducted under the direct engagement of the Ministry of Agriculture in Senegal. The field conditions are intentionally challenging: sandy soils with extremely low water retention capacity, high temperatures, and elevated evapotranspiration rates, representing a worst-case scenario for agricultural water management.\nIn collaboration with Doktar Technologies, the application is further enhanced through digital field monitoring and data-driven analytics. Using Doktar's agricultural monitoring platform, plant health, vegetation indices, and field variability are tracked throughout the growing cycle.\nThe strategic importance lies in its ability to simulate extreme water-scarce environments typical of Sub-Saharan Africa and similar arid regions. Beyond technical validation, this serves as a government-level reference case, supporting future scaling through public agricultural programs and regional partnerships.",
      "figure": "Figure 3. Snapshots from Senegal Silage Maize field demo initiated in April, 2026"
    },
    {
      "id": "natura-tarim", "tier": "atfp", "name": "Natura Tarım", "subtitle": "Advanced Technology Field Partner",
      "country": "Türkiye", "location_label": "Manisa, Türkiye", "lat": 38.6191, "lng": 27.4289,
      "scale": "600 Decares · 3.400 Trees + 1.500 Saplings", "crop": "Cherry (Tree)", "irrigation": "Drip Irrigation",
      "application": "50 g per sapling · 125 / 250 g per tree",
      "products": ["Nanotern Agriculture", "Nanotern Aqua"], "system": "Open Field",
      "status": "Ongoing – monitored under controlled field protocol", "results": null,
      "description": "This application is conducted within a regenerative agriculture framework, where long-term soil health, biological activity, and sustainability are core priorities. Natura Tarım operates large-scale, multi-crop orchards with a strong emphasis on data-driven decision-making and precision agriculture practices.\nThe application focuses primarily on cherry production systems, where advanced monitoring infrastructure is already in place. Each parcel is managed with independent irrigation control, and continuous plant and soil analysis is performed throughout the growing cycle.\nThrough continuous monitoring of soil moisture, irrigation input, and plant response, the system enables direct observation of how Nanotern influences water distribution, retention dynamics, and crop performance under operational conditions — allowing not only outcome-based evaluation but also mechanistic understanding.",
      "figure": "Figure 4. Snapshots of Natura Tarım Cherry application taken on March 2026"
    },
    {
      "id": "hayrabolu", "tier": "atfp", "name": "Hayrabolu Lead Farmer Cooperative", "subtitle": "Advanced Technology Field Partner",
      "country": "Türkiye", "location_label": "Tekirdağ, Ankara, Eskişehir, Çanakkale, İstanbul, Türkiye",
      "lat": 41.2136, "lng": 27.1, "scale": "560 Decares · 1120 kg Nanotern + 1120 kg Nanotern Aqua",
      "crop": "Sunflower, Wheat, Sugar Cane", "irrigation": "Rainfed", "application": "Mixing with micro granül fertilizer",
      "products": ["Nanotern Agriculture", "Nanotern Aqua"], "system": "Open Field",
      "status": "Will be initiated in 2026 Q2", "results": null,
      "description": "This collaboration represents one of the largest ongoing field implementations of Nanotern in Türkiye, conducted under real farming conditions and at operational scale.\nApplications have been initiated across approximately 560 decares, covering multiple regions and crop types, including wheat, sunflower, and sugar beet. Both Nanotern (solid) and Nanotern Aqua are being applied alongside Antimic, enabling a direct comparison of different product forms and delivery mechanisms under the same field conditions. Currently, 1120 kg of Nanotern and 1120 kg of Nanotern Aqua are being deployed.\nIn parallel, a dedicated field demonstration program is being carried out on sunflower, maize, and sugar cane, allowing targeted evaluation across crops with varying root structures and water demand profiles. The inclusion of sugar cane, as a high water-consuming crop, provides a valuable benchmark for assessing performance under intensive water demand.",
      "figure": "Figure 6. Images of field exploration with Hayrabolu Lead Farmer Cooperative"
    },
    {
      "id": "smyrna-greenhouse", "tier": "atfp", "name": "Smyrna Greenhouse", "subtitle": "Advanced Technology Field Partner · Akça Holding",
      "country": "Türkiye", "location_label": "Denizli, Türkiye", "lat": 37.7765, "lng": 29.0864,
      "scale": "2 Greenhouses · Tomato, 560 slabs", "crop": "Tomato", "irrigation": "Drip Irrigation",
      "application": "Mixing Nanotern with cocopeat",
      "products": ["Nanotern Bio+ Agriculture", "Nanotern Aqua"], "system": "Greenhouse",
      "status": "Ongoing – monitored under controlled field protocol", "results": null,
      "description": "This application focuses on controlled greenhouse production systems, where precision agriculture practices are already well established. Applications are carried out in cocopeat-based substrates under fully controlled irrigation and monitoring conditions.\nCocopeat is one of the most widely used growing media in modern greenhouse agriculture due to its lightweight structure, high porosity, and water retention capacity. However, its performance is still limited by rapid drainage and uneven water distribution under intensive irrigation regimes.\nNanotern has the potential to significantly enhance cocopeat functionality by improving water retention stability and enabling more controlled water availability within the root zone. Rather than replacing cocopeat, it acts as a performance-enhancing layer. Given the global scale of cocopeat use, this integration positions Nanotern as a scalable solution within one of the most standardized agricultural systems.",
      "figure": "Figure 5. Snapshots from Smyrna tomato field demo, April 2026"
    },
    {
      "id": "gebze-technical", "tier": "atfp", "name": "Gebze Technical University",
      "subtitle": "Advanced Technology Field Partner · TÜBİTAK Supported R&D Collaboration",
      "country": "Türkiye", "location_label": "Kocaeli, Türkiye", "lat": 40.8028, "lng": 29.4307,
      "scale": "TÜBİTAK funded project framework", "crop": "Maize silage, Pepper, Tomatoes, Watermelon",
      "irrigation": "Rainfed", "application": "Laboratory phase completed, transitioned into first field application phase",
      "products": ["Nanotern Nutri"], "system": "Open Field", "status": "Newly initiated – field trials ongoing (2026)", "results": null,
      "description": "This collaboration represents a structured research partnership conducted under a TÜBİTAK funded project framework, in cooperation with Gebze Technical University and the Republic of Türkiye Ministry of Agriculture and Forestry, General Directorate of Plant Production.\nThe project focuses on the development and validation of Nanotern Nutri, a next-generation formulation designed to enhance nutrient-use efficiency alongside water management in the root zone. During the laboratory phase, controlled experiments demonstrated that when Nanotern is integrated into the soil system, nitrogen fertilizer efficiency is significantly improved through stabilization of nutrient availability within the root zone.\nEarly-stage findings also indicate:\n• Improved salt tolerance, particularly under elevated ionic conditions\n• Enhanced photosynthetic activity linked to improved root-zone conditions\nBuilding on these validated results, the project has now transitioned into its first field application phase.",
      "figure": "Figure 7. Wheat application in Gebze, April 2026"
    },
    {
      "id": "ausonia-italy", "tier": "atfp", "name": "Azienda Agricola Ausonia", "subtitle": "Montepulciano Vineyards (Italy, Abruzzo)",
      "country": "Italy", "location_label": "Teramo / Atri, Italy", "lat": 42.5793, "lng": 13.9814,
      "scale": "Montepulciano vineyards", "crop": "Grape", "irrigation": "Open field",
      "application": "Supported under the EIT Test Farms program",
      "products": ["Nanotern Bio+ Agriculture"], "system": "Open Field", "status": "Ongoing", "results": null,
      "description": "The collaboration with Azienda Agricola Ausonia focuses on Montepulciano vineyards in the Abruzzo region, where water management plays a critical role in both grape composition and final wine quality.\nThe pilot is structured to evaluate Nanotern under premium wine production conditions, where the objective extends beyond yield optimization to include quality consistency, stress control, and grape development dynamics.\nThis field application is supported under the EIT Test Farms program, through which Nanotern has been selected for validation within a European innovation framework. This external validation reflects alignment with European agricultural innovation priorities, particularly in water efficiency and climate resilience. Given the high-value nature of wine production, even incremental improvements in water management can translate into disproportionately high economic and quality impact.",
      "figure": null
    },
    {
      "id": "balsu-tr", "tier": "csip", "name": "Balsu Türkiye", "subtitle": "Crop-Specific Industrial Producer · Hazelnut Production",
      "country": "Türkiye", "location_label": "Sakarya / Düzce, Türkiye", "lat": 40.7569, "lng": 30.3783,
      "scale": "Commercial hazelnut orchards", "crop": "Hazelnut", "irrigation": "Rainfed",
      "application": "Applied in commercial hazelnut orchards operated with large-scale producers",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing",
      "results": "27.8% improvement in oil quality, along with observable improvements in vegetative growth — suggesting Nanotern contributes not only to water regulation, but also to nutrient stability within the root zone.",
      "description": "Balsu is one of the leading global hazelnut processors and exporters, with vertically integrated operations in both Türkiye and Chile. Active in the Black Sea Region of Türkiye, this region presents a different challenge: not water scarcity, but variability in soil structure and nutrient availability affecting product quality. The application focused on improving oil quality and plant development.\nNanotern has been evaluated within Balsu's production ecosystems across two geographically distinct regions. While Türkiye represents the core of global hazelnut production, Balsu's presence in Chile provides access to Southern Hemisphere cultivation systems, enabling year-round production and cross-seasonal validation. The focus of this partnership is on improving yield quality, stabilizing production, and enhancing oil composition through optimized root-zone water and nutrient management.",
      "figure": "Figure 1. Snapshots of Balsu Hazelnut application, February 2025"
    },
    {
      "id": "balsu-agrochile", "tier": "csip", "name": "Balsu Agrochile", "subtitle": "Crop-Specific Industrial Producer · Hazelnut Production",
      "country": "Chile", "location_label": "South America - Chile", "lat": -35.4264, "lng": -71.6554,
      "scale": "Southern Hemisphere cultivation systems", "crop": "Hazelnut", "irrigation": "Drip Irrigation",
      "application": "Cross-seasonal validation alongside Türkiye operations",
      "products": ["Nanotern Aqua"], "system": "Open Field", "status": "Ongoing", "results": null,
      "description": "Nanotern has been evaluated within Balsu's production ecosystems across two geographically distinct regions. Balsu's presence in Chile provides access to Southern Hemisphere cultivation systems, enabling year-round production and cross-seasonal validation.\nThis dual-location collaboration allows Nanotern to be tested under different climate regimes, soil structures, and agricultural practices, significantly strengthening its global applicability. The focus of this partnership is on improving yield quality, stabilizing production, and enhancing oil composition through optimized root-zone water and nutrient management.",
      "figure": null
    },
    {
      "id": "tiryaki-mus", "tier": "csip", "name": "Tiryaki Agro", "subtitle": "Crop-Specific Industrial Producer · Muş",
      "country": "Türkiye", "location_label": "Muş, Türkiye", "lat": 38.9462, "lng": 41.7539,
      "scale": "Multi-region scaling case", "crop": "Sunflower, Lentil", "irrigation": "Rainfed",
      "application": "Drone-based broadcasting (lentil); row-based band placement during sowing at 5–15 cm (sunflower)",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing",
      "results": "~9% increase in yield under a season characterized by severe drought and no supplemental irrigation, despite a non-optimized application approach.",
      "description": "In Eastern Türkiye, crop production is largely rainfed and highly vulnerable to seasonal drought and rainfall variability.\nInitial trials in Muş (lentil) were conducted under extreme drought conditions, with almost no rainfall throughout the season. Nanotern was applied via drone-based, non-uniform broadcasting, without root-zone targeting. Despite this non-optimized approach, a ~9% yield increase was achieved, demonstrating strong baseline performance even under severe stress.\nSubsequent applications in sunflower systems focused on controlled, row-based band placement during sowing (5–15 cm depth), ensuring direct proximity to the root zone.\nThe 2026 deployment aims to:\n• Transition to mechanized and scalable application systems\n• Optimize dosage based on soil type and rainfall conditions\n• Expand into pistachio systems in Iraq under extreme heat and water scarcity",
      "figure": "Figure 9. Sunflower application in Muş, October 2025"
    },
    {
      "id": "tiryaki-gaziantep", "tier": "csip", "name": "Tiryaki Agro", "subtitle": "Crop-Specific Industrial Producer · Gaziantep",
      "country": "Türkiye", "location_label": "Gaziantep, Türkiye", "lat": 37.0662, "lng": 37.3833,
      "scale": "High-value perennial systems", "crop": "Pistachio", "irrigation": "Rainfed",
      "application": "Root-zone placement in perennial orchard systems",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing", "results": null,
      "description": "Tiryaki Agro represents a strong multi-region scaling case, spanning both rainfed row crops and high-value perennial systems across challenging climates. Pistachio orchards in Gaziantep extend the evaluation of Nanotern into perennial systems where root-zone water buffering supports resilience through hot, dry seasons.",
      "figure": null
    },
    {
      "id": "tiryaki-iraq", "tier": "csip", "name": "Tiryaki Agro Iraq", "subtitle": "Crop-Specific Industrial Producer",
      "country": "Iraq", "location_label": "Iraq", "lat": 36.1901, "lng": 44.0091,
      "scale": "2026 deployment target", "crop": "Wheat / Lentil / Sunflower / Pistachio", "irrigation": "Rainfed",
      "application": "Expansion under extreme heat and water scarcity",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "2026 Deployment Pipeline", "results": null,
      "description": "Expansion into pistachio and rainfed row-crop systems in Iraq under extreme heat and water scarcity. This deployment extends Tiryaki Agro's multi-region scaling case beyond Türkiye, testing Nanotern's robustness in one of the region's most demanding agro-climatic environments.",
      "figure": null
    },
    {
      "id": "campos-del-sur", "tier": "csip", "name": "Campos del Sur", "subtitle": "Crop-Specific Industrial Producer · Table Grapes",
      "country": "Peru", "location_label": "Peru - ICA", "lat": -14.0678, "lng": -75.7286,
      "scale": "Commercial vineyard systems", "crop": "Table Grapes", "irrigation": "Drip Irrigation",
      "application": "Localized placement strategies aligned with the drip irrigation system",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing",
      "results": "40% reduction in irrigation water usage was achieved without yield loss.",
      "description": "Peru represents a key milestone for Nanotern, as it marks both the first international export deployment and the first pilot implementation in South America. This transition from domestic field validation to international application demonstrates the adaptability of the technology across distinct climatic and agronomic conditions.\nThe pilot was conducted in commercial vineyard systems under controlled irrigation regimes, where water efficiency is a critical operational parameter. Field conditions in coastal Peru — characterized by low rainfall, high evapotranspiration, and fast-draining soils — provide a demanding environment for root-zone water management.\nApplications were carried out using localized placement strategies aligned with the drip irrigation system, ensuring direct interaction between Nanotern, water flow, and root activity.",
      "figure": "Figure 7. Grape application in Peru, August 2025"
    },
    {
      "id": "barbare-vineyards", "tier": "csip", "name": "Barbare Vineyards", "subtitle": "Crop-Specific Industrial Producer · Mediterranean Region",
      "country": "Türkiye", "location_label": "Tekirdağ, Türkiye", "lat": 41.0011, "lng": 27.51,
      "scale": "Grenache plantings, multi-depth monitored", "crop": "Wine Grapes / Sunflower", "irrigation": "Drip Irrigation",
      "application": "Line-based root-zone placement at 20–30 cm depth; 30 cm and 60 cm tensiometers",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing",
      "results": "Extended soil moisture retention between irrigation cycles; reduced fluctuation in root-zone water availability; improved plant stability during peak evapotranspiration.",
      "description": "Located in a Mediterranean climate zone characterized by hot, dry summers and irregular rainfall, the Barbare vineyard represents a controlled yet water-limited production environment where irrigation efficiency directly impacts vine balance and grape quality.\nThe vineyard is planted with Grenache, a variety known for its drought tolerance but also for its sensitivity to water stress during key phenological stages. This makes it an ideal system for evaluating root-zone water buffering strategies.\nNanotern is applied using line-based root-zone placement, aligned with drip irrigation lines and incorporated at depths of approximately 20–30 cm. The protocol is supported by multi-depth soil moisture monitoring (30 cm and 60 cm tensiometers), allowing dynamic tracking of water availability.\nPreliminary observations indicate:\n• Extended soil moisture retention between irrigation cycles\n• Reduced fluctuation in root-zone water availability\n• Improved plant stability during peak evapotranspiration periods",
      "figure": null
    },
    {
      "id": "dogu-manisa", "tier": "csip", "name": "East Manisa Walnut & Almond Cooperative",
      "subtitle": "S.S. Doğu Manisa Ceviz ve Badem Üreticileri Tarımsal Kalkınma Kooperatifi",
      "country": "Türkiye", "location_label": "Manisa, Türkiye", "lat": 38.65, "lng": 28.05,
      "scale": "5.000 Trees", "crop": "Walnut / Almond (Tree)", "irrigation": "Drip Irrigation", "application": "150 g per tree",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Ongoing",
      "results": "Without any changes to existing irrigation or management practices, Nanotern delivered an average yield increase of 30% across more than 5,000 trees.",
      "description": "This application represents the first large-scale, fully paid field implementation of Nanotern, marking a critical milestone in the transition from validation to commercial adoption. The application was conducted in more than 5,000 trees within the cooperative's production network.\nGrowers did not modify their existing agricultural practices. Irrigation regimes, fertilization strategies, and overall field management remained unchanged throughout the application, allowing a direct assessment of Nanotern's impact under real-world conditions without optimization bias.\nCollaboration with cooperatives reflects a broader scaling strategy: cooperatives provide access to large, organized grower networks, enabling rapid deployment, standardized application practices, and efficient knowledge transfer. By demonstrating strong results at scale within a cooperative structure, this application establishes a replicable pathway for expansion.",
      "figure": "Figure. Almond & Walnut production field"
    },
    {
      "id": "hydroponic-tomato", "tier": "csip", "name": "Hydroponic Tomato Production", "subtitle": "Crop-Specific Industrial Producer · Denizli",
      "country": "Türkiye", "location_label": "Denizli Greenhouse, Türkiye", "lat": 37.83, "lng": 29.16,
      "scale": "Cocopeat slab + Nanotern-only medium trial", "crop": "Tomato", "irrigation": "Drip Irrigation", "application": "200 g per cocopeat slab",
      "products": ["Nanotern Agriculture"], "system": "Greenhouse", "status": "Completed",
      "results": "Stabilized EC and pH in cocopeat systems, successful tomato growth in Nanotern-only media, and ~40% increase in secondary root formation.",
      "description": "This application was conducted in a controlled greenhouse environment using cocopeat-based growing media, where irrigation management and nutrient stability are critical for consistent plant performance.\nIn drainage water collected from cocopeat mixtures containing Nanotern, both electrical conductivity (EC) and pH levels remained more stable compared to control conditions, indicating a buffering effect within the root-zone environment. In parallel, an additional setup grew tomatoes without cocopeat, using only Nanotern as the primary growth medium — with successful plant development, indicating Nanotern can function as a standalone root-zone medium.\nThese findings significantly expand the application scope of Nanotern, suggesting potential use not only in improving existing substrates, but also in reducing or partially replacing conventional growing media such as cocopeat.",
      "figure": "Figure. Hydroponic Tomato application in Denizli, February 2025"
    },
    {
      "id": "cherry-orchards", "tier": "csip", "name": "Cherry Orchards", "subtitle": "Crop-Specific Industrial Producer · Central Anatolia",
      "country": "Türkiye", "location_label": "Niğde, Türkiye", "lat": 37.9698, "lng": 34.6857,
      "scale": "Central Anatolia orchards", "crop": "Fruit (Cherry)", "irrigation": "Flood Irrigation",
      "application": "125 g per tree, applied in a semi-swollen form prior to soil incorporation",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "Completed",
      "results": "Irrigation was reduced by 50%, while export-grade fruit quality increased by approximately 10%.",
      "description": "In Central Anatolia, cherry production faces a recurring constraint: limited water availability combined with high quality expectations for export markets.\nThis application introduces a differentiated approach, where Nanotern was applied in a semi-swollen form prior to soil incorporation. Unlike standard dry granule placement, this method allows partial pre-activation of the polymer, enabling a more immediate interaction with the surrounding soil matrix.\nThe semi-swollen deployment was selected to evaluate its impact on initial water distribution, root-zone contact, and early-stage moisture buffering. This variation demonstrates the flexibility of Nanotern across multiple deployment strategies, and shows that water reduction and quality improvement can be achieved simultaneously, even in perennial systems.",
      "figure": "Figure. Cherry application in Niğde, June 2021"
    },
    {
      "id": "ok-plant", "tier": "csip", "name": "OK Plant", "subtitle": "Crop-Specific Industrial Producer · Orchid Production",
      "country": "Netherlands", "location_label": "Holland, Den Haag", "lat": 52.0705, "lng": 4.3007,
      "scale": "Fully controlled greenhouse environment", "crop": "Orchid Cultivation", "irrigation": "Fertigation / soilless substrate",
      "application": "Integrated directly into the substrate system",
      "products": ["Nanotern Agriculture"], "system": "Greenhouse", "status": "2026 Deployment Pipeline", "results": null,
      "description": "Located in the Netherlands, OK Plant operates within a fully controlled greenhouse environment where orchids are cultivated under tightly regulated humidity, temperature, and fertigation regimes. Production relies on soilless substrates such as cocopeat blends, where water and nutrient dynamics are highly sensitive to leaching and micro-environmental fluctuations.\nThe Netherlands is widely recognized as the global hub for ornamental horticulture. Dutch greenhouse systems are among the most advanced in the world, characterized by high-input, high-precision production models where consistency and uniformity are non-negotiable — one of the most demanding validation environments in global agriculture.\nNanotern is integrated directly into the substrate system to enhance root-zone water retention, reduce nutrient loss through leaching, and stabilize EC and pH fluctuations in drainage water. Previous trials in Denizli demonstrated stable EC and pH in drainage water and up to a 40% increase in secondary root formation — directly relevant to greenhouse systems where root density influences nutrient uptake efficiency.",
      "figure": null
    },
    {
      "id": "ozgur-tarim", "tier": "csip", "name": "Özgür Tarım", "subtitle": "Crop-Specific Industrial Producer · Dry Grape Export",
      "country": "Türkiye", "location_label": "Manisa, Türkiye", "lat": 38.56, "lng": 27.66,
      "scale": "200 Decares", "crop": "Dry Grape", "irrigation": "Open field",
      "application": "Evaluated under real commercial export production conditions",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "2026 Deployment Pipeline", "results": null,
      "description": "The collaboration with Özgür Tarım represents a high-impact deployment within one of Türkiye's leading dry grape export operations, where production is directly linked to international quality standards and export consistency.\nOperating at significant scale, Özgür Tarım manages vineyard systems that are highly sensitive to water availability, timing, and stress conditions, as even minor fluctuations can directly affect both yield and export-grade quality.\nNanotern is being evaluated under real commercial conditions, where irrigation practices, soil variability, and seasonal stress factors reflect the realities of large-scale export agriculture. The objective is to understand how improved root-zone water management translates into quality stability, uniformity, and resilience across production cycles, providing a direct pathway to high-volume deployment potential.",
      "figure": null
    },
    {
      "id": "california-dairies", "tier": "csip", "name": "California Dairies", "subtitle": "Crop-Specific Industrial Producer · Silage Maize (USA)",
      "country": "United States", "location_label": "California, USA", "lat": 36.3302, "lng": -119.2921,
      "scale": "300 Hectares", "crop": "Corn / Silage Maize", "irrigation": "Open field",
      "application": "Integrated directly into the active root zone, compatible with existing mechanized infrastructure",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "2026 Deployment Pipeline", "results": null,
      "description": "California Dairies is one of the largest dairy cooperatives in the United States, supporting large-scale milk production operations across California. Silage maize serves as one of the core feed crops within the production system. Agricultural operations in California are carried out under chronic water scarcity, high temperatures, and increasingly strict water-use regulations.\nNanotern is being utilized in silage maize production systems, implemented in full compatibility with existing mechanized agricultural infrastructure while integrated directly into the active root zone. Under high evapotranspiration conditions, maintaining water availability within the root zone for longer periods is particularly important for optimizing irrigation intervals and reducing heat-induced stress.\nCalifornia represents one of the world's most advanced and tightly regulated agricultural ecosystems, making this a strategic validation platform for large-scale livestock and feed production systems.",
      "figure": null
    },
    {
      "id": "scott-brothers-dairy", "tier": "csip", "name": "Scott Brothers Dairy", "subtitle": "Crop-Specific Industrial Producer",
      "country": "United States", "location_label": "California, USA", "lat": 34.0122, "lng": -117.6889,
      "scale": "120 Hectares", "crop": "Corn", "irrigation": "Open field",
      "application": "Root-zone integration within mechanized feed production",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "In Progress", "results": null,
      "description": "Part of the Crop-Specific Industrial Producers network in California, USA. Corn feed production across 120 hectares of open field, with Nanotern integrated into the active root zone within mechanized feed operations to improve water-use efficiency under California's water-scarce conditions.",
      "figure": null
    },
    {
      "id": "tejon-ranch", "tier": "csip", "name": "Tejon Ranch Company", "subtitle": "Crop-Specific Industrial Producer",
      "country": "United States", "location_label": "California, USA", "lat": 35.0836, "lng": -118.7509,
      "scale": "60 Hectares", "crop": "Corn", "irrigation": "Open field",
      "application": "Root-zone integration within mechanized feed production",
      "products": ["Nanotern Agriculture"], "system": "Open Field", "status": "In Progress", "results": null,
      "description": "Part of the Crop-Specific Industrial Producers network in California, USA. Corn feed production across 60 hectares of open field, with Nanotern integrated into the active root zone within mechanized feed operations to improve water-use efficiency under California's water-scarce conditions.",
      "figure": null
    }
  ]
};

(function(){
"use strict";
if(typeof THREE==='undefined'){ console.warn('field-globe: THREE not loaded'); return; }

const DATA = FIELD_DATA;
const FIELDS = DATA.fields;
const TIERS  = {b2g:'B2G Agricultural Partners', atfp:'Advanced Technology Field Partners', csip:'Crop-Specific Industrial Producers'};
const TIER_COLOR = {b2g:0xFFC72C, atfp:0x3DBE73, csip:0xF2F1EC};
const TIER_CSS   = {b2g:'#FFC72C', atfp:'#3DBE73', csip:'#F2F1EC'};

const c = DATA.meta.network_counters;
document.getElementById('fa-counters').innerHTML = [
  [FIELDS.length,'Field sites'],
  [c.countries,'Countries'],
  [c.continents,'Continents'],
  [c.trees_monitored,'Trees monitored'],
  [c.hectares_to_be_monitored,'Hectares to monitor']
].map(function(a){return '<div class="fa-counter"><b>'+a[0]+'</b><span>'+a[1]+'</span></div>';}).join('');

const idx = document.getElementById('fa-index');
const filterBox = document.getElementById('fa-filters');
let activeTiers = new Set(Object.keys(TIERS));

filterBox.innerHTML = Object.entries(TIERS).map(function(e){
  var k=e[0];
  var short = k==='b2g'?'B2G':k==='atfp'?'Tech Partners':'Industrial';
  return '<button class="fa-chip" data-tier="'+k+'" aria-pressed="true"><em style="background:'+TIER_CSS[k]+'"></em>'+short+'</button>';
}).join('');

function buildIndex(){
  idx.innerHTML = Object.entries(TIERS).map(function(e){
    var k=e[0], label=e[1];
    var rows = FIELDS.map(function(f,i){return {f:f,i:i};}).filter(function(o){return o.f.tier===k;});
    if(!rows.length) return '';
    return '<div class="fa-grp" data-tier="'+k+'"><span class="fa-tag">'+label+'</span>'+
      rows.map(function(o){return '<button class="fa-item" data-i="'+o.i+'">'+
        '<i>'+String(o.i+1).padStart(2,'0')+'</i>'+
        '<span><b>'+o.f.name+'</b><small>'+o.f.location_label+'</small></span>'+
      '</button>';}).join('')+'</div>';
  }).join('');
  idx.querySelectorAll('.fa-item').forEach(function(b){ b.onclick=function(){select(+b.dataset.i);}; });
  syncIndex();
}
function syncIndex(){
  idx.querySelectorAll('.fa-grp').forEach(function(g){ g.style.display = activeTiers.has(g.dataset.tier)?'':'none'; });
  idx.querySelectorAll('.fa-item').forEach(function(b){ b.setAttribute('aria-current', (+b.dataset.i===current)?'true':'false'); });
}
filterBox.querySelectorAll('.fa-chip').forEach(function(chip){
  chip.onclick=function(){
    var t=chip.dataset.tier;
    if(activeTiers.has(t) && activeTiers.size>1) activeTiers.delete(t); else activeTiers.add(t);
    chip.setAttribute('aria-pressed', activeTiers.has(t));
    syncIndex(); syncMarkers();
  };
});

const wrap = document.getElementById('fa-canvas-wrap');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
camera.position.set(0,0,330);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));
if(THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
wrap.appendChild(renderer.domElement);
const cvs = renderer.domElement;

const R = 100;
const globe = new THREE.Group();
scene.add(globe);

/* realistic textured earth */
const sphereMat = new THREE.MeshBasicMaterial({color:0x0e1618});
const sphere = new THREE.Mesh(new THREE.SphereGeometry(R,72,54), sphereMat);
globe.add(sphere);

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const TEXTURES = [
  'https://cdn.jsdelivr.net/npm/three-globe@2.24.13/example/img/earth-blue-marble.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe@2.24.13/example/img/earth-day.jpg',
  'https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg'
];
(function tryTex(n){
  if(n>=TEXTURES.length) return;
  loader.load(TEXTURES[n], function(t){
    if(THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    try{ t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }catch(e){}
    sphereMat.map = t; sphereMat.color.set(0xEDEEEA); sphereMat.needsUpdate = true;
  }, undefined, function(){ tryTex(n+1); });
})(0);

(function graticule(){
  const pts=[];
  for(let lat=-60;lat<=60;lat+=30){
    const r=R*Math.cos(lat*Math.PI/180), y=R*Math.sin(lat*Math.PI/180);
    for(let a=0;a<360;a+=3){
      const a1=a*Math.PI/180, a2=(a+3)*Math.PI/180;
      pts.push(r*Math.cos(a1),y,r*Math.sin(a1), r*Math.cos(a2),y,r*Math.sin(a2));
    }
  }
  for(let lng=0;lng<360;lng+=30){
    const t=lng*Math.PI/180;
    for(let p=-87;p<87;p+=3){
      const p1=p*Math.PI/180,p2=(p+3)*Math.PI/180;
      pts.push(R*Math.cos(p1)*Math.cos(t),R*Math.sin(p1),R*Math.cos(p1)*Math.sin(t),
               R*Math.cos(p2)*Math.cos(t),R*Math.sin(p2),R*Math.cos(p2)*Math.sin(t));
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  globe.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x2A3335,transparent:true,opacity:.12})));
})();

/* atmosphere glow removed */

/* starfield backdrop */
(function stars(){
  const n=1300, pos=[];
  for(let i=0;i<n;i++){
    const u=Math.random()*2-1, a=Math.random()*Math.PI*2, r=520+Math.random()*280, s=Math.sqrt(1-u*u);
    pos.push(Math.cos(a)*s*r, u*r, Math.sin(a)*s*r);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0x9fb4d6, size:1.5, sizeAttenuation:true, transparent:true, opacity:.65, depthWrite:false})));
})();

function toVec(lat,lng,r){
  const phi=(90-lat)*Math.PI/180, th=(lng+180)*Math.PI/180;
  return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(th), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(th));
}
/* ANT Systems emblem sprite — three crossed bars, yellow + emissive */
const embCanvas = document.createElement('canvas'); embCanvas.width=embCanvas.height=96;
(function(){
  const g=embCanvas.getContext('2d'); g.translate(48,48);
  g.strokeStyle='#FFE855'; g.lineCap='round'; g.lineWidth=13;
  [0, Math.PI/4, Math.PI/2].forEach(function(a){
    g.save(); g.rotate(a); g.beginPath(); g.moveTo(0,-34); g.lineTo(0,34); g.stroke(); g.restore();
  });
})();
const emblemTex = new THREE.CanvasTexture(embCanvas);
const YELLOW = 0xFFD22E;

const markers = [];
const hitTargets = [];
FIELDS.forEach(function(f,i){
  const g = new THREE.Group();
  const pos = toVec(f.lat,f.lng,R*1.004);
  g.position.copy(pos);
  g.lookAt(0,0,0);

  /* soft emissive glow behind the emblem */
  const core = new THREE.Mesh(new THREE.CircleGeometry(3.6,24),
    new THREE.MeshBasicMaterial({color:YELLOW,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));
  core.position.z = 0.35; g.add(core);

  /* the ANT emblem itself */
  const emb = new THREE.Mesh(new THREE.PlaneGeometry(5.6,5.6),
    new THREE.MeshBasicMaterial({map:emblemTex,transparent:true,color:YELLOW,depthWrite:false}));
  emb.position.z = 0.7; g.add(emb);

  const rings = [];
  for(let k=0;k<2;k++){
    const rg = new THREE.Mesh(new THREE.RingGeometry(2.4,2.8,40),
      new THREE.MeshBasicMaterial({color:YELLOW,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    rg.position.z=0.3; g.add(rg); rings.push(rg);
  }
  const halo = new THREE.Mesh(new THREE.RingGeometry(5.0,6.0,44),
    new THREE.MeshBasicMaterial({color:YELLOW,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.position.z=0.25; g.add(halo);

  const hit = new THREE.Mesh(new THREE.SphereGeometry(6,10,8),
    new THREE.MeshBasicMaterial({visible:false}));
  hit.position.z=1; g.add(hit);
  hit.userData.i = i;

  globe.add(g);
  markers.push({g:g,core:core,emb:emb,rings:rings,halo:halo,dir:pos.clone().normalize(),i:i,tier:f.tier,visible:true,phase:Math.random()*6.28});
  hitTargets.push(hit);
});
function syncMarkers(){
  markers.forEach(function(m){ m.visible = activeTiers.has(m.tier); m.g.visible = m.visible; });
}

let rotX=0.18, rotY=-0.6, tgtX=null, tgtY=null;
let zoomF=1, baseZ=330;
let drag=false, lastX=0, lastY=0, vel=0, auto=true, current=-1;
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2();
const tip = document.getElementById('fa-tip');
let hovered = -1;

function ptrPos(e){ const r=cvs.getBoundingClientRect();
  return {x:(e.clientX-r.left), y:(e.clientY-r.top), w:r.width, h:r.height}; }

cvs.addEventListener('pointerdown',function(e){
  drag=true; lastX=e.clientX; lastY=e.clientY; auto=false; tgtX=tgtY=null;
  cvs.classList.add('grabbing'); cvs.setPointerCapture(e.pointerId);
  document.getElementById('fa-hint').classList.add('gone');
});
cvs.addEventListener('pointerup',function(){drag=false;cvs.classList.remove('grabbing');});
cvs.addEventListener('pointercancel',function(){drag=false;cvs.classList.remove('grabbing');});
cvs.addEventListener('pointermove',function(e){
  if(drag){
    rotY += (e.clientX-lastX)*0.005;
    rotX = Math.max(-1.15,Math.min(1.15, rotX + (e.clientY-lastY)*0.005));
    vel = (e.clientX-lastX)*0.0006;
    lastX=e.clientX; lastY=e.clientY; return;
  }
  const p = ptrPos(e);
  ptr.x = (p.x/p.w)*2-1; ptr.y = -(p.y/p.h)*2+1;
  ray.setFromCamera(ptr,camera);
  const hits = ray.intersectObjects(hitTargets.filter(function(h,i){return markers[i].visible;}));
  let found=-1;
  if(hits.length){
    const i = hits[0].object.userData.i;
    if(markers[i].dir.clone().applyEuler(globe.rotation).z > 0.08) found=i;
  }
  if(found!==hovered){
    hovered=found;
    cvs.classList.toggle('over', found>=0);
    if(found>=0){
      const f=FIELDS[found];
      tip.querySelector('b').textContent=f.name;
      tip.querySelector('span').textContent=f.location_label.toUpperCase();
      tip.classList.add('show');
    } else tip.classList.remove('show');
  }
  if(found>=0){ tip.style.left=p.x+'px'; tip.style.top=p.y+'px'; }
});
cvs.addEventListener('click',function(){ if(hovered>=0) select(hovered); });
cvs.addEventListener('pointerleave',function(){hovered=-1;tip.classList.remove('show');});
/* zoom happens only on pin/site select (see focusOn) */

function focusOn(i){
  const d = markers[i].dir;
  let y = -Math.atan2(d.x, d.z) + 0.10;
  const lat = Math.asin(d.y);
  tgtX = Math.max(-1.05,Math.min(1.05, lat - 0.10));
  let cur = rotY, delta = y - cur;
  while(delta >  Math.PI) delta -= 2*Math.PI;
  while(delta < -Math.PI) delta += 2*Math.PI;
  tgtY = cur + delta;
  zoomF = 0.68;
  auto = false;
}

const D = function(id){ return document.getElementById(id); };
const dossier = D('fa-dossier');

function esc(s){return String(s).replace(/[&<>]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m];});}
function renderBody(text){
  return text.split('\n').filter(Boolean).map(function(p){
    const t = p.trim();
    if(t.charAt(0)==='\u2022') return '<p class="bullet">'+esc(t.slice(1).trim())+'</p>';
    return '<p>'+esc(t)+'</p>';
  }).join('');
}

const photo = D('fa-photo');
function fillDossier(i){
  const f = FIELDS[i];
  D('fa-flagDot').style.background = TIER_CSS[f.tier];
  D('fa-flagText').textContent = String(i+1).padStart(2,'0')+' — '+TIERS[f.tier];
  D('fa-dName').textContent = f.name;
  D('fa-dSub').textContent = f.subtitle || '';
  D('fa-dPlace').textContent = f.location_label;
  D('fa-dCoord').textContent = Math.abs(f.lat).toFixed(2)+'°'+(f.lat>=0?'N':'S')+' '+Math.abs(f.lng).toFixed(2)+'°'+(f.lng>=0?'E':'W');
  D('fa-dProducts').innerHTML = f.products.map(function(p){return '<span class="fa-pill amber">'+esc(p)+'</span>';}).join('')
    + '<span class="fa-pill">'+esc(f.country)+'</span>';
  D('fa-dCrop').textContent   = f.crop || '—';
  D('fa-dIrr').textContent    = f.irrigation || '—';
  D('fa-dScale').textContent  = f.scale || '—';
  D('fa-dSystem').textContent = f.system || '—';
  D('fa-dApp').textContent    = f.application || '—';
  D('fa-dStatus').textContent = f.status || '—';
  if(f.results){ D('fa-dResultWrap').style.display=''; D('fa-dResult').textContent = f.results; }
  else D('fa-dResultWrap').style.display='none';
  D('fa-dBody').innerHTML = renderBody(f.description || '');
  if(f.figure){ D('fa-dFigWrap').style.display=''; D('fa-dFig').textContent = f.figure; }
  else D('fa-dFigWrap').style.display='none';
  dossier.querySelector('.fa-scroller').scrollTop = 0;
}
function showPhoto(i){
  const f = FIELDS[i];
  const box = D('fa-photo-img'); box.innerHTML='';
  const slot = document.createElement('image-slot');
  slot.id = 'fa-photo-'+f.id;
  slot.setAttribute('shape','rect');
  slot.setAttribute('placeholder', f.figure || (f.name+' — field photo'));
  box.appendChild(slot);
  D('fa-photo-cap').textContent = f.figure ? 'Field figure' : TIERS[f.tier];
  D('fa-photo-name').textContent = f.name;
  D('fa-photo-meta').textContent = f.results ? f.results : f.location_label;
  photo.classList.add('open');
}
function hidePhoto(){
  photo.classList.remove('open');
  if(!dossier.classList.contains('open')){ zoomF=1; current=-1; auto=true; tgtX=tgtY=null; syncIndex(); }
}
function openRecord(){
  photo.classList.remove('open');
  dossier.classList.add('open');
  dossier.querySelector('.fa-scroller').scrollTop = 0;
}
function selectSite(i){
  if(i<0||i>=FIELDS.length) return;
  current = i;
  focusOn(i);
  document.getElementById('fa-hint').classList.add('gone');
  fillDossier(i);
  showPhoto(i);
  syncIndex();
}
function step(dir){
  const pool = FIELDS.map(function(f,i){return i;}).filter(function(i){return activeTiers.has(FIELDS[i].tier);});
  if(!pool.length) return;
  const at = pool.indexOf(current);
  const ni = pool[(at + dir + pool.length) % pool.length];
  current = ni; focusOn(ni); document.getElementById('fa-hint').classList.add('gone'); fillDossier(ni); syncIndex();
}
const select = selectSite;
D('fa-photo-more').onclick = openRecord;
D('fa-photo-close').onclick = hidePhoto;
D('fa-photo-back').onclick = hidePhoto;
D('fa-next').onclick = function(){step(1);};
D('fa-prev').onclick = function(){step(-1);};
D('fa-close').onclick = function(){ dossier.classList.remove('open'); photo.classList.remove('open'); zoomF=1; current=-1; auto=true; tgtX=tgtY=null; syncIndex(); };
document.getElementById('field-app').addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(photo.classList.contains('open')) hidePhoto(); else D('fa-close').click(); }
  if(e.key==='ArrowRight') step(1);
  if(e.key==='ArrowLeft') step(-1);
});

function resize(){
  const w=wrap.clientWidth, h=wrap.clientHeight;
  if(!w||!h) return;
  camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
  const s = Math.min(1, w/1100);
  baseZ = 470 / Math.max(.62, s*0.9 + .2);
}
addEventListener('resize',resize);
if(window.ResizeObserver){ new ResizeObserver(resize).observe(wrap); }
resize();

const clock = new THREE.Clock();
(function loop(){
  requestAnimationFrame(loop);
  if(wrap.offsetParent===null || !wrap.clientWidth || document.hidden){ return; }
  const t = clock.getElapsedTime();

  if(tgtY!==null){
    rotY += (tgtY-rotY)*0.075; rotX += (tgtX-rotX)*0.075;
    if(Math.abs(tgtY-rotY)<0.002){ tgtY=tgtX=null; }
  } else if(auto && !drag){ rotY += 0.0012; }
  else if(!drag){ rotY += vel; vel *= 0.94; }

  globe.rotation.set(rotX, rotY, 0);
  camera.position.z += (baseZ*zoomF - camera.position.z)*0.08;

  markers.forEach(function(m){
    if(!m.visible) return;
    const facing = m.dir.clone().applyEuler(globe.rotation).z;
    const front = Math.max(0, (facing-0.02)/0.98);
    const on = m.i===current;
    m.emb.material.opacity = 0.3 + front*0.7;
    m.emb.scale.setScalar(on ? 1.5 + 0.06*Math.sin(t*3) : 1);
    m.core.material.opacity = (0.28 + 0.25*Math.sin(t*2 + m.phase)) * front * (on?1.7:1);
    m.core.scale.setScalar(on ? 1.5 : 1);
    const beat = (t*0.55 + m.phase) % 1;
    m.rings.forEach(function(r,k){
      const b = (beat + k*0.5) % 1;
      const s = (on?1.5:1) * (1 + b*(on?2.6:1.5));
      r.scale.set(s,s,1);
      r.material.opacity = (1-b) * front * (on?0.8:0.32);
    });
    m.halo.material.opacity = on ? (0.4+0.2*Math.sin(t*2.4))*front : 0;
    m.halo.scale.setScalar(on ? 1.5+0.06*Math.sin(t*2.4) : 1);
  });

  renderer.render(scene,camera);
})();

buildIndex();
syncMarkers();
})();

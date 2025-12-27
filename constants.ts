import { Hotspot, Guide, BirdSpecies, LibraryBook } from './types';

export const HOTSPOTS: Hotspot[] = [
  {
    id: '1',
    name: 'Mabamba Swamp',
    country: 'Uganda',
    description: 'A large wetland on the edge of Lake Victoria. Famous for the elusive Shoebill Stork. Eco-tourism is well developed here, though facing pressure from increasing activity.',
    keySpecies: ['Shoebill', 'Papyrus Gonolek', 'Blue-breasted Bee-eater', 'African Marsh Harrier'],
    coordinates: { lat: 0.093, lng: 32.234 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Mabamba_Swamp.jpg/1280px-Mabamba_Swamp.jpg',
    difficulty: 'Easy'
  },
  {
    id: 'kazinga',
    name: 'Kazinga Channel (QENP)',
    country: 'Uganda',
    description: 'A 32km waterway connecting Lake George to Lake Edward. Home to the largest concentration of Hippos and significant waterbird populations including African Skimmers and Gull-billed Terns.',
    keySpecies: ['African Skimmer', 'Pied Kingfisher', 'Gull-billed Tern', 'Pink-backed Pelican'],
    coordinates: { lat: -0.207, lng: 29.883 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Kazinga_Channel.jpg/1280px-Kazinga_Channel.jpg',
    difficulty: 'Easy'
  },
  {
    id: 'munyanyange',
    name: 'Munyanyange Crater Lake',
    country: 'Uganda',
    description: 'A seasonal saline crater lake north of Mweya Peninsula. A critical roosting site for Lesser Flamingos, though numbers have fluctuated significantly in recent years.',
    keySpecies: ['Lesser Flamingo', 'Black-winged Stilt', 'Pied Avocet', 'Egyptian Goose'],
    coordinates: { lat: -0.149, lng: 29.883 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Lake_Munyanyange_Flamingos.jpg/1280px-Lake_Munyanyange_Flamingos.jpg',
    difficulty: 'Easy'
  },
  {
    id: 'mburo',
    name: 'Lake Mburo National Park',
    country: 'Uganda',
    description: 'A gem in western Uganda with woodland interspersed with papyrus wetlands. The best place to see the African Finfoot and Red-faced Barbet.',
    keySpecies: ['African Finfoot', 'White-backed Night Heron', 'Red-faced Barbet', 'Papyrus Gonolek'],
    coordinates: { lat: -0.605, lng: 30.957 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lake_Mburo_National_Park.jpg/1280px-Lake_Mburo_National_Park.jpg',
    difficulty: 'Moderate'
  },
  {
    id: 'murchison',
    name: 'Murchison Falls - Nile Delta',
    country: 'Uganda',
    description: 'The delta area where the Victoria Nile enters Lake Albert. A key stronghold for the Shoebill and huge congregations of waterbirds.',
    keySpecies: ['Shoebill', 'Pel\'s Fishing Owl', 'Red-throated Bee-eater', 'Goliath Heron'],
    coordinates: { lat: 2.283, lng: 31.466 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Murchison_Falls_National_Park.jpg/1280px-Murchison_Falls_National_Park.jpg',
    difficulty: 'Moderate'
  },
  {
    id: 'kibimba',
    name: 'Kibimba Rice Scheme',
    country: 'Uganda',
    description: 'An Important Bird Area (IBA) in eastern Uganda. Rice paddies support massive numbers of Grey Crowned Cranes and migrants, though the dam faces threats from invasive Salvinia weed.',
    keySpecies: ['Grey Crowned Crane', 'Glossy Ibis', 'Black-tailed Godwit', 'Wood Sandpiper'],
    coordinates: { lat: 0.533, lng: 33.866 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rice_paddies_Uganda.jpg/1280px-Rice_paddies_Uganda.jpg',
    difficulty: 'Easy'
  },
  {
    id: '2',
    name: 'Bwindi Impenetrable Forest',
    country: 'Uganda',
    description: 'Prime montane forest famous for Gorillas and Albertine Rift endemics.',
    keySpecies: ['African Green Broadbill', 'Shelley’s Crimsonwing'],
    coordinates: { lat: -1.053, lng: 29.615 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bwindi_Impenetrable_National_Park.jpg/1280px-Bwindi_Impenetrable_National_Park.jpg',
    difficulty: 'Hard'
  },
  {
    id: '3',
    name: 'Nyungwe National Park',
    country: 'Rwanda',
    description: 'A vast untouched tropical rainforest with a high canopy walk.',
    keySpecies: ['Rwenzori Turaco', 'Red-collared Babbler'],
    coordinates: { lat: -2.483, lng: 29.231 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nyungwe_Forest_Canopy_Walk.jpg/1280px-Nyungwe_Forest_Canopy_Walk.jpg',
    difficulty: 'Moderate'
  }
];

export const GUIDES: Guide[] = [
  {
    id: 'g1',
    name: 'Moses K.',
    location: 'Entebbe, Uganda',
    rating: 4.9,
    specialties: ['Wetlands', 'Shoebill'],
    imageUrl: 'https://picsum.photos/200/200?random=5'
  },
  {
    id: 'g2',
    name: 'Grace A.',
    location: 'Kigali, Rwanda',
    rating: 4.8,
    specialties: ['Montane Forest', 'Photography'],
    imageUrl: 'https://picsum.photos/200/200?random=6'
  },
  {
    id: 'g3',
    name: 'John B.',
    location: 'Bwindi, Uganda',
    rating: 5.0,
    specialties: ['Endemics', 'Hiking'],
    imageUrl: 'https://picsum.photos/200/200?random=7'
  }
];

export const RECOMMENDED_BOOKS: LibraryBook[] = [
  {
    id: 'lib1',
    title: 'Birds of East Africa',
    authors: 'Terry Stevenson & John Fanshawe',
    year: '2020',
    type: 'Field Guide',
    description: 'Widely considered the definitive field guide for the region. It covers over 1,300 species found in Kenya, Tanzania, Uganda, Rwanda, and Burundi. Known for its incredible detail in text and maps.',
    recommendedFor: 'Serious birders and professionals requiring the most comprehensive identification details.'
  },
  {
    id: 'lib2',
    title: 'Birds of Eastern Africa',
    authors: 'Ber Van Perlo',
    year: '2009',
    type: 'Field Guide',
    description: 'An illustrated guide featuring comprehensive plates. It is lighter than Stevenson & Fanshawe but covers a vast geographic area. Excellent for quick visual comparisons of similar species.',
    recommendedFor: 'Visual learners who prefer illustrated plates over dense text.'
  },
  {
    id: 'lib3',
    title: 'Birds of Uganda: A Perfect Safari Companion',
    authors: 'Quentin Meunier & Sherry McKelvie',
    year: '2015',
    type: 'Regional Specialist',
    description: 'A specialized guide focusing specifically on the Ugandan context. It highlights key habitats and gives specific location data relevant to safaris in Uganda.',
    recommendedFor: 'Travelers focusing solely on Uganda who want context on specific safari circuits.'
  },
  {
    id: 'lib4',
    title: 'Pocket Guide: Birds of East Africa',
    authors: 'Dave Richards',
    year: '2016',
    type: 'Pocket Guide',
    description: 'A photographic guide featuring 296 of the most commonly seen species. Compact and travel-friendly, utilizing high-quality photographs rather than illustrations.',
    recommendedFor: 'Casual birders, tourists, and those carrying light gear who want to identify common birds.'
  }
];

export const BIRD_SPECIES: BirdSpecies[] = [
  {
    id: 'b1',
    commonName: 'Shoebill',
    scientificName: 'Balaeniceps rex',
    description: 'A massive, prehistoric-looking bird with a towering stature and slate-grey plumage. Its most defining feature is the enormous, shoe-shaped bill. Listed as Endangered in Uganda (2019 report).',
    category: 'Waterbird',
    colors: ['Grey', 'Blue'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Balaeniceps_rex.jpg/800px-Balaeniceps_rex.jpg',
    size: 'Very Large (1.5m)',
    status: 'Endangered',
    distribution: 'Mabamba Swamp, Murchison Falls (Delta), Lake Mburo, Akagera.',
    habitat: 'Freshwater swamps, specifically those with extensive papyrus beds.',
    iucnStatus: 'VU'
  },
  {
    id: 'b2',
    commonName: 'Grey Crowned Crane',
    scientificName: 'Balearica regulorum',
    description: 'Uganda\'s National Bird. A majestic bird with slate-grey feathers and a golden-yellow crest. Large populations found in Kibimba and Doho Rice Schemes.',
    category: 'Waterbird',
    colors: ['Grey', 'Gold', 'White', 'Red'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Grey_crowned_crane_%28Balearica_regulorum_gibbericeps%29_head.jpg/800px-Grey_crowned_crane_%28Balearica_regulorum_gibbericeps%29_head.jpg',
    size: 'Large (1m)',
    status: 'Endangered',
    distribution: 'Wetlands and grasslands throughout Uganda. Significant numbers at Kaku Wetland and Kibimba.',
    habitat: 'Dry and wet open habitats, preferring marshes and damp grasslands.',
    iucnStatus: 'EN'
  },
  {
    id: 'b3',
    commonName: 'Great Blue Turaco',
    scientificName: 'Corythaeola cristata',
    description: 'The largest of the turacos, boasting vibrant turquoise-blue upperparts and a prominent blue-black crest.',
    category: 'Forest',
    colors: ['Blue', 'Yellow', 'Red'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Great_Blue_Turaco.jpg/800px-Great_Blue_Turaco.jpg',
    size: 'Large (75cm)',
    status: 'Common',
    distribution: 'Kibale Forest, Bigodi Wetland, Nyungwe Forest.',
    habitat: 'Montane and lowland tropical rainforests.',
    iucnStatus: 'LC'
  },
  {
    id: 'b28',
    commonName: 'African Skimmer',
    scientificName: 'Rynchops flavirostris',
    description: 'A tern-like bird with a unique bill where the lower mandible projects further than the upper. A conservation concern in the region.',
    category: 'Waterbird',
    colors: ['Black', 'White', 'Red'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/African_Skimmer_%28Rynchops_flavirostris%29.jpg/800px-African_Skimmer_%28Rynchops_flavirostris%29.jpg',
    size: 'Medium (40cm)',
    status: 'Rare',
    distribution: 'Kazinga Channel (QENP) and Murchison Falls Nile Delta.',
    habitat: 'Large rivers and lakes with sandbars for nesting.',
    iucnStatus: 'VU'
  },
  {
    id: 'b27',
    commonName: 'Lesser Flamingo',
    scientificName: 'Phoeniconaias minor',
    description: 'The smallest flamingo, distinguished by its deep pink plumage. Numbers in Queen Elizabeth NP have fluctuated, often found in saline craters like Nshenyi and Munyanyange.',
    category: 'Waterbird',
    colors: ['Pink', 'Red', 'White'],
    regions: ['Uganda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Lesser_Flamingo_%28Phoeniconaias_minor%29.jpg/800px-Lesser_Flamingo_%28Phoeniconaias_minor%29.jpg',
    size: 'Medium (90cm)',
    status: 'Common',
    distribution: 'Queen Elizabeth National Park crater lakes (Katwe, Munyanyange, Nshenyi).',
    habitat: 'Saline or alkaline lakes and lagoons.',
    iucnStatus: 'NT'
  },
  {
    id: 'b29',
    commonName: 'African Finfoot',
    scientificName: 'Podica senegalensis',
    description: 'A secretive aquatic bird with a long red bill and bright red legs. Lake Mburo is one of the best places to spot this elusive species.',
    category: 'Waterbird',
    colors: ['Brown', 'White', 'Red'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/African_Finfoot_%28Podica_senegalensis%29.jpg/800px-African_Finfoot_%28Podica_senegalensis%29.jpg',
    size: 'Medium (50cm)',
    status: 'Rare',
    distribution: 'Lake Mburo is the best spot; also Murchison Falls.',
    habitat: 'Quiet wooded streams, rivers, and lake edges with overhanging cover.',
    iucnStatus: 'NT'
  },
  {
    id: 'b20',
    commonName: 'Papyrus Gonolek',
    scientificName: 'Laniarius mufumbiri',
    description: 'A striking bush-shrike with a jet-black head and vivid crimson-red underparts. A papyrus specialist.',
    category: 'Waterbird',
    colors: ['Black', 'Red', 'Yellow'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Papyrus_Gonolek.jpg/800px-Papyrus_Gonolek.jpg',
    size: 'Medium (18cm)',
    status: 'Rare',
    distribution: 'Papyrus swamps; Mabamba, Lake Mburo, Queen Elizabeth NP.',
    habitat: 'Strictly limited to Papyrus swamps.',
    iucnStatus: 'NT'
  },
  {
    id: 'b5',
    commonName: 'African Fish Eagle',
    scientificName: 'Haliaeetus vocifer',
    description: 'An iconic raptor with a distinctive snow-white head and chestnut body. Its call is the "sound of Africa".',
    category: 'Raptor',
    colors: ['Brown', 'White', 'Black'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Haliaeetus_vocifer_-_Chobe_01.jpg/800px-Haliaeetus_vocifer_-_Chobe_01.jpg',
    size: 'Large (70cm)',
    status: 'Common',
    distribution: 'Lake Victoria, Kazinga Channel, Lake Mburo.',
    habitat: 'Large bodies of open water with tall trees.',
    iucnStatus: 'LC'
  },
  {
    id: 'b32',
    commonName: 'Palm-nut Vulture',
    scientificName: 'Gypohierax angolensis',
    description: 'A distinctive raptor with white plumage and black flight feathers. Often found near palm trees.',
    category: 'Raptor',
    colors: ['White', 'Black', 'Red'],
    regions: ['Uganda', 'Rwanda'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Palm-nut_Vulture_%28Gypohierax_angolensis%29.jpg/800px-Palm-nut_Vulture_%28Gypohierax_angolensis%29.jpg',
    size: 'Large (60cm)',
    status: 'Common',
    distribution: 'Murchison Falls, Queen Elizabeth NP, Semliki.',
    habitat: 'Areas with oil palms, often near water.',
    iucnStatus: 'LC'
  }
];
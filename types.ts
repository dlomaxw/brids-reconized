export interface BirdSighting {
  id: string;
  speciesName: string;
  scientificName?: string;
  location: string;
  timestamp: number;
  confidence: number;
  imageUrl?: string;
  notes?: string;
  type: 'audio' | 'image' | 'manual';
}

export interface Hotspot {
  id: string;
  name: string;
  country: 'Uganda' | 'Rwanda';
  description: string;
  keySpecies: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface Guide {
  id: string;
  name: string;
  location: string;
  rating: number;
  specialties: string[];
  imageUrl: string;
}

export interface BirdSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  category: string;
  colors: string[];
  regions: ('Uganda' | 'Rwanda')[];
  imageUrl: string;
  size: string;
  status: 'Common' | 'Rare' | 'Endangered' | 'Endemic';
  distribution: string;
  habitat: string;
  iucnStatus: 'LC' | 'NT' | 'VU' | 'EN' | 'CR';
}

export enum AppView {
  HOME = 'HOME',
  LIVE_ID = 'LIVE_ID',
  PHOTO_ID = 'PHOTO_ID',
  HOTSPOTS = 'HOTSPOTS',
  NOTEBOOK = 'NOTEBOOK',
  GUIDES = 'GUIDES',
  BIRD_GUIDE = 'BIRD_GUIDE'
}
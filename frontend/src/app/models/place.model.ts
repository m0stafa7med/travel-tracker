export interface Place {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  visitDate: string;
  countryId: number;
  countryName: string;
  category: string;
  categoryColor: string;
  images: ImageModel[];
}

export interface PlaceRequest {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  visitDate: string;
  countryId: number;
  category: string;
  categoryColor: string;
}

export interface ImageModel {
  id: number;
  url: string;
  fileName: string;
}

export interface Stats {
  totalCountries: number;
  visitedCountries: number;
  totalPlaces: number;
  visitedPercentage: number;
  lastAddedPlace: Place | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

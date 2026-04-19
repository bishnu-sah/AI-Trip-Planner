export enum AdapterChoice {
  Mock = 'mock',
  Real = 'real'
}

export type FeatureToggles = {
  placeSearch: boolean;
  trips: boolean;
  weather: boolean;
  pdfExport: boolean;
  chatAssistant: boolean;
  hotels: boolean;
};

export type AdapterConfig = {
  places: AdapterChoice;
  ai: AdapterChoice;
  weather: AdapterChoice;
  distance: AdapterChoice;
};

export type FeatureConfig = {
  mockMode: boolean;
  adapters: AdapterConfig;
  features: FeatureToggles;
};


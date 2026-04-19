export type FeatureToggles = {
  placeSearch: boolean;
  trips: boolean;
  weather: boolean;
  pdfExport: boolean;
  chatAssistant: boolean;
  hotels: boolean;
};

export type FrontendConfig = {
  mockMode: boolean;
  features: FeatureToggles;
};

export const featureConfig: FrontendConfig = {
  mockMode: true,
  features: {
    placeSearch: true,
    trips: true,
    weather: true,
    pdfExport: true,
    chatAssistant: true,
    hotels: true
  }
};


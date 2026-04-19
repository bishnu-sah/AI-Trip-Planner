import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { featureConfig, FeatureToggles } from '../config/feature.config';

type FeatureContextState = {
  features: FeatureToggles;
  mockMode: boolean;
  setMockMode: (value: boolean) => void;
};

const FeatureToggleContext = createContext<FeatureContextState | undefined>(undefined);

export const FeatureToggleProvider = ({ children }: { children: ReactNode }) => {
  const [mockMode, setMockMode] = useState(featureConfig.mockMode);
  const value = useMemo(
    () => ({ features: featureConfig.features, mockMode, setMockMode }),
    [mockMode]
  );
  return <FeatureToggleContext.Provider value={value}>{children}</FeatureToggleContext.Provider>;
};

export const useFeatures = () => {
  const ctx = useContext(FeatureToggleContext);
  if (!ctx) throw new Error('FeatureToggleContext missing');
  return ctx;
};


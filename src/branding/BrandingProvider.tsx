import React, { createContext, useContext } from 'react';
import { Branding } from './Branding';

const BrandingContext = createContext(Branding);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrandingContext.Provider value={Branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBrandingContext = () => useContext(BrandingContext);

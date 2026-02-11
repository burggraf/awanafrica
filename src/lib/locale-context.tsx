import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from './i18n';

export type Region = 'TZ' | 'KE' | 'ZM' | 'ZW' | 'US';

interface RegionInfo {
  name: string;
  flag: string;
  currency: string;
  locale: string; // e.g., 'en-TZ' or 'sw-TZ'
}

export const regions: Record<Region, RegionInfo> = {
  TZ: { name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', locale: 'en-TZ' },
  KE: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', locale: 'en-KE' },
  ZM: { name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', locale: 'en-ZM' },
  ZW: { name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD', locale: 'en-ZW' },
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
};

interface LocaleContextType {
  region: Region;
  setRegion: (region: Region) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string | number) => string;
  formatNumber: (num: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<Region>(() => {
    return (localStorage.getItem('app-region') as Region) || 'TZ';
  });

  const setRegion = (newRegion: Region) => {
    localStorage.setItem('app-region', newRegion);
    setRegionState(newRegion);
  };

  // The actual locale string used for Intl APIs
  // We combine current i18n language with the selected region
  const getFullLocale = () => {
    const lang = i18n.language.split('-')[0]; // get 'en' from 'en-US'
    return `${lang}-${region}`;
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(getFullLocale(), {
        style: 'currency',
        currency: regions[region].currency,
      }).format(amount);
    } catch (e) {
      return `${regions[region].currency} ${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date | string | number) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(getFullLocale(), {
      dateStyle: 'medium',
    }).format(d);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(getFullLocale()).format(num);
  };

  return (
    <LocaleContext.Provider value={{ region, setRegion, formatCurrency, formatDate, formatNumber }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

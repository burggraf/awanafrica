import { createContext, useContext, useState } from 'react';
import i18n from './i18n';

export type Country = 'TZ' | 'KE' | 'ZM' | 'ZW' | 'LS' | 'US';

interface CountryInfo {
  name: string;
  flag: string;
  currency: string;
  locale: string; // e.g., 'en-TZ' or 'sw-TZ'
}

export const countries: Record<Country, CountryInfo> = {
  TZ: { name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', locale: 'en-TZ' },
  KE: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', locale: 'en-KE' },
  ZM: { name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', locale: 'en-ZM' },
  ZW: { name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD', locale: 'en-ZW' },
  LS: { name: 'Lesotho', flag: '🇱🇸', currency: 'LSL', locale: 'en-LS' },
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
};

interface LocaleContextType {
  country: Country;
  setCountry: (country: Country) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string | number) => string;
  formatNumber: (num: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountryState] = useState<Country>(() => {
    return (localStorage.getItem('app-country') as Country) || 'TZ';
  });

  const setCountry = (newCountry: Country) => {
    localStorage.setItem('app-country', newCountry);
    setCountryState(newCountry);
  };

  // The actual locale string used for Intl APIs
  // We combine current i18n language with the selected country
  const getFullLocale = () => {
    const lang = i18n.language.split('-')[0]; // get 'en' from 'en-US'
    return `${lang}-${country}`;
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(getFullLocale(), {
        style: 'currency',
        currency: countries[country].currency,
      }).format(amount);
    } catch (e) {
      return `${countries[country].currency} ${amount.toFixed(2)}`;
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
    <LocaleContext.Provider value={{ country, setCountry, formatCurrency, formatDate, formatNumber }}>
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

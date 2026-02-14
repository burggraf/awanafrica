import { createContext, useContext, useState, useEffect } from 'react';
import i18n from './i18n';
import { pb } from './pb';

export interface CountryInfo {
  name: string;
  flag: string;
  currency: string;
  locale: string;
}

// Comprehensive map of African countries + US (for development/testing)
// This provides the metadata (flags/currencies) for formatting.
export const countryMetadata: Record<string, CountryInfo> = {
  DZ: { name: 'Algeria', flag: '🇩🇿', currency: 'DZD', locale: 'ar-DZ' },
  AO: { name: 'Angola', flag: '🇦🇴', currency: 'AOA', locale: 'pt-AO' },
  BJ: { name: 'Benin', flag: '🇧🇯', currency: 'XOF', locale: 'fr-BJ' },
  BW: { name: 'Botswana', flag: '🇧🇼', currency: 'BWP', locale: 'en-BW' },
  BF: { name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF', locale: 'fr-BF' },
  BI: { name: 'Burundi', flag: '🇧🇮', currency: 'BIF', locale: 'fr-BI' },
  CV: { name: 'Cabo Verde', flag: '🇨🇻', currency: 'CVE', locale: 'pt-CV' },
  CM: { name: 'Cameroon', flag: '🇨🇲', currency: 'XAF', locale: 'fr-CM' },
  CF: { name: 'Central African Republic', flag: '🇨🇫', currency: 'XAF', locale: 'fr-CF' },
  TD: { name: 'Chad', flag: '🇹🇩', currency: 'XAF', locale: 'fr-TD' },
  KM: { name: 'Comoros', flag: '🇰🇲', currency: 'KMF', locale: 'ar-KM' },
  CG: { name: 'Congo', flag: '🇨🇬', currency: 'XAF', locale: 'fr-CG' },
  CD: { name: 'Congo (DRC)', flag: '🇨🇩', currency: 'CDF', locale: 'fr-CD' },
  DJ: { name: 'Djibouti', flag: '🇩🇯', currency: 'DJF', locale: 'fr-DJ' },
  EG: { name: 'Egypt', flag: '🇪🇬', currency: 'EGP', locale: 'ar-EG' },
  GQ: { name: 'Equatorial Guinea', flag: '🇬🇶', currency: 'XAF', locale: 'es-GQ' },
  ER: { name: 'Eritrea', flag: '🇪🇷', currency: 'ERN', locale: 'ti-ER' },
  SZ: { name: 'Eswatini', flag: '🇸🇿', currency: 'SZL', locale: 'en-SZ' },
  ET: { name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB', locale: 'am-ET' },
  GA: { name: 'Gabon', flag: '🇬🇦', currency: 'XAF', locale: 'fr-GA' },
  GM: { name: 'Gambia', flag: '🇬🇲', currency: 'GMD', locale: 'en-GM' },
  GH: { name: 'Ghana', flag: '🇬🇭', currency: 'GHS', locale: 'en-GH' },
  GN: { name: 'Guinea', flag: '🇬🇳', currency: 'GNF', locale: 'fr-GN' },
  GW: { name: 'Guinea-Bissau', flag: '🇬🇼', currency: 'XOF', locale: 'pt-GW' },
  CI: { name: 'Ivory Coast', flag: '🇨🇮', currency: 'XOF', locale: 'fr-CI' },
  KE: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', locale: 'en-KE' },
  LS: { name: 'Lesotho', flag: '🇱🇸', currency: 'LSL', locale: 'en-LS' },
  LR: { name: 'Liberia', flag: '🇱🇷', currency: 'LRD', locale: 'en-LR' },
  LY: { name: 'Libya', flag: '🇱🇾', currency: 'LYD', locale: 'ar-LY' },
  MG: { name: 'Madagascar', flag: '🇲🇬', currency: 'MGA', locale: 'fr-MG' },
  MW: { name: 'Malawi', flag: '🇲🇼', currency: 'MWK', locale: 'en-MW' },
  ML: { name: 'Mali', flag: '🇲🇱', currency: 'XOF', locale: 'fr-ML' },
  MR: { name: 'Mauritania', flag: '🇲🇷', currency: 'MRU', locale: 'ar-MR' },
  MU: { name: 'Mauritius', flag: '🇲🇺', currency: 'MUR', locale: 'en-MU' },
  MA: { name: 'Morocco', flag: '🇲🇦', currency: 'MAD', locale: 'ar-MA' },
  MZ: { name: 'Mozambique', flag: '🇲🇿', currency: 'MZN', locale: 'pt-MZ' },
  NA: { name: 'Namibia', flag: '🇳🇦', currency: 'NAD', locale: 'en-NA' },
  NE: { name: 'Niger', flag: '🇳🇪', currency: 'XOF', locale: 'fr-NE' },
  NG: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', locale: 'en-NG' },
  RW: { name: 'Rwanda', flag: '🇷🇼', currency: 'RWF', locale: 'en-RW' },
  ST: { name: 'Sao Tome and Principe', flag: '🇸🇹', currency: 'STN', locale: 'pt-ST' },
  SN: { name: 'Senegal', flag: '🇸🇳', currency: 'XOF', locale: 'fr-SN' },
  SC: { name: 'Seychelles', flag: '🇸🇨', currency: 'SCR', locale: 'en-SC' },
  SL: { name: 'Sierra Leone', flag: '🇸🇱', currency: 'SLL', locale: 'en-SL' },
  SO: { name: 'Somalia', flag: '🇸🇴', currency: 'SOS', locale: 'so-SO' },
  ZA: { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', locale: 'en-ZA' },
  SS: { name: 'South Sudan', flag: '🇸🇸', currency: 'SSP', locale: 'en-SS' },
  SD: { name: 'Sudan', flag: '🇸🇩', currency: 'SDG', locale: 'ar-SD' },
  TZ: { name: 'Tanzania', flag: '🇹🇿', currency: 'TZS', locale: 'en-TZ' },
  TG: { name: 'Togo', flag: '🇹🇬', currency: 'XOF', locale: 'fr-TG' },
  TN: { name: 'Tunisia', flag: '🇹🇳', currency: 'TND', locale: 'ar-TN' },
  UG: { name: 'Uganda', flag: '🇺🇬', currency: 'UGX', locale: 'en-UG' },
  ZM: { name: 'Zambia', flag: '🇿🇲', currency: 'ZMW', locale: 'en-ZM' },
  ZW: { name: 'Zimbabwe', flag: '🇿🇼', currency: 'ZWG', locale: 'en-ZW' },
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
};

interface LocaleContextType {
  country: string;
  setCountry: (country: string) => void;
  availableCountries: Array<{ id: string, name: string, isoCode: string }>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string | number) => string;
  formatNumber: (num: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountryState] = useState<string>(() => {
    return localStorage.getItem('app-country') || 'TZ';
  });
  const [availableCountries, setAvailableCountries] = useState<Array<{ id: string, name: string, isoCode: string }>>([]);

  useEffect(() => {
    // Fetch countries from PocketBase to populate selection
    // We use requestKey: null to prevent auto-cancellation issues during strict mode/concurrent renders
    pb.collection('countries').getFullList({ sort: 'name', requestKey: null })
      .then(records => {
        setAvailableCountries(records.map(r => ({
          id: r.id,
          name: r.name,
          isoCode: r.isoCode
        })));
      })
      .catch(err => {
        if (!err.isAbort) {
          console.error('Failed to fetch countries:', err);
        }
      });
  }, []);

  const setCountry = (newCountry: string) => {
    localStorage.setItem('app-country', newCountry);
    setCountryState(newCountry);
  };

  const getFullLocale = () => {
    const lang = i18n.language.split('-')[0];
    const meta = countryMetadata[country];
    return meta ? `${lang}-${country}` : `${lang}-US`;
  };

  const formatCurrency = (amount: number) => {
    const meta = countryMetadata[country];
    const currency = meta?.currency || 'USD';
    try {
      return new Intl.NumberFormat(getFullLocale(), {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return `${currency} ${amount.toFixed(2)}`;
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
    <LocaleContext.Provider value={{ country, setCountry, availableCountries, formatCurrency, formatDate, formatNumber }}>
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

import { useTranslation } from 'react-i18next';

export function useFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'sw' ? 'sw-TZ' : 'en-US';
  const currency = i18n.language === 'sw' ? 'TZS' : 'USD';

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(locale, options).format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  const formatDateTime = (date: Date | string | number) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return {
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    locale,
  };
}

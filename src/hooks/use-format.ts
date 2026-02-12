import { useLocale } from '@/lib/locale-context';
import { useTranslation } from 'react-i18next';

export function useFormat() {
  const { region, formatCurrency, formatNumber } = useLocale();
  const { i18n } = useTranslation();

  const getFullLocale = () => {
    const lang = i18n.language.split('-')[0];
    return `${lang}-${region}`;
  };

  const formatDateTime = (date: Date | string | number) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(getFullLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const customFormatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(getFullLocale(), options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  };

  return {
    formatNumber,
    formatCurrency,
    formatDate: customFormatDate,
    formatDateTime,
    locale: getFullLocale(),
  };
}

import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useLocale, countryMetadata } from "@/lib/locale-context"

export function CountryToggle() {
  const { country, setCountry, availableCountries } = useLocale()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
          <span className="text-lg leading-none shrink-0" role="img" aria-label={t('Country')}>
            {countryMetadata[country]?.flag || '🌍'}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {country}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableCountries.map((c) => (
          <DropdownMenuItem key={c.isoCode} onClick={() => setCountry(c.isoCode)} className="gap-2">
            <span className="text-lg">{countryMetadata[c.isoCode]?.flag || '🌍'}</span>
            {t(c.name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

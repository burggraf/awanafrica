import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const { i18n, t } = useTranslation()

  const currentLanguage = i18n.language.startsWith('sw') ? 'sw' : 'en'

  const languages = {
    en: { name: t('English'), flag: "🇺🇸", short: "ENG" },
    sw: { name: t('Swahili'), flag: "🇹🇿", short: "SWA" }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 gap-1">
          <span className="text-lg leading-none shrink-0" role="img" aria-label={t('Language')}>
            {languages[currentLanguage as keyof typeof languages]?.flag || <Languages className="h-4 w-4" />}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {languages[currentLanguage as keyof typeof languages]?.short}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem key={code} onClick={() => i18n.changeLanguage(code)} className="gap-2">
            <span className="text-lg">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

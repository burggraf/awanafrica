import { Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"

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
        <SidebarMenuButton tooltip={t('Language')} className="w-fit px-2">
          <span className="text-lg leading-none shrink-0" role="img" aria-label={t('Language')}>
            {languages[currentLanguage as keyof typeof languages]?.flag || <Languages className="h-4 w-4" />}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono ml-1">
            {languages[currentLanguage as keyof typeof languages]?.short}
          </span>
        </SidebarMenuButton>
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

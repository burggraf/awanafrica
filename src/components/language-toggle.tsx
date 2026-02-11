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

  const flags = {
    en: "🇺🇸",
    sw: "🇹🇿"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton tooltip={t('Language')}>
          <span className="text-lg leading-none" role="img" aria-label={t('Language')}>
            {flags[currentLanguage as keyof typeof flags] || <Languages className="h-[1.2rem] w-[1.2rem]" />}
          </span>
          <span>{t('Language')}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="gap-2">
          <span className="text-lg">🇺🇸</span>
          {t('English')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('sw')} className="gap-2">
          <span className="text-lg">🇹🇿</span>
          {t('Swahili')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useLocale, regions } from "@/lib/locale-context"
import type { Region } from "@/lib/locale-context"

export function RegionToggle() {
  const { region, setRegion } = useLocale()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton tooltip={t('Region')}>
          <span className="text-lg leading-none" role="img" aria-label={t('Region')}>
            {regions[region].flag}
          </span>
          <span>{t('Region')}</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(regions) as Region[]).map((r) => (
          <DropdownMenuItem key={r} onClick={() => setRegion(r)} className="gap-2">
            <span className="text-lg">{regions[r].flag}</span>
            {t(regions[r].name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

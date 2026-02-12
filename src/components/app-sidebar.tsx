import * as React from "react"
import {
  Settings2,
  SquareTerminal,
  Shield,
  Globe,
  Map,
  School,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { NavUser } from "@/components/nav-user"
import { useAdmin } from "@/lib/admin-context"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { CountryToggle } from "@/components/country-toggle"
import { ClubSwitcher } from "@/components/club-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onProfileClick: () => void
  onAuthClick: () => void
  onPageChange: (page: string) => void
}

const APP_VERSION = __APP_VERSION__
const APP_NAME = __APP_NAME__

export function AppSidebar({ onProfileClick, onAuthClick, onPageChange, ...props }: AppSidebarProps) {
  const { t } = useTranslation()
  const { isAdmin, isGlobalAdmin, isCountryAdmin } = useAdmin()

  const navMain = [
    {
      title: t("Dashboard"),
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: t("Settings"),
      url: "/settings",
      icon: Settings2,
    },
  ]

  const navAdmin = [
    {
      title: t("Countries"),
      url: "/admin/countries",
      icon: Globe,
      visible: isGlobalAdmin,
    },
    {
      title: t("Regions"),
      url: "/admin/regions",
      icon: Map,
      visible: isGlobalAdmin || isCountryAdmin,
    },
    {
      title: t("Clubs"),
      url: "/admin/clubs",
      icon: School,
      visible: isAdmin,
    },
  ].filter(item => item.visible)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" onClick={(e) => {
                e.preventDefault()
                onPageChange("dashboard")
              }}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-white">
                  <img src="/logo.svg" alt="AwanAfrica Logo" className="size-full object-cover" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AwanAfrica</span>
                  <span className="truncate text-xs">{t("Community")}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ClubSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                onClick={() => onPageChange(item.url.substring(1))}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {navAdmin.length > 0 && (
          <>
            <SidebarSeparator />
            <div className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-2">
              <Shield className="size-3" />
              <span>{t("Administration")}</span>
            </div>
            <SidebarMenu>
              {navAdmin.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    onClick={() => onPageChange(item.url.substring(1))}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LanguageToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <CountryToggle />
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <div className="px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          <span>{APP_NAME}</span>
          <span>v{APP_VERSION}</span>
        </div>
        <NavUser onProfileClick={onProfileClick} onAuthClick={onAuthClick} />
      </SidebarFooter>
    </Sidebar>
  )
}

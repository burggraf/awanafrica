import * as React from "react"
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { NavUser } from "@/components/nav-user"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
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

export function AppSidebar({ onProfileClick, onAuthClick, onPageChange, ...props }: AppSidebarProps) {
  const { t } = useTranslation()

  const navMain = [
    {
      title: t("Dashboard"),
      url: "#",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: t("Models"),
      url: "#",
      icon: Bot,
    },
    {
      title: t("Documentation"),
      url: "#",
      icon: BookOpen,
    },
    {
      title: t("Settings"),
      url: "#",
      icon: Settings2,
    },
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} onClick={() => onPageChange(item.title)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex gap-2 px-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
              <div className="flex-1">
                <ModeToggle />
              </div>
              <div className="flex-1">
                <LanguageToggle />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <NavUser onProfileClick={onProfileClick} onAuthClick={onAuthClick} />
      </SidebarFooter>
    </Sidebar>
  )
}

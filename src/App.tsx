import { useState } from "react"
import { 
  Menu, 
  MoreVertical, 
  Settings, 
} from "lucide-react"
import { 
  SidebarProvider, 
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthModal } from "@/components/auth-modal"
import { ProfileScreen } from "@/components/profile-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

import { useTranslation } from "react-i18next"

import { useFormat } from "@/hooks/use-format"

const APP_VERSION = __APP_VERSION__
const APP_NAME = __APP_NAME__

function MainContent() {
  const { t } = useTranslation()
  const { formatCurrency, formatDateTime } = useFormat()
  const [activePage, setActivePage] = useState("Dashboard")
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case "Profile":
        return <ProfileScreen />
      case "Dashboard":
        return (
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold">{t("Welcome to Dashboard")}</h2>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Balance")}</p>
                <p className="text-xl font-bold">{formatCurrency(1250.50)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Last Login")}</p>
                <p className="text-sm font-medium">{formatDateTime(new Date())}</p>
              </div>
            </div>
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i} className="text-muted-foreground">
                {t("scrollable content", { index: i + 1 })}
              </p>
            ))}
          </div>
        )
      default:
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold">{t(activePage)}</h2>
            <p className="text-muted-foreground">{t("under construction")}</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* iOS Style Header */}
      <header className="h-12 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex-1 flex justify-start">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 transition-transform duration-500 ease-in-out">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarProvider>
                <AppSidebar 
                  onProfileClick={() => {
                    setActivePage("Profile")
                    setIsSidebarOpen(false)
                  }} 
                  onAuthClick={() => {
                    setIsAuthOpen(true)
                    setIsSidebarOpen(false)
                  }}
                  onPageChange={(page) => {
                    setActivePage(page)
                    setIsSidebarOpen(false)
                  }}
                />
              </SidebarProvider>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex-1 flex justify-center">
          <h1 className="font-semibold text-lg truncate">{activePage === "Profile" ? t("User Profile") : t(activePage)}</h1>
        </div>

        <div className="flex-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActivePage("Dashboard")}>
                {t("Refresh")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAuthOpen(true)}>
                {t("Switch Account")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pt-safe pb-safe">
        {renderPage()}
      </main>

      {/* iOS Style Footer */}
      <footer className="h-14 border-t flex items-center justify-between px-4 sticky bottom-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex-1 text-xs text-muted-foreground">
          v{APP_VERSION}
        </div>
        
        <div className="flex-1 flex justify-center items-center gap-2">
          <div className="size-6 flex items-center justify-center rounded-sm overflow-hidden bg-white shrink-0">
            <img src="/logo.svg" alt="Logo" className="size-full object-cover" />
          </div>
          <span className="font-medium text-sm">{APP_NAME}</span>
        </div>

        <div className="flex-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActivePage("Settings")}>
                {t("App Settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAuthOpen(true)}>
                {t("Account Settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.reload()}>
                {t("Restart App")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <MainContent />
    </ThemeProvider>
  )
}

export default App

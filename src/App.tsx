import { useState, useEffect, useMemo } from "react"
import { 
  Menu, 
  MoreVertical, 
  Settings, 
} from "lucide-react"
import { 
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
} from "react-router-dom"
import { 
  SidebarProvider, 
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthModal } from "@/components/auth-modal"
import { ProfileScreen } from "@/components/profile-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/lib/locale-context"
import { ClubProvider } from "@/lib/club-context"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

import { useTranslation } from "react-i18next"

import { LayoutProvider, useLayout } from "@/lib/layout-context"

const APP_VERSION = __APP_VERSION__
const APP_NAME = __APP_NAME__

function MainContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    showFooter, 
    headerTitle,
    headerRight,
    headerLeft,
    footerLeft,
    footerCenter,
    footerRight,
    resetLayout 
  } = useLayout()
  
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Derive active page title from location for the header
  const activePageTitle = useMemo(() => {
    const path = location.pathname.substring(1) || "Dashboard"
    // Capitalize first letter for the title
    return path.charAt(0).toUpperCase() + path.slice(1)
  }, [location.pathname])

  // Reset layout on page change
  useEffect(() => {
    resetLayout()
  }, [location.pathname, resetLayout])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* iOS Style Header */}
      <header className="h-12 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex-1 flex justify-start">
          {headerLeft || (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 transition-transform duration-500 ease-in-out">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for AwanAfrica app.
                </SheetDescription>
                <SidebarProvider>
                  <AppSidebar 
                    onProfileClick={() => {
                      navigate("/profile")
                      setIsSidebarOpen(false)
                    }} 
                    onAuthClick={() => {
                      setIsAuthOpen(true)
                      setIsSidebarOpen(false)
                    }}
                    onPageChange={(page) => {
                      // page here comes from the sidebar title, we should probably change how sidebar works
                      // but for now let's just lowercase it
                      navigate(`/${page.toLowerCase()}`)
                      setIsSidebarOpen(false)
                    }}
                  />
                </SidebarProvider>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex-1 flex justify-center">
          <h1 className="font-semibold text-lg truncate">
            {headerTitle || (activePageTitle === "Profile" ? t("User Profile") : t(activePageTitle))}
          </h1>
        </div>

        <div className="flex-1 flex justify-end">
          {headerRight || (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(0)}>
                  {t("Refresh")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAuthOpen(true)}>
                  {t("Switch Account")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pt-safe pb-safe">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="*" element={
            <div className="p-4">
              <h2 className="text-2xl font-bold">{t(activePageTitle)}</h2>
              <p className="text-muted-foreground">{t("under construction")}</p>
            </div>
          } />
        </Routes>
      </main>

      {/* iOS Style Footer */}
      {showFooter && (
        <footer className="h-14 border-t flex items-center justify-between px-4 sticky bottom-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex-1 text-xs text-muted-foreground">
            {footerLeft || `v${APP_VERSION}`}
          </div>
          
          <div className="flex-1 flex justify-center items-center gap-2">
            {footerCenter || (
              <>
                <div className="size-6 flex items-center justify-center rounded-sm overflow-hidden bg-white shrink-0">
                  <img src="/logo.svg" alt="Logo" className="size-full object-cover" />
                </div>
                <span className="font-medium text-sm">{APP_NAME}</span>
              </>
            )}
          </div>

          <div className="flex-1 flex justify-end">
            {footerRight || (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
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
            )}
          </div>
        </footer>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <LocaleProvider>
        <ClubProvider>
          <LayoutProvider>
            <BrowserRouter>
              <MainContent />
            </BrowserRouter>
          </LayoutProvider>
        </ClubProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}

export default App

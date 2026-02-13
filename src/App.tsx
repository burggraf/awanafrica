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
import { OnboardingModal } from "@/components/onboarding-modal"
import { ProfileScreen } from "@/components/profile-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { CountryManagement } from "@/components/admin/country-management"
import { RegionManagement } from "@/components/admin/region-management"
import { ClubManagement } from "@/components/admin/club-management"
import { UserManagement } from "@/components/admin/user-management"
import { ThemeProvider } from "@/components/theme-provider"
import { LocaleProvider } from "@/lib/locale-context"
import { ClubProvider } from "@/lib/club-context"
import { AdminProvider } from "@/lib/admin-context"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
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
import { useAdmin } from "@/lib/admin-context"

import { 
  AuthVerifyPage, 
  AuthResetPasswordPage, 
  AuthConfirmEmailChangePage 
} from "@/components/auth-action-handler"

import { LandingPage } from "@/components/landing-page"
import { useAuth } from "@/lib/use-auth"

const APP_VERSION = __APP_VERSION__
const APP_NAME = __APP_NAME__

function MainContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
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

  const { isGlobalAdmin, isCountryAdmin } = useAdmin()

  // Derive active page title from location for the header
  const activePageTitle = useMemo(() => {
    const path = location.pathname.substring(1)
    if (!path) return "Dashboard"
    
    // Handle nested paths for titles
    const segments = path.split("/")
    const lastSegment = segments[segments.length - 1]
    
    // Capitalize first letter for the title
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
  }, [location.pathname])

  // Reset layout on page change
  useEffect(() => {
    resetLayout()
  }, [location.pathname, resetLayout])

  // Redirect to landing if not logged in
  if (!user && location.pathname !== "/landing" && 
      !location.pathname.startsWith("/auth/")) {
    return <Navigate to="/landing" replace />
  }

  // Redirect to dashboard if logged in and on landing
  if (user && location.pathname === "/landing") {
    return <Navigate to="/dashboard" replace />
  }

  // Define landing route
  if (location.pathname === "/landing") {
    return <LandingPage />
  }

  return (
    <div className="flex flex-col fixed inset-0 overflow-hidden bg-background">
      {/* iOS Style Header */}
      <header className="h-12 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex-1 flex justify-start">
          {headerLeft || (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 transition-transform duration-1000 ease-in-out">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for AwanAfrica app.
                </SheetDescription>
                <SidebarProvider className="h-full min-h-full">
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
                      navigate(`/${page}`)
                      setIsSidebarOpen(false)
                    }}
                  />
                </SidebarProvider>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex-1 flex justify-center">
          <h1 className="font-semibold text-lg truncate text-center">
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
      <main className="flex-1 overflow-y-auto pt-safe pb-safe touch-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          
          {/* Auth Action Handlers */}
          <Route path="/auth/verify" element={<AuthVerifyPage />} />
          <Route path="/auth/reset-password" element={<AuthResetPasswordPage />} />
          <Route path="/auth/confirm-email-change" element={<AuthConfirmEmailChangePage />} />
          
          {/* Admin Routes */}
          {isGlobalAdmin && (
            <Route path="/admin/countries" element={<CountryManagement />} />
          )}
          {(isGlobalAdmin || isCountryAdmin) && (
            <Route path="/admin/regions" element={<RegionManagement />} />
          )}
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/clubs" element={<ClubManagement />} />
          
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
        <footer className="h-14 border-t flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-10 shrink-0">
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
      <OnboardingModal />
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <LocaleProvider>
        <TooltipProvider>
          <LayoutProvider>
            <BrowserRouter>
              <AdminProvider>
                <ClubProvider>
                  <MainContent />
                </ClubProvider>
              </AdminProvider>
            </BrowserRouter>
          </LayoutProvider>
        </TooltipProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}

export default App

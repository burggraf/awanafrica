import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { pb } from "@/lib/pb"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { useLocale, countryMetadata } from "@/lib/locale-context"
import { useClubs } from "@/lib/club-context"
import { Languages, Sun, Moon, Monitor, User, ShieldCheck, ChevronLeft, Building, Mail, Lock, Phone, UserCircle } from "lucide-react"
import { ClubSelector } from "./club-selector"
import type { ClubsResponse as ClubsResponseType } from "@/types/pocketbase-types"

import { useTranslation } from "react-i18next"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { country, setCountry, availableCountries } = useLocale()
  const { refreshMemberships } = useClubs()
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login")
  const [regStep, setRegStep] = useState<"role" | "club" | "details">("role")
  const [selectedClub, setSelectedClub] = useState<ClubsResponseType | null>(null)
  const { toast } = useToast()

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const registerForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      phone: "",
      role: "" as "Guardian" | "Leader" | "Admin",
      leaderSecret: "",
    },
  })

  const role = registerForm.watch("role")

  const forgotForm = useForm({
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    // Check URL for club context
    const params = new URLSearchParams(window.location.search)
    const clubId = params.get("club")
    if (clubId) {
      pb.collection("clubs").getOne(clubId)
        .then((record) => setSelectedClub(record as unknown as ClubsResponseType))
        .catch(console.error)
    }
  }, [])

  async function syncPreferences(userId: string, currentPrefs?: any) {
    try {
      const updates: any = {}
      if (currentPrefs?.language !== i18n.language) updates.language = i18n.language
      if (currentPrefs?.locale !== country) updates.locale = country
      if (currentPrefs?.theme !== theme) updates.theme = theme

      if (Object.keys(updates).length > 0) {
        await pb.collection("users").update(userId, updates)
      }
    } catch (error) {
      console.error("Failed to sync preferences:", error)
    }
  }

  async function applyUserPreferences(user: any) {
    if (user.language && user.language !== i18n.language) {
      i18n.changeLanguage(user.language)
    }
    if (user.locale && user.locale !== country) {
      setCountry(user.locale)
    }
    if (user.theme && user.theme !== theme) {
      setTheme(user.theme as any)
    }
  }

  async function onLogin(data: any) {
    try {
      const authData = await pb.collection("users").authWithPassword(data.email, data.password)
      await applyUserPreferences(authData.record)
      await syncPreferences(authData.record.id, authData.record)
      toast({ title: t("Logged in successfully") })
      onClose()
    } catch (error: any) {
      let description = error.message
      if (error.status === 400) {
        description = t("Invalid email or password. Please try again.")
      }
      toast({
        title: t("Login failed"),
        description,
        variant: "destructive",
      })
    }
  }

  async function onRegister(data: any) {
    if (data.role !== "Admin" && !selectedClub) {
      toast({
        title: t("Registration failed"),
        description: t("Please select a club first"),
        variant: "destructive",
      })
      return
    }

    try {
      if (data.password !== data.passwordConfirm) {
        toast({
          title: t("Registration failed"),
          description: t("Passwords do not match"),
          variant: "destructive",
        })
        return
      }

      // 1. Create User
      const user = await pb.collection("users").create({
        ...data,
        emailVisibility: true,
        language: i18n.language,
        locale: country,
        theme: theme,
      })

      // 1b. Authenticate temporarily to create membership/role
      await pb.collection("users").authWithPassword(data.email, data.password)
      
      if (data.role === "Admin") {
        // Create Admin Role (Pending)
        await pb.collection("admin_roles").create({
          user: user.id,
          role: "Pending"
        })
      } else if (selectedClub) {
        // 2. Determine Membership Status & Roles
        let membershipRole = data.role
        if (data.role === "Leader") {
          const isSecretCorrect = selectedClub.leaderSecret && data.leaderSecret === selectedClub.leaderSecret
          if (!isSecretCorrect) {
            membershipRole = "Pending"
          }
        }

        // 3. Create Club Membership
        await pb.collection("club_memberships").create({
          user: user.id,
          club: selectedClub.id,
          roles: [membershipRole]
        })
      }

      // 3b. Refresh global memberships list so OnboardingModal sees the new record
      await refreshMemberships()

      // 4. Verification Email
      try {
        await pb.collection("users").requestVerification(data.email)
      } catch (verifyError: any) {
        console.warn("Verification email request failed:", verifyError)
      }
      
      toast({ 
        title: t("Account created"), 
        description: t("Welcome to AwanAfrica!") 
      })
      
      onClose()
    } catch (error: any) {
      toast({
        title: t("Registration failed"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function onGoogleLogin() {
    try {
      const authData = await pb.collection("users").authWithOAuth2({ provider: "google" })
      await applyUserPreferences(authData.record)
      await syncPreferences(authData.record.id, authData.record)
      toast({ title: t("Logged in with Google") })
      onClose()
    } catch (error: any) {
      toast({
        title: t("Login failed"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function onForgot(data: any) {
    try {
      await pb.collection("users").requestPasswordReset(data.email)
      toast({ title: t("Password reset email sent") })
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogTitle className="sr-only">{t("Authentication")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("Sign in or create an account to access AwanAfrica.")}
        </DialogDescription>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="h-9 px-2">
              <Languages className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue>
                {i18n.language === 'sw' ? t('Swahili') : t('English')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("English")}</SelectItem>
              <SelectItem value="sw">{t("Swahili")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={(v) => setCountry(v)}>
            <SelectTrigger className="h-9 px-2">
              <SelectValue>
                {country && countryMetadata[country] ? (
                  <span className="flex items-center gap-2">
                    <span>{countryMetadata[country].flag}</span>
                    <span>{t(countryMetadata[country].name)}</span>
                  </span>
                ) : (
                  t("Country")
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map((c) => (
                <SelectItem key={c.isoCode} value={c.isoCode}>
                  <span className="flex items-center gap-2">
                    <span>{countryMetadata[c.isoCode]?.flag || '🌍'}</span>
                    <span>{t(c.name)}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
            <SelectTrigger className="h-9 px-2">
              <SelectValue>
                <span className="flex items-center gap-2">
                  {theme === 'light' ? <Sun className="h-4 w-4" /> : 
                   theme === 'dark' ? <Moon className="h-4 w-4" /> : 
                   <Monitor className="h-4 w-4" />}
                  {t(theme.charAt(0).toUpperCase() + theme.slice(1))}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("Light")}</SelectItem>
              <SelectItem value="dark">{t("Dark")}</SelectItem>
              <SelectItem value="system">{t("System")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => {
          setActiveTab(v)
          if (v === "register") setRegStep("role")
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("Log in")}</TabsTrigger>
            <TabsTrigger value="register">{t("Register")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <DialogHeader>
              <DialogTitle>{t("Log in")}</DialogTitle>
              <DialogDescription>
                {t("Enter your credentials to access your account.")}
              </DialogDescription>
            </DialogHeader>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 py-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl><Input placeholder="email@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Password")}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t("Log in")}</Button>
                <Button 
                  type="button" 
                  variant="link" 
                  className="w-full text-xs"
                  onClick={() => setActiveTab("forgot")}
                >
                  {t("Forgot password?")}
                </Button>
              </form>
            </Form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("Or continue with")}
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={onGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>
          </TabsContent>

          <TabsContent value="register">
            <DialogHeader>
              <DialogTitle>
                {regStep === "role" && t("Create Account")}
                {regStep === "club" && t("Find Your Club")}
                {regStep === "details" && t("Your Details")}
              </DialogTitle>
              <DialogDescription>
                {regStep === "role" && t("First, tell us who you are.")}
                {regStep === "club" && t("Search by code, GPS, or location.")}
                {regStep === "details" && t("Complete your registration.")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {regStep === "role" && (
                <div className="space-y-6">
                  <Form {...registerForm}>
                    <form className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={() => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-center block text-lg font-semibold">{t("I am registering as a...")}</FormLabel>
                            <FormControl>
                                <RadioGroup
                                  onValueChange={(val) => {
                                    registerForm.setValue("role", val as any)
                                    setRegStep("club")
                                  }}
                                  value={registerForm.watch("role")}
                                  className="grid grid-cols-2 gap-4"
                                >
                                  <div>
                                    <RadioGroupItem value="Guardian" id="guardian" className="peer sr-only" />
                                    <Label
                                      htmlFor="guardian"
                                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                                      onClick={() => {
                                        registerForm.setValue("role", "Guardian")
                                        setRegStep("club")
                                      }}
                                    >
                                      <User className="mb-3 h-10 w-10 text-primary" />
                                      <span className="text-base font-bold">{t("Guardian")}</span>
                                      <span className="text-xs text-muted-foreground mt-1 text-center">{t("Registering my children")}</span>
                                    </Label>
                                  </div>
                                  <div>
                                    <RadioGroupItem value="Leader" id="leader" className="peer sr-only" />
                                    <Label
                                      htmlFor="leader"
                                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
                                      onClick={() => {
                                        registerForm.setValue("role", "Leader")
                                        setRegStep("club")
                                      }}
                                    >
                                    <ShieldCheck className="mb-3 h-10 w-10 text-primary" />
                                    <span className="text-base font-bold">{t("Leader")}</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">{t("Serving at a club")}</span>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="link" 
                      className="text-xs text-muted-foreground"
                      onClick={() => {
                        registerForm.setValue("role", "Admin")
                        setRegStep("details")
                      }}
                    >
                      {t("I'm an Awana administrator")}
                    </Button>
                  </div>
                </div>
              )}

              {regStep === "club" && (
                <div className="space-y-4">
                  <ClubSelector onSelect={(club) => {
                    setSelectedClub(club)
                    if (club) setRegStep("details")
                  }} />
                  <Button 
                    variant="ghost" 
                    className="w-full gap-2" 
                    onClick={() => setRegStep("role")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("Back")}
                  </Button>
                </div>
              )}

              {regStep === "details" && (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="rounded-xl border bg-muted/30 p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {role === "Admin" ? (
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Building className="h-5 w-5 text-primary" />
                          )}
                          <span className="font-bold text-base">
                            {role === "Admin" ? t("Awana Administrator") : selectedClub?.name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs underline decoration-dotted"
                          onClick={() => setRegStep(role === "Admin" ? "role" : "club")}
                        >
                          {t("Change")}
                        </Button>
                      </div>

                      {role !== "Admin" && selectedClub && (
                        <div className="text-xs text-muted-foreground space-y-1 ml-7">
                          <p>{selectedClub.address || selectedClub.location}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-muted-foreground/10 mt-1">
                            <p className="flex items-center gap-1">
                              <span className="opacity-70">{t("Region")}:</span> 
                              <span className="font-medium text-foreground">{(selectedClub.expand as any)?.region?.name || t("Unknown")}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="opacity-70">{t("Country")}:</span> 
                              <span className="font-medium text-foreground">{(selectedClub.expand as any)?.region?.expand?.country?.name || t("Unknown")}</span>
                            </p>
                            <p className="flex items-center gap-1">
                              <span className="opacity-70">{t("Registration #")}:</span> 
                              <span className="font-medium text-foreground">{selectedClub.registration}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Full Name")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="John Doe" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Phone Number")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="+255..." {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Email")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="email@example.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" type="password" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Confirm")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" type="password" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {role === "Leader" && (
                      <FormField
                        control={registerForm.control}
                        name="leaderSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("Leader Access Code (Optional)")}</FormLabel>
                            <FormControl><Input placeholder={t("Enter secret code for instant approval")} {...field} /></FormControl>
                            <p className="text-[0.7rem] text-muted-foreground">
                              {t("If you don't have a code, your account will require manual approval by a Director.")}
                            </p>
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setRegStep(role === "Admin" ? "role" : "club")}
                      >
                        {t("Back")}
                      </Button>
                      <Button type="submit" className="flex-[2]">{t("Create Account")}</Button>
                    </div>
                  </form>
                </Form>
              )}
            </div>

            {regStep === "role" && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("Or continue with")}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  type="button" 
                  className="w-full" 
                  onClick={onGoogleLogin}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="forgot">
            <DialogHeader>
              <DialogTitle>{t("Reset password")}</DialogTitle>
            </DialogHeader>
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4 py-4">
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl><Input placeholder="email@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t("Send Reset Link")}</Button>
                <Button type="button" variant="link" className="w-full text-xs" onClick={() => setActiveTab("login")}>
                  {t("Back to login")}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

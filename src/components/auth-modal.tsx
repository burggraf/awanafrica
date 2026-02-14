import { useState } from "react"
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
import { useTheme } from "@/components/theme-provider"
import { useLocale, countries, type Country } from "@/lib/locale-context"
import { Languages, Sun, Moon, Monitor } from "lucide-react"

import { useTranslation } from "react-i18next"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { i18n, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { country, setCountry } = useLocale()
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login")
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
    },
  })

  const forgotForm = useForm({
    defaultValues: {
      email: "",
    },
  })

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
      setCountry(user.locale as Country)
    }
    if (user.theme && user.theme !== theme) {
      setTheme(user.theme as any)
    }
  }

  async function onLogin(data: any) {
    try {
      console.log("Attempting login to:", pb.baseUrl)
      const authData = await pb.collection("users").authWithPassword(data.email, data.password)
      await applyUserPreferences(authData.record)
      // Sync current local preferences to DB in case they were changed on login screen
      await syncPreferences(authData.record.id, authData.record)
      toast({ title: t("Logged in successfully") })
      onClose()
    } catch (error: any) {
      console.error("Login error:", error)
      
      let description = error.message
      
      // PocketBase 400 error on auth usually means invalid credentials
      if (error.status === 400) {
        description = t("Invalid email or password. Please try again.")
      } else if (error.status === 403) {
        // 403 usually means the user is not verified if the collection requires it
        description = t("Please verify your email address before logging in. Check your inbox for the verification link.")
        
        // Offer to resend verification
        toast({
          title: t("Verification required"),
          description,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  await pb.collection("users").requestVerification(data.email)
                  toast({ title: t("Verification email sent") })
                } catch (err: any) {
                  if (err.status === 429) {
                    toast({ 
                      title: t("Too many requests"), 
                      description: t("Please wait a few minutes before trying again."),
                      variant: "destructive" 
                    })
                  } else {
                    toast({ 
                      title: t("Error"), 
                      description: err.message,
                      variant: "destructive" 
                    })
                  }
                }
              }}
            >
              {t("Resend")}
            </Button>
          )
        })
        return // Exit early as we handled this specifically
      } else if (error.message?.includes('Failed to fetch') || error.status === 0) {
        description = t("Network error: Could not connect to the server. Please check your connection or browser settings.")
      }

      toast({
        title: t("Login failed"),
        description,
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

  async function onRegister(data: any) {
    try {
      // Validate passwords match before sending to API
      if (data.password !== data.passwordConfirm) {
        toast({
          title: t("Registration failed"),
          description: t("Passwords do not match"),
          variant: "destructive",
        })
        return
      }

      await pb.collection("users").create({
        ...data,
        emailVisibility: false,
        language: i18n.language,
        locale: country,
        theme: theme,
      })
      
      // Request verification email immediately after registration
      try {
        await pb.collection("users").requestVerification(data.email)
      } catch (verifyError: any) {
        console.warn("Verification email request failed (possibly rate limited):", verifyError)
        // We don't fail the whole registration if just the email trigger fails, 
        // as the user can always request it again from the login screen if we added a button.
      }
      
      toast({ 
        title: t("Account created"), 
        description: t("Please check your email to verify your account before logging in.") 
      })
      
      // Switch to login tab since they can't auto-login yet
      setActiveTab("login")
    } catch (error: any) {
      console.error("Registration error details:", error.data)
      
      // Check for unique constraint violation (email already exists)
      if (error.data?.data?.email?.code === 'validation_not_unique') {
        toast({
          title: t("Registration failed"),
          description: t("Email already registered. Please log in or reset your password."),
          variant: "destructive",
        })
        return
      }

      // Extract specific field errors if available
      let errorMessage = error.message
      if (error.data?.data) {
        const fieldErrors = Object.entries(error.data.data)
          .map(([field, detail]: [string, any]) => `${field}: ${detail.message || detail.code || JSON.stringify(detail)}`)
          .join(", ")
        if (fieldErrors) errorMessage = fieldErrors
      }

      toast({
        title: t("Registration failed"),
        description: errorMessage,
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
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogTitle className="sr-only">{t("Authentication")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("Sign in or create an account to access AwanAfrica.")}
        </DialogDescription>
        
        {/* Preference Selectors */}
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

          <Select value={country} onValueChange={(v) => setCountry(v as Country)}>
            <SelectTrigger className="h-9 px-2">
              <SelectValue>
                {country && countries[country as Country] ? (
                  <span className="flex items-center gap-2">
                    <span>{countries[country as Country].flag}</span>
                    <span>{t(countries[country as Country].name)}</span>
                  </span>
                ) : (
                  t("Country")
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(countries).map(([code, info]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span>{info.flag}</span>
                    <span>{t(info.name)}</span>
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
              <SelectItem value="light">
                <span className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  {t("Light")}
                </span>
              </SelectItem>
              <SelectItem value="dark">
                <span className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  {t("Dark")}
                </span>
              </SelectItem>
              <SelectItem value="system">
                <span className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  {t("System")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
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
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">{t("Log in")}</Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 font-normal"
                    onClick={() => setActiveTab("forgot")}
                  >
                    {t("Forgot password?")}
                  </Button>
                </div>
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
              <DialogTitle>{t("Create an account")}</DialogTitle>
              <DialogDescription>
                {t("Fill in the details below to create your account.")}
              </DialogDescription>
            </DialogHeader>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 py-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Full Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Password")}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                      <FormLabel>{t("Confirm Password")}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">{t("Register")}</Button>
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

          <TabsContent value="forgot">
            <DialogHeader>
              <DialogTitle>{t("Reset password")}</DialogTitle>
              <DialogDescription>
                {t("Enter your email address and we'll send you a link to reset your password.")}
              </DialogDescription>
            </DialogHeader>
            <Form {...forgotForm}>
              <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4 py-4">
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">{t("Send Reset Link")}</Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                  >
                    {t("Back to login")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

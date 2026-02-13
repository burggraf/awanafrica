import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { pb } from "@/lib/pb"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

/**
 * Helper hook to handle language sync from URL parameters
 */
function useLangSync() {
  const [searchParams] = useSearchParams()
  const { i18n } = useTranslation()
  const lang = searchParams.get("lang")

  useEffect(() => {
    if (lang && i18n.language !== lang) {
      console.log(`Syncing language to: ${lang}`)
      i18n.changeLanguage(lang)
    }
  }, [lang, i18n])

  return lang
}

export function AuthVerifyPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  
  useLangSync()

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    async function verify() {
      try {
        await pb.collection("users").confirmVerification(token!)
        setStatus("success")
        toast({
          title: t("Email verified"),
          description: t("You can now log in to your account."),
        })
      } catch (error: any) {
        console.error("Verification error:", error)
        setStatus("error")
      }
    }

    verify()
  }, [token, t, toast])

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("Email Verification")}</CardTitle>
          <CardDescription>
            {status === "loading" && t("Verifying your email address...")}
            {status === "success" && t("Your email has been verified!")}
            {status === "error" && t("Verification failed or link expired.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/")}>
            {t("Go to Login")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function AuthResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  useLangSync()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    if (password !== passwordConfirm) {
      toast({
        title: t("Error"),
        description: t("Passwords do not match"),
        variant: "destructive",
      })
      return
    }

    setStatus("loading")
    try {
      await pb.collection("users").confirmPasswordReset(token, password, passwordConfirm)
      setStatus("success")
      toast({
        title: t("Password reset"),
        description: t("Your password has been updated successfully."),
      })
    } catch (error: any) {
      console.error("Reset error:", error)
      setStatus("error")
      toast({
        title: t("Error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{t("Invalid Link")}</CardTitle>
            <CardDescription>{t("The password reset link is missing or invalid.")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/")}>{t("Go back")}</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("Reset Password")}</CardTitle>
          <CardDescription>
            {status === "form" && t("Enter your new password below.")}
            {status === "loading" && t("Updating password...")}
            {status === "success" && t("Password updated successfully!")}
            {status === "error" && t("Failed to update password. The link may have expired.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("New Password")}</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("Confirm New Password")}</label>
                <Input 
                  type="password" 
                  value={passwordConfirm} 
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {t("Update Password")}
              </Button>
            </form>
          )}
          {status === "loading" && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          )}
          {status === "success" && (
            <div className="flex justify-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="flex justify-center py-6">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          )}
        </CardContent>
        {status !== "form" && (
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/")}>
              {status === "success" ? t("Go to Login") : t("Try Again")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export function AuthConfirmEmailChangePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  useLangSync()

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    async function confirm() {
      try {
        await pb.collection("users").confirmEmailChange(token!)
        setStatus("success")
        toast({
          title: t("Email changed"),
          description: t("Your email address has been updated successfully."),
        })
      } catch (error: any) {
        console.error("Email change error:", error)
        setStatus("error")
      }
    }

    confirm()
  }, [token, t, toast])

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("Confirm Email Change")}</CardTitle>
          <CardDescription>
            {status === "loading" && t("Confirming your new email address...")}
            {status === "success" && t("Your email has been changed!")}
            {status === "error" && t("Confirmation failed or link expired.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === "error" && <XCircle className="h-12 w-12 text-destructive" />}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/")}>
            {t("Go to Home")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

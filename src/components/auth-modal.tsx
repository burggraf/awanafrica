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

import { useTranslation } from "react-i18next"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation()
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

  async function onLogin(data: any) {
    try {
      await pb.collection("users").authWithPassword(data.email, data.password)
      toast({ title: "Logged in successfully" })
      onClose()
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function onRegister(data: any) {
    try {
      await pb.collection("users").create({
        ...data,
        emailVisibility: true,
      })
      await pb.collection("users").authWithPassword(data.email, data.password)
      toast({ title: "Registered and logged in successfully" })
      onClose()
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function onForgot(data: any) {
    try {
      await pb.collection("users").requestPasswordReset(data.email)
      toast({ title: "Password reset email sent" })
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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

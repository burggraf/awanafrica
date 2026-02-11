import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { pb } from "@/lib/pb"
import { useAuth } from "@/lib/use-auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Camera, Trash2, Loader2 } from "lucide-react"

import { useTranslation } from "react-i18next"

export function ProfileScreen() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      displayName: user?.displayName || "",
      bio: user?.bio || "",
    },
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">{t("Please log in to view your profile.")}</p>
      </div>
    )
  }

  const avatarUrl = user.avatar 
    ? pb.files.getUrl(user, user.avatar, { thumb: '100x100' })
    : ""

  async function onSubmit(data: any) {
    setLoading(true)
    try {
      await pb.collection("users").update(user!.id, data)
      toast({ title: "Profile updated" })
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max size is 5MB",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("avatar", file)

    setLoading(true)
    try {
      await pb.collection("users").update(user!.id, formData)
      toast({ title: "Avatar updated" })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function removeAvatar() {
    setLoading(true)
    try {
      await pb.collection("users").update(user!.id, { avatar: null })
      toast({ title: "Avatar removed" })
    } catch (error: any) {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="w-24 h-24 border">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-2xl">
              {user.name?.charAt(0) || user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={onAvatarChange} 
          />
        </div>
        {user.avatar && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive" 
            onClick={removeAvatar}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("Remove Avatar")}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Full Name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Display Name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{t("This is how others will see you.")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Bio")}</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={t("Tell us about yourself")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("Save Changes")}
          </Button>
        </form>
      </Form>
    </div>
  )
}

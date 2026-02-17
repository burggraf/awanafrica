import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { pb } from "@/lib/pb"
import { useClubs } from "@/lib/club-context"
import { useAuth } from "@/lib/use-auth"
import { usePBQuery } from "@/hooks/use-pb-query"
import { useLayout } from "@/lib/layout-context"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  Loader2, 
  ChevronLeft, 
  Save, 
  Trash2, 
  Baby, 
  AlertCircle 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ClubbersResponse } from "@/types/pocketbase-types"

const clubberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female"]).nullable().optional(),
  active: z.boolean(),
  notes: z.string().optional(),
  guardian: z.string().optional(),
})

type ClubberFormValues = z.infer<typeof clubberSchema>

export function ClubberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast } = useToast()
  const { currentClub, isGuardian } = useClubs()
  const { user } = useAuth()
  const { setHeaderTitle, setHeaderLeft } = useLayout()
  const [isSaving, setIsSaving] = useState(false)

  const isNew = id === "new"

  const form = useForm<ClubberFormValues>({
    resolver: zodResolver(clubberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: null,
      active: true,
      notes: "",
      guardian: "",
    },
  })

  // Fetch clubber data if not new
  const { data: clubber, isLoading: isLoadingClubber, error } = usePBQuery(
    async ({ requestKey }) => {
      if (isNew) return null
      return await pb.collection("clubbers").getOne<ClubbersResponse>(id!, {
        requestKey: `${requestKey}_clubber_detail`,
      })
    },
    [id],
    { enabled: !isNew }
  )

  // Populate form when data is loaded
  useEffect(() => {
    if (clubber) {
      form.reset({
        firstName: clubber.firstName,
        lastName: clubber.lastName,
        dateOfBirth: clubber.dateOfBirth ? clubber.dateOfBirth.split(" ")[0] : "", // Handle YYYY-MM-DD HH:mm:ss
        gender: clubber.gender || null,
        active: clubber.active ?? true,
        notes: clubber.notes || "",
        guardian: clubber.guardian || "",
      })
    } else if (isNew && isGuardian && user) {
      // Pre-set guardian if a guardian is creating a new clubber
      form.setValue("guardian", user.id)
    }
  }, [clubber, isNew, isGuardian, user, form])

  // Update header
  useEffect(() => {
    setHeaderTitle(isNew ? t("New Clubber") : t("Clubber Detail"))
    setHeaderLeft(
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ChevronLeft className="h-6 w-6" />
      </Button>
    )
  }, [isNew, t, setHeaderTitle, setHeaderLeft, navigate])

  const onSubmit = async (values: ClubberFormValues) => {
    if (!currentClub && !isGuardian) {
      toast({
        title: t("Error"),
        description: t("No club selected."),
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const data = {
        ...values,
        club: currentClub?.id || clubber?.club || "",
        // Only set guardian if it's not empty
        guardian: values.guardian || null,
      }

      if (isNew) {
        // Ensure club is set for new clubbers
        if (!data.club && isGuardian && user) {
          // If guardian is registering, we might need to let them pick a club
          // For now, let's assume they pick it or it's handled elsewhere
          // If currentClub is null, we might need to handle it.
        }
        
        await pb.collection("clubbers").create(data)
        toast({
          title: t("Success"),
          description: t("Clubber registered successfully."),
        })
      } else {
        await pb.collection("clubbers").update(id!, data)
        toast({
          title: t("Success"),
          description: t("Clubber updated successfully."),
        })
      }
      navigate(-1)
    } catch (err: any) {
      if (!err.isAbort) {
        toast({
          title: t("Error"),
          description: err.message || t("Failed to save clubber."),
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(t("Are you sure you want to delete this clubber?"))) {
      try {
        await pb.collection("clubbers").delete(id!)
        toast({
          title: t("Deleted"),
          description: t("Clubber has been removed."),
        })
        navigate(-1)
      } catch (err: any) {
        toast({
          title: t("Error"),
          description: err.message || t("Failed to delete clubber."),
          variant: "destructive",
        })
      }
    }
  }

  if (isLoadingClubber) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !isNew) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("Error loading clubber data.")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Baby className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{isNew ? t("Register Clubber") : t("Edit Clubber")}</CardTitle>
              <CardDescription>
                {t("Enter the details for the clubber.")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("First Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("First Name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Last Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Last Name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Date of Birth")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Gender")}</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === "unknown" ? null : val)} 
                        value={field.value || "unknown"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select gender")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unknown">{t("Unknown")}</SelectItem>
                          <SelectItem value="Male">{t("Male")}</SelectItem>
                          <SelectItem value="Female">{t("Female")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t("Active Status")}
                      </FormLabel>
                      <FormDescription>
                        {t("Inactive clubbers are hidden from attendance lists.")}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Notes")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Allergies, medical conditions, or other notes...")} 
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isNew ? t("Register") : t("Save Changes")}
                </Button>
                
                {!isNew && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

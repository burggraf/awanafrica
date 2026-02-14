import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"

interface StudentWizardProps {
  onComplete: (data: any) => void
  onSkip: () => void
  isSubmitting?: boolean
}

export function StudentWizard({ onComplete, onSkip, isSubmitting }: StudentWizardProps) {
  const { t } = useTranslation()
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  })

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold">{t("Add your first student")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Get started by adding a child to your club.")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("First Name")}</FormLabel>
                <FormControl><Input placeholder="John" {...field} /></FormControl>
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
                <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Date of Birth")}</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Register Student")}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-xs" onClick={onSkip} disabled={isSubmitting}>
              {t("I'll do this later")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

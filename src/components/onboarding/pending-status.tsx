import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Clock, BookOpen, ExternalLink } from "lucide-react"

interface PendingStatusProps {
  onClose: () => void
}

export function PendingStatus({ onClose }: PendingStatusProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
          <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{t("Registration Received!")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("The Club Director needs to verify your account before you can access clubber data.")}
        </p>
      </div>

      <div className="border rounded-lg p-4 bg-muted/30 space-y-4 text-left">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("While you wait:")}
        </h4>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("Browse the Leader Handbook")}</p>
              <p className="text-xs text-muted-foreground">{t("Learn about Awana Africa programs and best practices.")}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <ExternalLink className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium">{t("Complete your Profile")}</p>
              <p className="text-xs text-muted-foreground">{t("Make sure your contact info and photo are up to date.")}</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onClose} className="w-full">
        {t("Got it, thanks!")}
      </Button>
    </div>
  )
}

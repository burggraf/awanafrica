import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useFormat } from "@/hooks/use-format"
import { useLayout } from "@/lib/layout-context"

export function DashboardScreen() {
  const { t } = useTranslation()
  const { formatCurrency, formatDateTime } = useFormat()
  const { setShowFooter } = useLayout()

  useEffect(() => {
    // Show footer on Dashboard
    setShowFooter(true)
    // Optional: reset on unmount if you want it to be very strict
    // but the App.tsx useEffect also handles this on page change.
    // return () => setShowFooter(false)
  }, [setShowFooter])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">{t("Welcome to Dashboard")}</h2>
      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Balance")}</p>
          <p className="text-xl font-bold">{formatCurrency(1250.50)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Last Login")}</p>
          <p className="text-sm font-medium">{formatDateTime(new Date())}</p>
        </div>
      </div>
      {Array.from({ length: 20 }).map((_, i) => (
        <p key={i} className="text-muted-foreground">
          {t("scrollable content", { index: i + 1 })}
        </p>
      ))}
    </div>
  )
}

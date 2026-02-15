import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, AlertCircle } from "lucide-react"

export function ClubbersPage() {
  const { t } = useTranslation()
  const { currentClub, isActiveLeader } = useClubs()
  const { isAdmin } = useAdmin()

  // Redirect or show forbidden if user doesn't have access
  if (!isAdmin && !isActiveLeader) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("You do not have permission to view this page.")}</span>
        </div>
      </div>
    )
  }

  // Show message if no club is selected (for non-admin leaders)
  if (!isAdmin && !currentClub) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 p-4 border border-muted bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("Please select a club to view clubbers.")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            {t("Clubbers")}
          </h2>
          {currentClub && (
            <p className="text-muted-foreground">
              {t("Managing clubbers for")} {currentClub.name}
            </p>
          )}
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Clubber")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Club Members")}</CardTitle>
          <CardDescription>
            {t("View and manage clubbers for this club.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("Clubber management coming soon.")}</p>
            <p className="text-sm mt-2">
              {isAdmin 
                ? t("As an admin, you can view clubbers across all clubs.")
                : t("As a club leader, you can manage clubbers in your club.")
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

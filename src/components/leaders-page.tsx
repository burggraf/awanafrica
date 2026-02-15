import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCog, Plus, AlertCircle } from "lucide-react"

export function LeadersPage() {
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
          <span>{t("Please select a club to view leaders.")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            {t("Leaders")}
          </h2>
          {currentClub && (
            <p className="text-muted-foreground">
              {t("Managing leaders for")} {currentClub.name}
            </p>
          )}
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Leader")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Club Leaders")}</CardTitle>
          <CardDescription>
            {t("View and manage leaders for this club.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("Leader management coming soon.")}</p>
            <p className="text-sm mt-2">
              {isAdmin 
                ? t("As an admin, you can view leaders across all clubs.")
                : t("As a club leader, you can manage leaders in your club.")
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

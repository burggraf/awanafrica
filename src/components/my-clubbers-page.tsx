import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Baby, Plus, AlertCircle, UserPlus } from "lucide-react"

export function MyClubbersPage() {
  const { t } = useTranslation()
  const { isGuardian } = useClubs()

  // This page is only for guardians
  if (!isGuardian) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("You do not have permission to view this page.")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6" />
            {t("My Clubbers")}
          </h2>
          <p className="text-muted-foreground">
            {t("Manage your registered children.")}
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          {t("Register Child")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Your Children")}</CardTitle>
          <CardDescription>
            {t("View and manage your children's club registrations.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex justify-center mb-4">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <Baby className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p>{t("No children registered yet.")}</p>
            <p className="text-sm mt-2 max-w-sm mx-auto">
              {t("Register your children to track their progress in Awana clubs.")}
            </p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t("Register Your First Child")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Quick Actions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Baby className="h-4 w-4 mr-2" />
            {t("View Attendance History")}
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Baby className="h-4 w-4 mr-2" />
            {t("Track Achievements")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

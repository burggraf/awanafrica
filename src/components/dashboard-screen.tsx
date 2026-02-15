import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useFormat } from "@/hooks/use-format"
import { useLayout } from "@/lib/layout-context"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ShieldCheck, Baby, UserCog, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardScreen() {
  const { t } = useTranslation()
  const { formatDateTime } = useFormat()
  const { setShowFooter } = useLayout()
  const { isPendingLeader, isActiveLeader, isGuardian, memberships } = useClubs()
  const { isAdmin } = useAdmin()

  useEffect(() => {
    setShowFooter(true)
  }, [setShowFooter])

  const pendingMemberships = memberships.filter(m => m.roles?.includes('Pending'))

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Dashboard")}</h2>
        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          {formatDateTime(new Date())}
        </div>
      </div>

      {/* Pending Leader Warning */}
      {isPendingLeader && !isActiveLeader && !isAdmin && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <CardTitle className="text-lg">{t("Leader Approval Pending")}</CardTitle>
            </div>
            <CardDescription className="text-amber-700/80 dark:text-amber-400/80 font-medium">
              {t("Your request to join as a leader is being reviewed by the club director.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              {t("Once approved, you will have access to manage clubbers, attendance, and achievements.")}
            </p>
            {pendingMemberships.length > 0 && (
              <div className="bg-background/50 p-3 rounded-md border border-amber-100 dark:border-amber-900/30">
                <p className="font-semibold text-xs uppercase tracking-wider mb-1 opacity-70">{t("Pending Clubs")}:</p>
                <ul className="list-disc list-inside">
                  {pendingMemberships.map(m => (
                    <li key={m.id}>{m.expand?.club?.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <Badge variant="outline">{t("Admin")}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{t("Administration")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("You have administrative access to manage regions, users, and clubs.")}</p>
            </CardContent>
          </Card>
        )}

        {isActiveLeader && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <UserCog className="h-5 w-5 text-primary" />
                <Badge variant="outline">{t("Leader")}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{t("Club Leadership")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("You are an active leader. Manage your club members and programs.")}</p>
            </CardContent>
          </Card>
        )}

        {isGuardian && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Baby className="h-5 w-5 text-primary" />
                <Badge variant="outline">{t("Guardian")}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{t("My Family")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t("Manage your registered children and track their progress.")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {!isAdmin && !isActiveLeader && !isGuardian && !isPendingLeader && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("Get Started")}</CardTitle>
            <CardDescription>{t("You don't have any active roles yet.")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button className="justify-start gap-2" variant="outline">
                <Building2 className="h-4 w-4" />
                {t("Join a Club as a Leader")}
              </Button>
              <Button className="justify-start gap-2" variant="outline">
                <Baby className="h-4 w-4" />
                {t("Register as a Guardian")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Stats (Placeholder for now) */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Active Programs")}</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase font-semibold">{t("Registered Clubbers")}</p>
            <p className="text-2xl font-bold">148</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "outline" }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
      variant === "default" ? "bg-primary text-primary-foreground" : "border border-primary text-primary"
    }`}>
      {children}
    </span>
  )
}

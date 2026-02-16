import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Settings, Calendar, Library } from "lucide-react";
import { useLayout } from "@/lib/layout-context";
import { useClubs } from "@/lib/club-context";
import { useAdmin } from "@/lib/admin-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgramManagement } from "./program-management";
import { ClubYearManagement } from "./club-year-management";

export function ClubSettingsPage() {
  const { t } = useTranslation();
  const { setHeaderTitle } = useLayout();
  const { currentClub, currentClubRoles } = useClubs();
  const { isGlobalAdmin, adminRoles } = useAdmin();

  useEffect(() => {
    setHeaderTitle(t("Club Settings"));
  }, [setHeaderTitle, t]);

  const isDirector = currentClubRoles.includes("Director");
  const hasAdminAccess = isGlobalAdmin || adminRoles.some(r => 
    (r.role === 'Country' && r.country === (currentClub as any)?.expand?.region?.country) ||
    (r.role === 'Region' && r.region === currentClub?.region)
  );

  const canManage = isDirector || hasAdminAccess;

  if (!currentClub) {
    return (
      <div className="p-8 text-center space-y-4">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">{t("No Club Selected")}</h2>
        <p className="text-muted-foreground">{t("Please select a club to manage its settings.")}</p>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="p-8 text-center space-y-4">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">{t("Access Denied")}</h2>
        <p className="text-muted-foreground">{t("You do not have permission to manage settings for this club.")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t("Settings")}: {currentClub.name}</h2>
      </div>

      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="programs" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            {t("Programs")}
          </TabsTrigger>
          <TabsTrigger value="years" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("Club Years")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>{t("Program Management")}</CardTitle>
              <CardDescription>
                {t("Configure the different Awana programs offered at this club.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="years">
          <Card>
            <CardHeader>
              <CardTitle>{t("Club Year Management")}</CardTitle>
              <CardDescription>
                {t("Manage operational years and academic cycles.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClubYearManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

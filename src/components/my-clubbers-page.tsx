import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useClubs } from "@/lib/club-context"
import { useAuth } from "@/lib/use-auth"
import { usePBQuery } from "@/hooks/use-pb-query"
import { pb } from "@/lib/pb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Baby, Plus, AlertCircle, Loader2, Calendar, MapPin, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ClubbersResponse, ClubberRegistrationsResponse, ProgramsResponse, ClubYearsResponse, ClubsResponse } from "@/types/pocketbase-types"

type ClubberExpanded = ClubbersResponse<{
  club: ClubsResponse;
}>

type RegistrationExpanded = ClubberRegistrationsResponse<{
  clubber: ClubbersResponse;
  club_year: ClubYearsResponse;
  program: ProgramsResponse;
}>

export function MyClubbersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isGuardian } = useClubs()
  const { user } = useAuth()

  // Fetch clubbers where the current user is the guardian
  const { data: clubbers, isLoading: isLoadingClubbers } = usePBQuery(
    async ({ requestKey }) => {
      if (!user) return []
      const records = await pb.collection("clubbers").getFullList<ClubberExpanded>({
        filter: `guardian = "${user.id}"`,
        expand: "club",
        sort: "firstName,lastName",
        requestKey: `${requestKey}_my_clubbers`,
      })
      return records
    },
    [user?.id],
    { enabled: !!user && isGuardian }
  )

  // Fetch registrations for these clubbers
  const clubberIds = clubbers?.map(c => c.id) || []
  const { data: registrations, isLoading: isLoadingRegistrations } = usePBQuery(
    async ({ requestKey }) => {
      if (clubberIds.length === 0) return []
      const idsFilter = clubberIds.join('","')
      const records = await pb.collection("clubber_registrations").getFullList<RegistrationExpanded>({
        filter: `clubber.id ?~ ["${idsFilter}"]`,
        expand: "clubber,club_year,program",
        requestKey: `${requestKey}_my_registrations`,
      })
      return records
    },
    [clubberIds.join(',')],
    { enabled: clubberIds.length > 0 && isGuardian }
  )

  // Group registrations by clubber
  const getRegistrationsForClubber = (clubberId: string) => {
    return registrations?.filter(r => 
      r.clubber === clubberId || r.expand?.clubber?.id === clubberId
    ) || []
  }

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

  const isLoading = isLoadingClubbers || isLoadingRegistrations

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
        <Button size="sm" onClick={() => navigate("/my-clubbers/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Register Child")}
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !clubbers || clubbers.length === 0 ? (
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
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate("/my-clubbers/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Register Your First Child")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clubbers.map((clubber) => {
            const initials = `${clubber.firstName.charAt(0)}${clubber.lastName.charAt(0)}`.toUpperCase()
            const clubberRegs = getRegistrationsForClubber(clubber.id)
            const hasRegistrations = clubberRegs.length > 0
            const currentClub = clubber.expand?.club

            return (
              <Card 
                key={clubber.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/my-clubbers/${clubber.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {clubber.firstName} {clubber.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {currentClub && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {currentClub.name}
                            </span>
                          )}
                          {clubber.dateOfBirth && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(clubber.dateOfBirth).toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={hasRegistrations ? "default" : "outline"}>
                        {hasRegistrations ? t("Registered") : t("Unregistered")}
                      </Badge>
                      {clubber.active === false && (
                        <Badge variant="destructive" className="text-[10px] h-4">
                          {t("Inactive")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {hasRegistrations ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {t("Active Registrations")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {clubberRegs.map((reg) => (
                          <div 
                            key={reg.id} 
                            className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm"
                          >
                            <Badge variant="secondary" className="text-xs">
                              {reg.expand?.program?.name || t("Unknown Program")}
                            </Badge>
                            <span className="text-muted-foreground">
                              {reg.expand?.club_year?.label || ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p>{t("Not registered for any programs.")}</p>
                      <Button variant="link" className="p-0 h-auto text-sm">
                        {t("Register for a program")}
                      </Button>
                    </div>
                  )}
                  
                  {clubber.notes && (
                    <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                      <span className="font-medium">{t("Notes")}: </span>
                      {clubber.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}

          <Card>
            <CardHeader>
              <CardTitle>{t("Quick Actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                {t("View Attendance History")}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                {t("Track Achievements")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { usePBQuery } from "@/hooks/use-pb-query"
import { pb } from "@/lib/pb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Plus, AlertCircle, Loader2, Baby } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ClubbersResponse, UsersResponse, ClubberRegistrationsResponse, ProgramsResponse, ClubYearsResponse } from "@/types/pocketbase-types"

type ClubberExpanded = ClubbersResponse<{
  guardian: UsersResponse;
}>

type RegistrationExpanded = ClubberRegistrationsResponse<{
  clubber: ClubbersResponse;
  club_year: ClubYearsResponse;
  program: ProgramsResponse;
}>

export function ClubbersPage() {
  const { t } = useTranslation()
  const { currentClub, isActiveLeader } = useClubs()
  const { isAdmin } = useAdmin()

  // Fetch clubbers for the current club
  const { data: clubbers, isLoading: isLoadingClubbers } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return []
      const records = await pb.collection("clubbers").getFullList<ClubberExpanded>({
        filter: `club = "${currentClub.id}"`,
        expand: "guardian",
        sort: "firstName,lastName",
        requestKey: `${requestKey}_clubbers`,
      })
      return records
    },
    [currentClub?.id],
    { enabled: !!currentClub && (isAdmin || isActiveLeader) }
  )

  // Fetch registrations to show program assignments
  const { data: registrations } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub || !clubbers?.length) return []
      const clubberIds = clubbers.map(c => c.id).join('","')
      const records = await pb.collection("clubber_registrations").getFullList<RegistrationExpanded>({
        filter: `clubber.id ?~ ["${clubberIds}"]`,
        expand: "clubber,club_year,program",
        requestKey: `${requestKey}_registrations`,
      })
      return records
    },
    [clubbers?.map(c => c.id).join(','), currentClub?.id],
    { enabled: !!currentClub && !!clubbers?.length && (isAdmin || isActiveLeader) }
  )

  // Group registrations by clubber
  const getRegistrationsForClubber = (clubberId: string) => {
    return registrations?.filter(r => r.clubber === clubberId || r.expand?.clubber?.id === clubberId) || []
  }

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
          {isLoadingClubbers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !clubbers || clubbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center mb-4">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <Baby className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <p>{t("No clubbers found for this club.")}</p>
              <p className="text-sm mt-2">
                {t("Add clubbers to track their progress in Awana programs.")}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Guardian")}</TableHead>
                    <TableHead>{t("Programs")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubbers.map((clubber) => {
                    const guardian = clubber.expand?.guardian
                    const clubberRegs = getRegistrationsForClubber(clubber.id)
                    const hasRegistrations = clubberRegs.length > 0
                    const initials = `${clubber.firstName.charAt(0)}${clubber.lastName.charAt(0)}`.toUpperCase()

                    return (
                      <TableRow key={clubber.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">
                                {clubber.firstName} {clubber.lastName}
                              </span>
                              {clubber.dateOfBirth && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(clubber.dateOfBirth).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {guardian ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {guardian.displayName || guardian.name || guardian.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              {t("No guardian")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hasRegistrations ? (
                              clubberRegs.map((reg) => (
                                <Badge key={reg.id} variant="secondary" className="text-xs">
                                  {reg.expand?.program?.name || t("Unknown Program")}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                {t("Not registered")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasRegistrations ? "default" : "outline"} className="text-xs">
                            {hasRegistrations ? t("Active") : t("Unregistered")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

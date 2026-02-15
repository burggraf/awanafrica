import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { usePBQuery } from "@/hooks/use-pb-query"
import { pb } from "@/lib/pb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersRound, Plus, AlertCircle, Loader2, Baby, ChevronLeft, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { ClubMembershipsResponse, UsersResponse, ClubbersResponse, ClubberRegistrationsResponse, ProgramsResponse, ClubYearsResponse } from "@/types/pocketbase-types"

type MembershipExpanded = ClubMembershipsResponse<{
  user: UsersResponse;
}>

type ClubberExpanded = ClubbersResponse<{
  guardian: UsersResponse;
}>

type RegistrationExpanded = ClubberRegistrationsResponse<{
  clubber: ClubbersResponse;
  club_year: ClubYearsResponse;
  program: ProgramsResponse;
}>

interface GuardianWithClubbers {
  user: UsersResponse;
  membership: MembershipExpanded;
  clubbers: ClubberExpanded[];
}

export function GuardiansPage() {
  const { t } = useTranslation()
  const { currentClub, isActiveLeader } = useClubs()
  const { isAdmin } = useAdmin()
  const [selectedGuardian, setSelectedGuardian] = useState<GuardianWithClubbers | null>(null)

  // Fetch all memberships for the current club
  const { data: memberships, isLoading: isLoadingMemberships } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return []
      const records = await pb.collection("club_memberships").getFullList<MembershipExpanded>({
        filter: `club = "${currentClub.id}"`,
        expand: "user",
        requestKey: `${requestKey}_memberships`,
      })
      return records
    },
    [currentClub?.id],
    { enabled: !!currentClub && (isAdmin || isActiveLeader) }
  )

  // Filter to only show guardians (users with Guardian role)
  const guardians = memberships?.filter((m) => {
    const roles = m.roles || []
    return roles.includes("Guardian")
  }) || []

  // Get unique guardian users (a user might have multiple memberships)
  const uniqueGuardianUsers = guardians.reduce((acc, membership) => {
    const user = membership.expand?.user
    if (user && !acc.find(u => u.id === user.id)) {
      acc.push(user)
    }
    return acc
  }, [] as UsersResponse[])

  // Fetch ALL clubbers for the current club (with guardian expanded)
  const { data: allClubbers, isLoading: isLoadingClubbers } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return []
      const records = await pb.collection("clubbers").getFullList<ClubberExpanded>({
        filter: `club = "${currentClub.id}"`,
        expand: "guardian",
        requestKey: `${requestKey}_clubbers`,
      })
      return records
    },
    [currentClub?.id],
    { enabled: !!currentClub && (isAdmin || isActiveLeader) }
  )

  // Build guardian data with their clubbers
  const guardiansWithClubbers: GuardianWithClubbers[] = uniqueGuardianUsers.map(user => {
    const membership = guardians.find(g => g.expand?.user?.id === user.id)!
    // Match clubbers where guardian id matches
    const userClubbers = allClubbers?.filter(c => 
      c.guardian === user.id || c.expand?.guardian?.id === user.id
    ) || []
    return { user, membership, clubbers: userClubbers }
  })

  // Fetch registrations for selected guardian's clubbers
  const selectedGuardianClubberIds = selectedGuardian?.clubbers.map(c => c.id) || []
  const { data: registrations } = usePBQuery(
    async ({ requestKey }) => {
      if (selectedGuardianClubberIds.length === 0) return []
      const idsFilter = selectedGuardianClubberIds.join('","')
      const records = await pb.collection("clubber_registrations").getFullList<RegistrationExpanded>({
        filter: `clubber.id ?~ ["${idsFilter}"]`,
        expand: "clubber,club_year,program",
        requestKey: `${requestKey}_registrations`,
      })
      return records
    },
    [selectedGuardianClubberIds.join(',')],
    { enabled: selectedGuardianClubberIds.length > 0 }
  )

  const getRegistrationsForClubber = (clubberId: string) => {
    return registrations?.filter(r => 
      r.clubber === clubberId || r.expand?.clubber?.id === clubberId
    ) || []
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
          <span>{t("Please select a club to view guardians.")}</span>
        </div>
      </div>
    )
  }

  const isLoading = isLoadingMemberships || isLoadingClubbers

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UsersRound className="h-6 w-6" />
            {t("Guardians")}
          </h2>
          {currentClub && (
            <p className="text-muted-foreground">
              {t("Managing guardians for")} {currentClub.name}
            </p>
          )}
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Guardian")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Club Guardians")}</CardTitle>
          <CardDescription>
            {t("View and manage guardians for this club. Click a guardian to view their children.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : guardiansWithClubbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex justify-center mb-4">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                  <UsersRound className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <p>{t("No guardians found for this club.")}</p>
              <p className="text-sm mt-2">
                {t("Add guardians to manage clubber registrations.")}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Guardian")}</TableHead>
                    <TableHead>{t("Contact")}</TableHead>
                    <TableHead>{t("Children")}</TableHead>
                    <TableHead>{t("Roles")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guardiansWithClubbers.map(({ user, membership, clubbers }) => {
                    const clubberCount = clubbers.length
                    const guardianRoles = (membership.roles || []).filter(r => r !== "Guardian")
                    const hasDualRole = guardianRoles.length > 0

                    return (
                      <TableRow 
                        key={user.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedGuardian({ user, membership, clubbers })}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar ? pb.files.getUrl(user, user.avatar) : undefined}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {user.displayName?.charAt(0) || user.name?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">
                                {user.displayName || user.name || t("Unnamed")}
                              </span>
                              {hasDualRole && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {t("Also Leader")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user.email}</p>
                            {user.phone && (
                              <p className="text-muted-foreground text-xs">{user.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Baby className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {clubberCount} {clubberCount === 1 ? t("child") : t("children")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {t("Guardian")}
                            </Badge>
                            {guardianRoles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {t(role)}
                              </Badge>
                            ))}
                          </div>
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

      {/* Guardian Detail Dialog */}
      <Dialog open={!!selectedGuardian} onOpenChange={() => setSelectedGuardian(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGuardian && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -ml-2"
                    onClick={() => setSelectedGuardian(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedGuardian.user.avatar ? pb.files.getUrl(selectedGuardian.user, selectedGuardian.user.avatar) : undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {selectedGuardian.user.displayName?.charAt(0) || selectedGuardian.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>
                      {selectedGuardian.user.displayName || selectedGuardian.user.name || t("Unnamed")}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedGuardian.user.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Baby className="h-4 w-4" />
                  <span>
                    {selectedGuardian.clubbers.length} {selectedGuardian.clubbers.length === 1 ? t("child") : t("children")} {t("registered")}
                  </span>
                </div>

                {selectedGuardian.clubbers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Baby className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t("No children registered for this guardian.")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedGuardian.clubbers.map((clubber) => {
                      const initials = `${clubber.firstName.charAt(0)}${clubber.lastName.charAt(0)}`.toUpperCase()
                      const clubberRegs = getRegistrationsForClubber(clubber.id)
                      const hasRegistrations = clubberRegs.length > 0

                      return (
                        <Card key={clubber.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">
                                  {clubber.firstName} {clubber.lastName}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  {clubber.dateOfBirth && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(clubber.dateOfBirth).toLocaleDateString()}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {hasRegistrations ? (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">{t("Programs")}:</p>
                                <div className="flex flex-wrap gap-2">
                                  {clubberRegs.map((reg) => (
                                    <Badge key={reg.id} variant="secondary">
                                      {reg.expand?.program?.name || t("Unknown Program")}
                                      {reg.expand?.club_year?.label && (
                                        <span className="ml-1 text-xs opacity-70">
                                          ({reg.expand.club_year.label})
                                        </span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {t("Not registered for any programs.")}
                              </p>
                            )}
                            {clubber.notes && (
                              <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                                <span className="font-medium">{t("Notes")}:</span> {clubber.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

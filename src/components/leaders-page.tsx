import { useTranslation } from "react-i18next"
import { useClubs } from "@/lib/club-context"
import { useAdmin } from "@/lib/admin-context"
import { usePBQuery } from "@/hooks/use-pb-query"
import { pb } from "@/lib/pb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCog, Plus, AlertCircle, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/use-auth"
import type { ClubMembershipsResponse, UsersResponse } from "@/types/pocketbase-types"

type MembershipExpanded = ClubMembershipsResponse<{
  user: UsersResponse;
}>

const AVAILABLE_ROLES = ["Director", "Secretary", "Treasurer", "Leader", "Pending"] as const

export function LeadersPage() {
  const { t } = useTranslation()
  const { currentClub, isActiveLeader, currentClubRoles } = useClubs()
  const { isAdmin } = useAdmin()
  const { user } = useAuth()
  const { toast } = useToast()

  // Check if current user is a Director in the current club
  const isDirector = currentClubRoles.includes("Director")

  const { data: memberships, isLoading, refetch } = usePBQuery(
    async ({ requestKey }) => {
      if (!currentClub) return []
      const records = await pb.collection("club_memberships").getFullList<MembershipExpanded>({
        filter: `club = "${currentClub.id}"`,
        expand: "user",
        requestKey: `${requestKey}_leaders`,
      })
      return records
    },
    [currentClub?.id],
    { enabled: !!currentClub }
  )

  const handleRoleChange = async (membershipId: string, newRole: string) => {
    try {
      await pb.collection("club_memberships").update(membershipId, {
        roles: [newRole],
      })
      toast({
        title: t("Success"),
        description: t("Role updated successfully"),
      })
      refetch()
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update role"),
        variant: "destructive",
      })
    }
  }

  // Filter to only show members who have at least one non-Guardian role
  const leaders = memberships?.filter((m) => {
    const roles = m.roles || []
    // Include if they have any role other than just "Guardian"
    return roles.some((r) => r !== "Guardian")
  }) || []

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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("No leaders found for this club.")}</p>
              <p className="text-sm mt-2">
                {t("Add leaders to help manage club activities.")}
              </p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("User")}</TableHead>
                    <TableHead>{t("Email")}</TableHead>
                    <TableHead>{t("Roles")}</TableHead>
                    {isDirector && <TableHead>{t("Manage Role")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((leader) => {
                    const leaderUser = leader.expand?.user
                    const leaderRoles = (leader.roles || []).filter((r) => r !== "Guardian")
                    // Don't allow changing own role to prevent locking yourself out
                    const canManageRole = isDirector && leaderUser?.id !== user?.id
                    // Get the primary role for the select (first non-Guardian role, or Pending)
                    const currentRole = leaderRoles[0] || "Pending"

                    return (
                      <TableRow key={leader.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={leaderUser?.avatar ? pb.files.getUrl(leaderUser, leaderUser.avatar) : undefined}
                                className="object-cover"
                              />
                              <AvatarFallback>{leaderUser?.name?.charAt(0) || leaderUser?.displayName?.charAt(0) || "?"}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {leaderUser?.displayName || leaderUser?.name || t("Unknown User")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{leaderUser?.email || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {leaderRoles.map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {t(role)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        {isDirector && (
                          <TableCell>
                            {canManageRole ? (
                              <Select
                                value={currentRole}
                                onValueChange={(value) => handleRoleChange(leader.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AVAILABLE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {t(role)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                {t("You")}
                              </span>
                            )}
                          </TableCell>
                        )}
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

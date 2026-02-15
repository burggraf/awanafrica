import { useState } from "react";
import { useTranslation } from "react-i18next";
import { pb } from "@/lib/pb";
import { usePBQuery } from "@/hooks/use-pb-query";
import { 
  type ClubMembershipsResponse, 
  type UsersResponse
} from "@/types/pocketbase-types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClubMembersManagerProps {
  clubId: string;
}

type MembershipExpanded = ClubMembershipsResponse<{
  user: UsersResponse;
}>;

const AVAILABLE_ROLES = [
  "Director",
  "Secretary",
  "Treasurer",
  "Leader",
  "Guardian",
  "Pending"
] as const;

export function ClubMembersManager({ clubId }: ClubMembersManagerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = usePBQuery(
    async ({ requestKey }) => {
      const records = await pb.collection("club_memberships").getFullList<MembershipExpanded>({
        filter: `club = "${clubId}"`,
        expand: "user",
        requestKey: `${requestKey}_members`,
      });
      return records;
    },
    [clubId]
  );
  
  const memberships = data || [];

  const handleRoleChange = async (membershipId: string, role: typeof AVAILABLE_ROLES[number], checked: boolean) => {
    setUpdatingId(membershipId);
    try {
      const membership = memberships.find(m => m.id === membershipId);
      if (!membership) return;

      let newRoles = [...(membership.roles || [])];
      
      if (checked) {
        if (!newRoles.includes(role)) {
          newRoles.push(role);
        }
      } else {
        newRoles = newRoles.filter(r => r !== role);
      }

      // If removing all roles, maybe we should warn or delete the membership?
      // For now, let's just allow empty roles or maybe require at least "Pending"?
      // Actually, standard practice might be to leave it empty or remove the user.
      // Let's just update for now.

      await pb.collection("club_memberships").update(membershipId, {
        roles: newRoles
      });

      toast({
        title: t("Success"),
        description: t("Roles updated successfully"),
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update roles"),
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const removeMember = async (membershipId: string) => {
    if (!confirm(t("Are you sure you want to remove this member from the club?"))) return;
    
    setUpdatingId(membershipId);
    try {
      await pb.collection("club_memberships").delete(membershipId);
      toast({
        title: t("Success"),
        description: t("Member removed successfully"),
      });
      refetch();
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to remove member"),
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("User")}</TableHead>
              <TableHead>{t("Email")}</TableHead>
              <TableHead>{t("Roles")}</TableHead>
              <TableHead className="text-right">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t("No members found for this club")}
                </TableCell>
              </TableRow>
            ) : (
              memberships.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={member.expand?.user?.avatar ? pb.files.getUrl(member.expand?.user, member.expand?.user.avatar) : undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback>{member.expand?.user?.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {member.expand?.user?.displayName || member.expand?.user?.name || t("Unknown User")}
                    </span>
                  </TableCell>
                  <TableCell>{member.expand?.user?.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {t(role)}
                        </Badge>
                      ))}
                      {(!member.roles || member.roles.length === 0) && (
                        <span className="text-muted-foreground text-xs italic">{t("No roles")}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={updatingId === member.id}>
                            {updatingId === member.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t("Edit Roles")}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("Assign Roles")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {AVAILABLE_ROLES.map((role) => (
                            <DropdownMenuCheckboxItem
                              key={role}
                              checked={member.roles?.includes(role)}
                              onCheckedChange={(checked) => handleRoleChange(member.id, role, checked)}
                            >
                              {t(role)}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => removeMember(member.id)}
                        disabled={updatingId === member.id}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
